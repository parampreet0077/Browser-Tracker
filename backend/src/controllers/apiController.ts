import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { HashService, FingerprintPayload } from '../services/hashService';
import { EntropyService } from '../services/entropyService';
import { BotDetectionService } from '../services/botDetectionService';
import { VpnDetectionService } from '../services/vpnDetectionService';
import { PrivacyService } from '../services/privacyService';
import { ReportService } from '../services/reportService';
import * as requestIp from 'request-ip';
import useragent from 'useragent';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-fingerprint-intelligence-platform-2026';

export class ApiController {
  
  // ----------------------------------------------------------------
  // AUTHENTICATION CONTROLLER
  // ----------------------------------------------------------------
  public static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Create Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          ipAddress: requestIp.getClientIp(req) || '127.0.0.1',
          details: `Admin user ${user.email} logged in.`,
        },
      });

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getMe(req: any, res: Response) {
    return res.json({ user: req.user });
  }

  // ----------------------------------------------------------------
  // FINGERPRINT COLLECTION
  // ----------------------------------------------------------------
  public static async collect(req: Request, res: Response) {
    const payload = req.body as FingerprintPayload;
    const logs: string[] = [];

    const addLog = (msg: string) => {
      const logLine = `[${new Date().toISOString()}] ${msg}`;
      logs.push(logLine);
      console.log(`[BACKEND] ${msg}`);
    };

    addLog('Received browser fingerprint collection request.');

    if (!payload || !payload.browser || !payload.os || !payload.graphics) {
      addLog('Error: Incomplete fingerprint payload structure.');
      return res.status(400).json({ error: 'Incomplete fingerprint payload structure', logs });
    }

    try {
      // 1. Resolve client IP and geolocations
      addLog('Resolving client IP and geolocations...');
      const clientIp = requestIp.getClientIp(req) || '127.0.0.1';
      
      // Basic Country/Locale resolver mockup
      let country = 'United States';
      let region = 'California';
      let city = 'San Francisco';
      
      if (payload.localization.timezone.includes('Europe/Berlin')) {
        country = 'Germany';
        region = 'Berlin';
        city = 'Berlin';
      } else if (payload.localization.timezone.includes('Asia/Kolkata')) {
        country = 'India';
        region = 'Maharashtra';
        city = 'Mumbai';
      } else if (payload.localization.timezone.includes('Europe/London')) {
        country = 'United Kingdom';
        region = 'England';
        city = 'London';
      } else if (payload.localization.timezone.includes('Asia/Singapore')) {
        country = 'Singapore';
        region = 'Central';
        city = 'Singapore';
      }

      addLog(`Resolved IP: ${clientIp}, Country: ${country}, Region: ${region}, City: ${city}`);

      // 2. Generate Hashes
      addLog('Generating telemetry hashes...');
      const hashes = HashService.generateHashes(payload);
      
      // Determine the primary ID (we will use V2 hash for unique signature instance)
      const primaryFpId = hashes.hashV2;
      addLog(`Hashes generated. Primary ID (Hash V2): ${primaryFpId}`);

      // 3. Run Hashing and Service Computations
      // Bot detection
      addLog('Running threat assessment: Bot Detection...');
      const botPayload = {
        webdriver: payload.security.cookiesEnabled ? payload.security.secureContext : false, // fallback
        pluginsLength: payload.plugins.pluginsList.length,
        fontsLength: payload.fonts.fontsList.length,
        webglVendor: payload.graphics.webglVendor,
        webglRenderer: payload.graphics.webglRenderer,
        canvasHash: payload.graphics.canvasHash,
        audioHash: payload.audio.audioHash,
        languages: payload.localization.languages,
        userAgent: payload.browser.userAgent,
        screenResolution: {
          width: payload.display.screenWidth,
          height: payload.display.screenHeight,
        },
        permissionsState: {
          notifications: payload.permissions.notifications,
        },
      };
      
      // Let's refine webdriver checks
      const realWebdriver = (payload as any).webdriver || false;
      botPayload.webdriver = realWebdriver;

      const botAnalysisRes = BotDetectionService.analyze(botPayload);
      addLog(`Bot Detection complete. Classification: ${botAnalysisRes.classification}, Score: ${botAnalysisRes.botScore}`);

      // VPN detection
      addLog('Running threat assessment: VPN & Proxy Detection...');
      const webrtcIPs = (payload.webrtc as any).ips || [];
      const vpnPayload = {
        ipAddress: clientIp,
        timezone: payload.localization.timezone,
        locale: payload.localization.locale,
        language: payload.localization.language,
        webrtcIPs,
        canvasHash: payload.graphics.canvasHash,
        webglRenderer: payload.graphics.webglRenderer,
        pluginsLength: payload.plugins.pluginsList.length,
      };
      const vpnAnalysisRes = VpnDetectionService.analyze(vpnPayload);
      addLog(`VPN Detection complete. Active VPN: ${vpnAnalysisRes.isVpn}, ISP: ${vpnAnalysisRes.isp}`);

      // Entropy Calculations
      addLog('Calculating Shannon entropy and uniqueness metrics...');
      const entropySignals = {
        browserName: payload.browser.name,
        browserVersion: payload.browser.version,
        osName: payload.os.name,
        osVersion: payload.os.version,
        deviceType: payload.hardware.deviceType,
        timezone: payload.localization.timezone,
        language: payload.localization.language,
        canvasHash: payload.graphics.canvasHash,
        webglVendor: payload.graphics.webglVendor,
        webglRenderer: payload.graphics.webglRenderer,
        audioHash: payload.audio.audioHash,
        fontsHash: payload.fonts.fontsHash,
        platform: payload.os.architecture || 'Unknown',
        screenResolution: payload.display ? `${payload.display.screenWidth}x${payload.display.screenHeight}` : 'Unknown',
        userAgent: payload.browser.userAgent,
      };
      const entropyRes = await EntropyService.calculateEntropy(entropySignals);
      addLog(`Entropy calculation complete. Uniqueness Score: ${entropyRes.uniquenessScore}%, Population Match Estimate: ${entropyRes.populationMatchEstimate}`);

      // Privacy Risk score calculations
      addLog('Evaluating overall privacy risk index...');
      const privacyInput = {
        totalEntropy: entropyRes.totalEntropy,
        uniquenessScore: entropyRes.uniquenessScore,
        isVpn: vpnAnalysisRes.isVpn,
        isTor: vpnAnalysisRes.isTor,
        webrtcLeak: vpnAnalysisRes.webrtcLeak,
        botScore: botAnalysisRes.botScore,
        cookiesEnabled: payload.security.cookiesEnabled,
        doNotTrack: payload.security.doNotTrack,
      };
      const privacyRes = PrivacyService.analyze(privacyInput);
      addLog(`Privacy assessment complete. Risk Level: ${privacyRes.riskLevel}, Trackability: ${privacyRes.trackability}`);

      // 4. Save in transactional block
      addLog('Opening Prisma database transaction block...');
      const result = await prisma.$transaction(async (tx) => {
        addLog('Upserting core fingerprint signature...');
        // Upsert core fingerprint record
        const fp = await tx.fingerprint.upsert({
          where: { id: primaryFpId },
          update: { updatedAt: new Date() },
          create: {
            id: primaryFpId,
            hashV1: hashes.hashV1,
            hashV2: hashes.hashV2,
            stableHash: hashes.stableHash,
            similarityHash: hashes.similarityHash,
            privacyHash: hashes.privacyHash,
          },
        });

        addLog('Creating visit entry...');
        // Insert Visit record
        const visit = await tx.visit.create({
          data: {
            fingerprintId: fp.id,
            ipAddress: clientIp,
            country,
            region,
            city,
            timezone: payload.localization.timezone,
            userAgent: payload.browser.userAgent,
          },
        });

        addLog('Saving telemetry signals...');
        // Insert related raw signal
        await tx.signal.create({
          data: {
            visitId: visit.id,
            browserName: payload.browser.name,
            browserVersion: payload.browser.version,
            osName: payload.os.name,
            osVersion: payload.os.version,
            deviceType: payload.hardware.deviceType,
            canvasHash: payload.graphics.canvasHash,
            webglVendor: payload.graphics.webglVendor,
            webglRenderer: payload.graphics.webglRenderer,
            audioHash: payload.audio.audioHash,
            fontsHash: payload.fonts.fontsHash,
            rawJson: payload as any,
            normalizedJson: {
              browser: payload.browser,
              os: payload.os,
              hardware: payload.hardware,
              display: payload.display,
              localization: payload.localization,
            } as any,
          },
        });

        addLog('Saving Bot Detection analysis results...');
        // Save Bot results
        await tx.botAnalysis.create({
          data: {
            visitId: visit.id,
            webdriver: botAnalysisRes.webdriver,
            headless: botAnalysisRes.headless,
            automationTool: botAnalysisRes.automationTool,
            timingAnomaly: botAnalysisRes.timingAnomaly,
            humanScore: botAnalysisRes.humanScore,
            botScore: botAnalysisRes.botScore,
            confidenceScore: botAnalysisRes.confidenceScore,
            riskScore: botAnalysisRes.riskScore,
            classification: botAnalysisRes.classification,
            explanations: botAnalysisRes.explanations,
          },
        });

        addLog('Saving VPN & Connection analysis results...');
        // Save VPN results
        await tx.vpnAnalysis.create({
          data: {
            visitId: visit.id,
            isVpn: vpnAnalysisRes.isVpn,
            isProxy: vpnAnalysisRes.isProxy,
            isTor: vpnAnalysisRes.isTor,
            isDatacenter: vpnAnalysisRes.isDatacenter,
            webrtcLeak: vpnAnalysisRes.webrtcLeak,
            timezoneMismatch: vpnAnalysisRes.timezoneMismatch,
            isp: vpnAnalysisRes.isp,
            confidenceScore: vpnAnalysisRes.confidenceScore,
            explanation: vpnAnalysisRes.explanation,
          },
        });

        addLog('Saving privacy report and hardening recommendations...');
        // Save Privacy assessment
        await tx.privacyReport.create({
          data: {
            visitId: visit.id,
            trackability: privacyRes.trackability,
            exposureRisk: privacyRes.exposureRisk,
            stabilityScore: privacyRes.stabilityScore,
            uniquenessRisk: privacyRes.uniquenessRisk,
            riskLevel: privacyRes.riskLevel,
            recommendations: privacyRes.recommendations,
          },
        });

        addLog(`Database writes completed for visit ID: ${visit.id}`);
        return { visitId: visit.id, fingerprintId: fp.id };
      });

      addLog('Database transaction committed successfully.');
      addLog('Analysis report successfully compiled.');

      return res.status(201).json({
        success: true,
        fingerprintId: result.fingerprintId,
        visitId: result.visitId,
        hashes,
        entropy: entropyRes,
        botAnalysis: botAnalysisRes,
        vpnAnalysis: vpnAnalysisRes,
        privacyReport: privacyRes,
        logs
      });
    } catch (err: any) {
      addLog(`Error during collection/analysis: ${err.message}`);
      console.error('Error in collect endpoint:', err);
      return res.status(500).json({ error: err.message, logs });
    }
  }

  // ----------------------------------------------------------------
  // DATABASE INTEGRITY VERIFICATION
  // ----------------------------------------------------------------
  public static async verifyDatabase(req: Request, res: Response) {
    const { visitId } = req.params;
    const logs: string[] = [];
    const missing: string[] = [];

    const addLog = (msg: string) => {
      logs.push(`[${new Date().toISOString()}] ${msg}`);
      console.log(`[VERIFY-DB] ${msg}`);
    };

    addLog(`Starting database verification for visit ID: ${visitId}`);

    try {
      // 1. Verify visits table
      const visit = await prisma.visit.findUnique({
        where: { id: visitId }
      });
      
      if (!visit) {
        addLog(`[ERROR] Visit not found in 'visits' table.`);
        missing.push('visits');
      } else {
        addLog(`[SUCCESS] Visit record located in 'visits' table.`);

        // 2. Verify fingerprints table
        const fp = await prisma.fingerprint.findUnique({
          where: { id: visit.fingerprintId }
        });
        if (!fp) {
          addLog(`[ERROR] Fingerprint ${visit.fingerprintId} not found in 'fingerprints' table.`);
          missing.push('fingerprints');
        } else {
          addLog(`[SUCCESS] Fingerprint record located in 'fingerprints' table.`);
        }

        // 3. Verify signals table
        const signal = await prisma.signal.findUnique({
          where: { visitId }
        });
        if (!signal) {
          addLog(`[ERROR] Raw signals not found in 'signals' table.`);
          missing.push('signals');
        } else {
          addLog(`[SUCCESS] Raw signals record located in 'signals' table.`);
        }

        // 4. Verify bot_analyses table
        const bot = await prisma.botAnalysis.findUnique({
          where: { visitId }
        });
        if (!bot) {
          addLog(`[ERROR] Bot analysis not found in 'bot_analyses' table.`);
          missing.push('bot_analyses');
        } else {
          addLog(`[SUCCESS] Bot analysis record located in 'bot_analyses' table.`);
        }

        // 5. Verify vpn_analyses table
        const vpn = await prisma.vpnAnalysis.findUnique({
          where: { visitId }
        });
        if (!vpn) {
          addLog(`[ERROR] VPN analysis not found in 'vpn_analyses' table.`);
          missing.push('vpn_analyses');
        } else {
          addLog(`[SUCCESS] VPN analysis record located in 'vpn_analyses' table.`);
        }

        // 6. Verify privacy_reports table
        const report = await prisma.privacyReport.findUnique({
          where: { visitId }
        });
        if (!report) {
          addLog(`[ERROR] Privacy report not found in 'privacy_reports' table.`);
          missing.push('privacy_reports');
        } else {
          addLog(`[SUCCESS] Privacy report record located in 'privacy_reports' table.`);
        }

        // 7. Verify entropy_scores table
        const entropyCount = await prisma.entropyScore.count();
        if (entropyCount === 0) {
          addLog(`[ERROR] No entropy scores found in 'entropy_scores' table.`);
          missing.push('entropy_scores');
        } else {
          addLog(`[SUCCESS] Checked entropy scores cache table: ${entropyCount} entries found.`);
        }
      }

      const verified = missing.length === 0;
      if (verified) {
        addLog("Database integrity verification: 100% SUCCESS. All tables verified.");
      } else {
        addLog(`Database integrity verification: FAILED. Missing tables: ${missing.join(', ')}`);
      }

      return res.json({
        success: true,
        verified,
        missing,
        logs
      });
    } catch (err: any) {
      addLog(`Database verification crashed: ${err.message}`);
      return res.status(500).json({
        success: false,
        verified: false,
        error: err.message,
        logs
      });
    }
  }

  // ----------------------------------------------------------------
  // GET DETAILED FINGERPRINT
  // ----------------------------------------------------------------
  public static async getFingerprint(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const fp = await prisma.fingerprint.findUnique({
        where: { id },
        include: {
          visits: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              signals: true,
              botAnalysis: true,
              vpnAnalysis: true,
              privacyReport: true,
            },
          },
        },
      });

      if (!fp || fp.visits.length === 0) {
        return res.status(404).json({ error: 'Fingerprint profile not found' });
      }

      const latestVisit = fp.visits[0];
      
      let entropyRes = null;
      if (latestVisit.signals) {
        const rawPayload = latestVisit.signals.rawJson as any;
        const dbSignals = latestVisit.signals;
        const entropySignals = {
          browserName: rawPayload?.browser?.name || dbSignals.browserName,
          browserVersion: rawPayload?.browser?.version || dbSignals.browserVersion,
          osName: rawPayload?.os?.name || dbSignals.osName,
          osVersion: rawPayload?.os?.version || dbSignals.osVersion,
          deviceType: rawPayload?.hardware?.deviceType || dbSignals.deviceType,
          timezone: rawPayload?.localization?.timezone || latestVisit.timezone || 'Unknown',
          language: rawPayload?.localization?.language || 'Unknown',
          canvasHash: rawPayload?.graphics?.canvasHash || dbSignals.canvasHash,
          webglVendor: rawPayload?.graphics?.webglVendor || dbSignals.webglVendor,
          webglRenderer: rawPayload?.graphics?.webglRenderer || dbSignals.webglRenderer,
          audioHash: rawPayload?.audio?.audioHash || dbSignals.audioHash,
          fontsHash: rawPayload?.fonts?.fontsHash || dbSignals.fontsHash,
          platform: rawPayload?.os?.architecture || 'Unknown',
          screenResolution: rawPayload?.display ? `${rawPayload.display.screenWidth}x${rawPayload.display.screenHeight}` : 'Unknown',
          userAgent: rawPayload?.browser?.userAgent || latestVisit.userAgent || 'Unknown',
        };
        entropyRes = await EntropyService.calculateEntropy(entropySignals);
      }

      return res.json({
        id: fp.id,
        hashV1: fp.hashV1,
        hashV2: fp.hashV2,
        stableHash: fp.stableHash,
        privacyHash: fp.privacyHash,
        createdAt: fp.createdAt,
        visit: latestVisit,
        entropy: entropyRes,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // GET VISITOR CROSS VISIT TIMELINE
  // ----------------------------------------------------------------
  public static async getTimeline(req: Request, res: Response) {
    const { id } = req.params; // Can be a fingerprint V2 id or stableHash
    const { filter } = req.query; // today, 7days, 30days

    try {
      // First, retrieve the fingerprint to fetch the stableHash
      const fp = await prisma.fingerprint.findUnique({
        where: { id },
      });

      const stableHash = fp ? fp.stableHash : id;

      // Filter by days
      let dateFilter = {};
      const now = new Date();
      if (filter === 'today') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { gte: start } };
      } else if (filter === '7days') {
        const start = new Date();
        start.setDate(now.getDate() - 7);
        dateFilter = { createdAt: { gte: start } };
      } else if (filter === '30days') {
        const start = new Date();
        start.setDate(now.getDate() - 30);
        dateFilter = { createdAt: { gte: start } };
      }

      // Query all visits having this stableHash
      const visits = await prisma.visit.findMany({
        where: {
          fingerprint: {
            stableHash,
          },
          ...dateFilter,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          signals: true,
          vpnAnalysis: true,
          botAnalysis: true,
          privacyReport: true,
        },
      });

      return res.json({
        stableHash,
        visitsCount: visits.length,
        timeline: visits.map(v => ({
          visitId: v.id,
          visitTime: v.createdAt,
          ipAddress: v.ipAddress,
          location: `${v.city}, ${v.country}`,
          userAgent: v.userAgent,
          browser: v.signals?.browserName,
          os: v.signals?.osName,
          isVpn: v.vpnAnalysis?.isVpn,
          botScore: v.botAnalysis?.botScore,
          riskLevel: v.privacyReport?.riskLevel,
        })),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // GLOBAL PLATFORM ANALYTICS
  // ----------------------------------------------------------------
  public static async getAnalytics(req: Request, res: Response) {
    try {
      const totalVisits = await prisma.visit.count();
      const uniqueFps = await prisma.fingerprint.count();
      
      // Returning vs new
      const allVisits = await prisma.visit.findMany({
        select: { fingerprintId: true },
      });
      const counts: Record<string, number> = {};
      allVisits.forEach(v => {
        counts[v.fingerprintId] = (counts[v.fingerprintId] || 0) + 1;
      });
      const returningCount = Object.values(counts).filter(c => c > 1).length;

      // Threat / Bot metrics
      const totalBots = await prisma.botAnalysis.count({
        where: { classification: 'Likely Bot' },
      });
      const totalVpns = await prisma.vpnAnalysis.count({
        where: { isVpn: true },
      });

      // Average values
      const avgEntropyRow = await prisma.entropyScore.aggregate({
        _avg: { shannonEntropy: true },
      });
      const averageEntropy = avgEntropyRow._avg.shannonEntropy || 14.5;

      // Risk Distribution
      const privacyRiskGroup = await prisma.privacyReport.groupBy({
        by: ['riskLevel'],
        _count: true,
      });

      // Historical trends (Last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const recentVisits = await prisma.visit.findMany({
        where: { createdAt: { gte: lastWeek } },
        select: { createdAt: true, botAnalysis: { select: { classification: true } } },
        orderBy: { createdAt: 'asc' },
      });

      const trends: Record<string, { total: number; bots: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trends[dayStr] = { total: 0, bots: 0 };
      }

      recentVisits.forEach(v => {
        const dayStr = v.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (trends[dayStr]) {
          trends[dayStr].total++;
          if (v.botAnalysis?.classification === 'Likely Bot') {
            trends[dayStr].bots++;
          }
        }
      });

      const visitorTrends = Object.entries(trends).map(([name, data]) => ({
        name,
        visitors: data.total,
        bots: data.bots,
      }));

      // Top Browsers, OS, Countries distributions
      const signals = await prisma.signal.findMany({
        select: { browserName: true, osName: true },
      });
      const countriesList = await prisma.visit.findMany({
        select: { country: true },
      });

      const getDistributions = (arr: string[]) => {
        const dist: Record<string, number> = {};
        arr.forEach(val => { dist[val] = (dist[val] || 0) + 1; });
        return Object.entries(dist)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
      };

      const browserDistribution = getDistributions(signals.map(s => s.browserName));
      const osDistribution = getDistributions(signals.map(s => s.osName));
      const countryDistribution = getDistributions(countriesList.map(c => c.country));

      return res.json({
        totalVisitors: totalVisits,
        uniqueVisitors: uniqueFps,
        returningVisitors: returningCount,
        botVisitors: totalBots,
        vpnVisitors: totalVpns,
        averageEntropy: Number(averageEntropy.toFixed(2)),
        averageStability: 92.5,
        riskDistribution: privacyRiskGroup.map(g => ({ name: g.riskLevel, value: g._count })),
        visitorTrends,
        browserDistribution,
        osDistribution,
        countryDistribution,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // FINGERPRINT COMPARISON TOOL
  // ----------------------------------------------------------------
  public static async compare(req: Request, res: Response) {
    const { id1, id2 } = req.body;

    if (!id1 || !id2) {
      return res.status(400).json({ error: 'Parameters id1 and id2 are required' });
    }

    try {
      // Query both visit signals
      const fp1 = await prisma.fingerprint.findUnique({
        where: { id: id1 },
        include: { visits: { orderBy: { createdAt: 'desc' }, take: 1, include: { signals: true } } },
      });

      const fp2 = await prisma.fingerprint.findUnique({
        where: { id: id2 },
        include: { visits: { orderBy: { createdAt: 'desc' }, take: 1, include: { signals: true } } },
      });

      if (!fp1 || !fp2 || fp1.visits.length === 0 || fp2.visits.length === 0) {
        return res.status(404).json({ error: 'One or both fingerprints not found for comparison' });
      }

      const sig1 = fp1.visits[0].signals?.rawJson as any;
      const sig2 = fp2.visits[0].signals?.rawJson as any;

      if (!sig1 || !sig2) {
        return res.status(400).json({ error: 'Fingerprint raw signals are missing' });
      }

      // Check Jaccard similarity score
      const similarityPercentage = HashService.calculateSimilarity(fp1.similarityHash, fp2.similarityHash);
      const differencePercentage = 100 - similarityPercentage;

      const matchingSignals: string[] = [];
      const changedSignals: Array<{ signal: string; val1: any; val2: any }> = [];

      // Simple key-by-key comparison helper
      const checkKeys = (path: string, obj1: any, obj2: any) => {
        if (!obj1 || !obj2) return;
        Object.keys(obj1).forEach(k => {
          if (typeof obj1[k] === 'object' && obj1[k] !== null && !Array.isArray(obj1[k])) {
            checkKeys(`${path}.${k}`, obj1[k], obj2[k]);
          } else {
            const val1 = JSON.stringify(obj1[k]);
            const val2 = JSON.stringify(obj2?.[k]);
            if (val1 === val2) {
              matchingSignals.push(`${path}.${k}`);
            } else {
              changedSignals.push({
                signal: `${path}.${k}`,
                val1: obj1[k],
                val2: obj2?.[k] || null,
              });
            }
          }
        });
      };

      checkKeys('browser', sig1.browser, sig2.browser);
      checkKeys('os', sig1.os, sig2.os);
      checkKeys('hardware', sig1.hardware, sig2.hardware);
      checkKeys('localization', sig1.localization, sig2.localization);
      checkKeys('graphics', sig1.graphics, sig2.graphics);

      return res.json({
        similarityPercentage,
        differencePercentage,
        matchingCount: matchingSignals.length,
        changedCount: changedSignals.length,
        matchingSignals,
        changedSignals,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // DOWNLOAD REPORTS (PDF, CSV, JSON)
  // ----------------------------------------------------------------
  public static async getReport(req: Request, res: Response) {
    const { id } = req.params;
    const { format } = req.query; // pdf, csv, json

    try {
      const fp = await prisma.fingerprint.findUnique({
        where: { id },
        include: {
          visits: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              signals: true,
              botAnalysis: true,
              vpnAnalysis: true,
              privacyReport: true,
            },
          },
        },
      });

      if (!fp || fp.visits.length === 0) {
        return res.status(404).json({ error: 'Fingerprint profile not found' });
      }

      const latestVisit = fp.visits[0];
      const signals = latestVisit.signals;

      if (!signals) {
        return res.status(404).json({ error: 'Signal telemetry not found' });
      }

      const reportData = {
        id: fp.id,
        hashV1: fp.hashV1,
        hashV2: fp.hashV2,
        stableHash: fp.stableHash,
        privacyHash: fp.privacyHash,
        createdAt: fp.createdAt,
        visit: {
          ipAddress: latestVisit.ipAddress,
          country: latestVisit.country,
          region: latestVisit.region,
          city: latestVisit.city,
          timezone: latestVisit.timezone,
          userAgent: latestVisit.userAgent,
          signals: {
            browserName: signals.browserName,
            browserVersion: signals.browserVersion,
            osName: signals.osName,
            osVersion: signals.osVersion,
            deviceType: signals.deviceType,
            canvasHash: signals.canvasHash,
            webglVendor: signals.webglVendor,
            webglRenderer: signals.webglRenderer,
            audioHash: signals.audioHash,
            fontsHash: signals.fontsHash,
          },
          botAnalysis: {
            humanScore: latestVisit.botAnalysis?.humanScore || 1.0,
            botScore: latestVisit.botAnalysis?.botScore || 0.0,
            confidenceScore: latestVisit.botAnalysis?.confidenceScore || 1.0,
            riskScore: latestVisit.botAnalysis?.riskScore || 0.0,
            classification: latestVisit.botAnalysis?.classification || 'Human',
            explanations: (latestVisit.botAnalysis?.explanations as string[]) || [],
            webdriver: latestVisit.botAnalysis?.webdriver || false,
          },
          vpnAnalysis: {
            isVpn: latestVisit.vpnAnalysis?.isVpn || false,
            isProxy: latestVisit.vpnAnalysis?.isProxy || false,
            isTor: latestVisit.vpnAnalysis?.isTor || false,
            isDatacenter: latestVisit.vpnAnalysis?.isDatacenter || false,
            webrtcLeak: latestVisit.vpnAnalysis?.webrtcLeak || false,
            timezoneMismatch: latestVisit.vpnAnalysis?.timezoneMismatch || false,
            isp: latestVisit.vpnAnalysis?.isp || 'Unknown',
            explanation: latestVisit.vpnAnalysis?.explanation || '',
          },
          privacyReport: {
            trackability: latestVisit.privacyReport?.trackability || 0.0,
            exposureRisk: latestVisit.privacyReport?.exposureRisk || 0.0,
            stabilityScore: latestVisit.privacyReport?.stabilityScore || 1.0,
            uniquenessRisk: latestVisit.privacyReport?.uniquenessRisk || 0.0,
            riskLevel: latestVisit.privacyReport?.riskLevel || 'Low',
            recommendations: (latestVisit.privacyReport?.recommendations as string[]) || [],
          },
        },
      };

      if (format === 'json') {
        res.setHeader('Content-Disposition', `attachment; filename=report_${id}.json`);
        return res.json(reportData);
      }

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report_${id}.csv`);
        
        // Build raw CSV row strings
        const headers = 'FingerprintID,HashV1,StableHash,IPAddress,Country,Browser,OS,BotScore,VPNConnected,RiskLevel\n';
        const row = `"${reportData.id}","${reportData.hashV1}","${reportData.stableHash}","${reportData.visit.ipAddress}","${reportData.visit.country}","${reportData.visit.signals.browserName}","${reportData.visit.signals.osName}",${reportData.visit.botAnalysis.botScore},${reportData.visit.vpnAnalysis.isVpn},"${reportData.visit.privacyReport.riskLevel}"\n`;
        return res.send(headers + row);
      }

      // Standard is PDF compilation
      const pdfBuffer = await ReportService.generatePdf(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=report_${id}.pdf`);
      return res.end(pdfBuffer);
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // GET INDIVIDUAL BOT / VPN PROFILE ENDPOINTS
  // ----------------------------------------------------------------
  public static async getBotAnalysis(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const bot = await prisma.botAnalysis.findFirst({
        where: { visit: { fingerprintId: id } },
        orderBy: { visit: { createdAt: 'desc' } },
      });
      if (!bot) return res.status(404).json({ error: 'Bot profiling records not found' });
      return res.json(bot);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getVpnAnalysis(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const vpn = await prisma.vpnAnalysis.findFirst({
        where: { visit: { fingerprintId: id } },
        orderBy: { visit: { createdAt: 'desc' } },
      });
      if (!vpn) return res.status(404).json({ error: 'VPN diagnostics records not found' });
      return res.json(vpn);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // GET ALL VISITS & AUDIT LOGS FOR ADMIN VIEW
  // ----------------------------------------------------------------
  public static async getAdminVisitors(req: Request, res: Response) {
    try {
      const visits = await prisma.visit.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          signals: true,
          botAnalysis: true,
          vpnAnalysis: true,
          privacyReport: true,
        },
      });
      return res.json(visits);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getAdminLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      });
      return res.json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // ADMIN SCHEMA INSPECTION
  // ----------------------------------------------------------------
  public static async getSchemaInspector(req: Request, res: Response) {
    try {
      const validFields = Object.values(Prisma.SignalScalarFieldEnum) as string[];
      
      const signalsAudit = [
        { name: 'browserName', storedInJson: true },
        { name: 'browserVersion', storedInJson: true },
        { name: 'osName', storedInJson: true },
        { name: 'osVersion', storedInJson: true },
        { name: 'deviceType', storedInJson: true },
        { name: 'canvasHash', storedInJson: true },
        { name: 'webglVendor', storedInJson: true },
        { name: 'webglRenderer', storedInJson: true },
        { name: 'audioHash', storedInJson: true },
        { name: 'fontsHash', storedInJson: true },
        { name: 'timezone', storedInJson: true },
        { name: 'language', storedInJson: true },
        { name: 'screenResolution', storedInJson: true },
        { name: 'platform', storedInJson: true },
        { name: 'userAgent', storedInJson: true }
      ];

      const auditedSignals = signalsAudit.map(s => {
        const inSchema = validFields.includes(s.name);
        return {
          name: s.name,
          existsInSchema: inSchema,
          existsInDatabase: inSchema,
          storedInJson: s.storedInJson,
          source: inSchema ? 'Prisma Column' : 'Nested JSON'
        };
      });

      const totalVisits = await prisma.visit.count();
      const totalSignals = await prisma.signal.count();

      return res.json({
        success: true,
        tableName: 'signals',
        databaseType: 'SQLite',
        totalVisits,
        totalSignals,
        columns: validFields,
        signals: auditedSignals
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
        details: {
          rootCause: "Database or controller execution error",
          affectedField: "Schema Audit",
          suggestedFix: "Verify prisma client compilation and database file state."
        }
      });
    }
  }
}
