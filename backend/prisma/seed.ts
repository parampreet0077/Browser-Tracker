import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Admin User
  const adminEmail = 'admin@fingerprint.intel';
  const hashedPassword = bcrypt.hashSync('AdminPass123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // 2. Create Default System Settings
  const settings = [
    { key: 'platform_name', value: 'Antigravity Fingerprint Analytics' },
    { key: 'min_entropy_threshold', value: '12.5' },
    { key: 'bot_detection_sensitivity', value: 'high' },
    { key: 'retention_days', value: '90' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('System settings seeded.');

  // 3. Baseline Entropy Scores for Signals
  const baselineEntropies = [
    { signalName: 'canvas', shannonEntropy: 8.92, uniquenessScore: 92.4, populationEstimate: '1 in 480 users' },
    { signalName: 'fonts', shannonEntropy: 7.21, uniquenessScore: 81.6, populationEstimate: '1 in 150 users' },
    { signalName: 'timezone', shannonEntropy: 3.12, uniquenessScore: 12.8, populationEstimate: '1 in 8 users' },
    { signalName: 'languages', shannonEntropy: 4.85, uniquenessScore: 32.5, populationEstimate: '1 in 28 users' },
    { signalName: 'webgl', shannonEntropy: 8.15, uniquenessScore: 88.9, populationEstimate: '1 in 290 users' },
    { signalName: 'audio', shannonEntropy: 6.45, uniquenessScore: 71.2, populationEstimate: '1 in 85 users' },
    { signalName: 'userAgent', shannonEntropy: 9.32, uniquenessScore: 94.8, populationEstimate: '1 in 640 users' },
    { signalName: 'screenResolution', shannonEntropy: 5.62, uniquenessScore: 48.3, populationEstimate: '1 in 48 users' },
  ];

  for (const entropy of baselineEntropies) {
    await prisma.entropyScore.upsert({
      where: { signalName: entropy.signalName },
      update: {},
      create: entropy,
    });
  }
  console.log('Baseline entropy scores seeded.');

  // 4. Seed Seed Data for Historic Visitor Trends (past 7 days)
  const now = new Date();
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const osList = ['Windows 11', 'macOS Sonoma', 'Linux (Ubuntu)', 'iOS 17', 'Android 14'];
  const countries = ['United States', 'Germany', 'United Kingdom', 'India', 'Canada', 'Singapore'];

  console.log('Generating historic analytics datasets...');

  // Let's create about 35 historic visits spread over the past 7 days to populate the dashboards cleanly
  for (let i = 0; i < 35; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const visitDate = new Date();
    visitDate.setDate(now.getDate() - daysAgo);
    visitDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const os = osList[Math.floor(Math.random() * osList.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const isBot = Math.random() < 0.15; // 15% bots
    const isVpn = Math.random() < 0.20; // 20% VPN users
    
    const hash = `fp_${Math.random().toString(36).substring(2, 18)}_${Math.random().toString(36).substring(2, 18)}`;

    const fp = await prisma.fingerprint.create({
      data: {
        id: hash,
        hashV1: hash.substring(0, 16),
        hashV2: hash,
        stableHash: hash.substring(10, 26),
        similarityHash: 'v:1,2,3,4,5,6,7,8',
        privacyHash: hash.substring(5, 20),
        createdAt: visitDate,
        updatedAt: visitDate,
      }
    });

    const visit = await prisma.visit.create({
      data: {
        fingerprintId: fp.id,
        ipAddress: `192.168.1.${10 + i}`,
        country,
        region: 'Demo Region',
        city: 'Demo City',
        timezone: 'UTC',
        userAgent: `Mozilla/5.0 (Mock; ${os}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/120.0.0.0`,
        createdAt: visitDate,
      }
    });

    await prisma.signal.create({
      data: {
        visitId: visit.id,
        browserName: browser,
        browserVersion: '120.0.0.0',
        osName: os,
        osVersion: '1.0',
        deviceType: os.includes('iOS') || os.includes('Android') ? 'mobile' : 'desktop',
        canvasHash: `cv_${Math.random().toString(36).substring(2, 10)}`,
        webglVendor: 'Intel Inc.',
        webglRenderer: 'Intel Iris Pro Graphics',
        audioHash: `aud_${Math.random().toString(36).substring(2, 10)}`,
        fontsHash: `font_${Math.random().toString(36).substring(2, 10)}`,
        rawJson: { userAgent: 'Mozilla/5.0 ...' },
        normalizedJson: { browser, os },
      }
    });

    await prisma.botAnalysis.create({
      data: {
        visitId: visit.id,
        webdriver: isBot,
        headless: isBot && Math.random() > 0.5,
        automationTool: isBot ? 'Puppeteer' : 'None',
        timingAnomaly: isBot && Math.random() > 0.4,
        humanScore: isBot ? 0.05 : 0.95,
        botScore: isBot ? 0.95 : 0.05,
        confidenceScore: 0.90,
        riskScore: isBot ? 0.85 : 0.05,
        classification: isBot ? 'Likely Bot' : 'Human',
        explanations: isBot ? ['Webdriver detected', 'Headless signature matched'] : ['Natural browser variables'],
      }
    });

    await prisma.vpnAnalysis.create({
      data: {
        visitId: visit.id,
        isVpn: isVpn,
        isProxy: isVpn && Math.random() > 0.5,
        isTor: isVpn && Math.random() > 0.8,
        isDatacenter: isVpn,
        webrtcLeak: false,
        timezoneMismatch: false,
        isp: isVpn ? 'M2-Fibers LLC' : 'Comcast Broadband',
        confidenceScore: 0.85,
        explanation: isVpn ? 'IP is associated with datacenter nodes' : 'Residential network provider',
      }
    });

    await prisma.privacyReport.create({
      data: {
        visitId: visit.id,
        trackability: isBot ? 0.9 : 0.45,
        exposureRisk: isVpn ? 0.2 : 0.65,
        stabilityScore: 0.95,
        uniquenessRisk: 0.75,
        riskLevel: isBot ? 'Critical' : isVpn ? 'Low' : 'Medium',
        recommendations: [
          'Enable Do Not Track header',
          'Block fingerprinting scripts or use a privacy-preserving browser extension',
        ],
      }
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
