import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface EntropyBreakdown {
  signalName: string;
  value: string;
  entropy: number;
  uniquenessScore: number;
  populationEstimate: string;
  weight: number;
  contributionScore: number;
  existsInSchema?: boolean;
  existsInDatabase?: boolean;
  source?: string;
  processingTime?: number;
  status?: string;
}

export class EntropyService {
  
  /**
   * Resolve a signal's value from either a column or nested rawJson payload.
   */
  private static getSignalValue(record: any, name: string): string {
    // 1. Check if the property is a direct database column
    if (name in record) {
      return String(record[name] ?? 'Unknown');
    }
    
    // 2. Fallback to nested JSON resolution
    const raw = record.rawJson as any;
    if (!raw) return 'Unknown';

    if (name === 'timezone') return raw.localization?.timezone || 'Unknown';
    if (name === 'language') return raw.localization?.language || 'Unknown';
    if (name === 'platform') return raw.os?.architecture || 'Unknown';
    if (name === 'screenResolution') return raw.display ? `${raw.display.screenWidth}x${raw.display.screenHeight}` : 'Unknown';
    if (name === 'userAgent') return raw.browser?.userAgent || 'Unknown';
    
    return 'Unknown';
  }

  /**
   * Calculate Shannon Entropy and statistical significance for a specific visit's signals.
   * Leverages in-memory processing to resolve Case B and avoid unnecessary database migrations.
   */
  public static async calculateEntropy(signals: {
    browserName: string;
    osName: string;
    deviceType: string;
    timezone: string;
    language: string;
    canvasHash: string;
    webglRenderer: string;
    audioHash: string;
    fontsHash: string;
    browserVersion?: string;
    osVersion?: string;
    platform?: string;
    screenResolution?: string;
    webglVendor?: string;
    userAgent?: string;
  }): Promise<{
    breakdown: EntropyBreakdown[];
    totalEntropy: number;
    uniquenessScore: number;
    strength: string;
    populationMatchEstimate: string;
  }> {
    
    // Fetch valid database columns dynamically from generated Prisma Client metadata
    const validFields = Object.values(Prisma.SignalScalarFieldEnum) as string[];

    // Seeded reference data when DB is empty or very small
    const defaults: Record<string, { entropy: number; p: number }> = {
      browserName: { entropy: 2.15, p: 0.35 },
      browserVersion: { entropy: 3.52, p: 0.10 },
      osName: { entropy: 2.54, p: 0.40 },
      osVersion: { entropy: 2.85, p: 0.25 },
      deviceType: { entropy: 0.98, p: 0.65 },
      timezone: { entropy: 3.12, p: 0.15 },
      language: { entropy: 2.85, p: 0.45 },
      platform: { entropy: 1.85, p: 0.30 },
      screenResolution: { entropy: 3.25, p: 0.12 },
      canvasHash: { entropy: 8.92, p: 0.005 },
      webglVendor: { entropy: 5.45, p: 0.05 },
      webglRenderer: { entropy: 8.15, p: 0.01 },
      audioHash: { entropy: 6.45, p: 0.015 },
      fontsHash: { entropy: 7.21, p: 0.008 },
      userAgent: { entropy: 9.85, p: 0.002 }
    };

    const breakdown: EntropyBreakdown[] = [];
    let accumulatedEntropy = 0;
    
    // Fetch all signal records from database using a single, efficient query
    let allSignals: any[] = [];
    let totalVisits = 0;
    try {
      allSignals = await prisma.signal.findMany({
        select: {
          browserName: true,
          browserVersion: true,
          osName: true,
          osVersion: true,
          deviceType: true,
          canvasHash: true,
          webglVendor: true,
          webglRenderer: true,
          audioHash: true,
          fontsHash: true,
          rawJson: true
        }
      });
      totalVisits = allSignals.length;
    } catch (err: any) {
      console.error('[ENTROPY SERVICE] Error loading database signals:', err);
    }

    const keys = Object.keys(signals) as Array<keyof typeof signals>;

    for (const key of keys) {
      const val = signals[key];
      let p = 0;
      let entropy = 0;
      let existsInSchema = false;
      let existsInDatabase = false;
      let source = 'Nested JSON';
      let status = 'Calculated (JSON)';
      const startTime = performance.now();

      try {
        existsInSchema = validFields.includes(key);
        existsInDatabase = existsInSchema; // direct mapping in SQLite
        source = existsInSchema ? 'Prisma Column' : 'Nested JSON';

        if (totalVisits > 5) {
          // Extract values dynamically for this signal from in-memory records
          const valuesList = allSignals.map(r => this.getSignalValue(r, key));
          
          // Compute value occurrences count
          const valueCounts: Record<string, number> = {};
          for (const v of valuesList) {
            valueCounts[v] = (valueCounts[v] || 0) + 1;
          }

          // Count matching values for current client
          const matchingCount = valueCounts[String(val)] || 0;
          const adjustedMatchingCount = Math.max(1, matchingCount);
          p = adjustedMatchingCount / Math.max(1, totalVisits);

          // Shannon entropy: H(X) = -sum( P(x) * log2(P(x)) )
          entropy = 0;
          for (const count of Object.values(valueCounts)) {
            const probability = count / totalVisits;
            entropy -= probability * Math.log2(probability);
          }

          entropy = Math.max(0.1, Number(entropy.toFixed(2)));
          status = existsInSchema ? 'Calculated' : 'Calculated (JSON)';
        } else {
          // Fallback to seeded configurations
          entropy = defaults[key]?.entropy || 4.0;
          p = defaults[key]?.p || 0.1;
          status = 'Seeded Fallback';
        }
      } catch (err: any) {
        // SCAN SURVIVAL MODE: Never let a single signal crash the scan
        console.warn(`[ENTROPY WARNING] Failed calculation for signal "${key}": ${err.message}`);
        entropy = defaults[key]?.entropy || 4.0;
        p = defaults[key]?.p || 0.1;
        status = 'Error Fallback';
      }

      const endTime = performance.now();
      const processingTime = Number((endTime - startTime).toFixed(2));

      // Uniqueness calculations
      const uniquenessScore = Number(((1 - p) * 100).toFixed(1));
      const matchRatio = Math.round(1 / p);
      const populationEstimate = matchRatio > 1 
        ? `1 in ${matchRatio.toLocaleString()} users` 
        : 'Common across all users';
      
      // Calculate weights
      let weight = 1.0;
      if (key === 'canvasHash' || key === 'fontsHash' || key === 'webglRenderer') weight = 2.0;
      if (key === 'deviceType') weight = 0.5;

      const contributionScore = Number((entropy * weight).toFixed(2));

      breakdown.push({
        signalName: key,
        value: String(val ?? 'Unknown'),
        entropy,
        uniquenessScore,
        populationEstimate,
        weight,
        contributionScore,
        existsInSchema,
        existsInDatabase,
        source,
        processingTime,
        status
      });

      accumulatedEntropy += entropy;
    }

    const totalEntropy = Number(accumulatedEntropy.toFixed(2));

    // Uniqueness calculations
    const uniquenessScore = Math.min(99.9, Number((100 - (100 / Math.pow(2, totalEntropy - 10))).toFixed(2)));
    
    let strength = 'Low';
    if (totalEntropy > 15) strength = 'Weak';
    if (totalEntropy > 25) strength = 'Moderate';
    if (totalEntropy > 35) strength = 'Strong';
    if (totalEntropy > 45) strength = 'Very Strong';

    const globalMatch = Math.round(Math.pow(2, totalEntropy));
    const populationMatchEstimate = globalMatch > 1000000 
      ? `1 in ${Math.round(globalMatch / 1000000)}M+ users` 
      : `1 in ${globalMatch.toLocaleString()} users`;

    // Cache computed entropy results back to database safely
    for (const item of breakdown) {
      if (validFields.includes(item.signalName)) {
        try {
          await prisma.entropyScore.upsert({
            where: { signalName: item.signalName },
            update: {
              shannonEntropy: item.entropy,
              uniquenessScore: item.uniquenessScore,
              populationEstimate: item.populationEstimate
            },
            create: {
              signalName: item.signalName,
              shannonEntropy: item.entropy,
              uniquenessScore: item.uniquenessScore,
              populationEstimate: item.populationEstimate
            }
          });
        } catch (dbErr: any) {
          console.warn(`[ENTROPY CACHE WARNING] Failed to cache score for ${item.signalName}:`, dbErr.message);
        }
      }
    }

    return {
      breakdown,
      totalEntropy,
      uniquenessScore,
      strength,
      populationMatchEstimate
    };
  }
}
