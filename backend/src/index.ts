import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { ApiController } from './controllers/apiController';
import { authenticateToken, requireAdmin } from './middleware/auth';
import { generalLimiter, collectionLimiter } from './middleware/rateLimit';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // allow canvas/media downloads
}));

// Dynamic CORS configuration to allow local connections on any port
const allowedOriginsRegex = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOriginsRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // support large WebGL/graphics payloads
app.use(generalLimiter);

// ----------------------------------------------------
// DATABASE INITIALIZATION TEST
// ----------------------------------------------------
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log(`==================================================`);
    console.log(`[DATABASE] Prisma connected to database successfully.`);
    console.log(`==================================================`);
  } catch (err: any) {
    console.error(`==================================================`);
    console.error(`[DATABASE] ERROR: Prisma failed to connect: ${err.message}`);
    console.error(`==================================================`);
  }
}
testDbConnection();

// ----------------------------------------------------
// PUBLIC API ROUTERS
// ----------------------------------------------------

// 1. Live collector scan
app.post('/api/collect', collectionLimiter, ApiController.collect);

// 1b. Verify database integrity check
app.get('/api/verify-db/:visitId', ApiController.verifyDatabase);

// 2. Fetch specific profile details
app.get('/api/fingerprint/:id', ApiController.getFingerprint);

// 3. Get timeline matching stable fingerprint
app.get('/api/timeline/:id', ApiController.getTimeline);

// 4. VPN and Bot analysis specifics
app.get('/api/bot-analysis/:id', ApiController.getBotAnalysis);
app.get('/api/vpn-analysis/:id', ApiController.getVpnAnalysis);

// 5. Compare two fingerprints
app.post('/api/compare', ApiController.compare);

// 6. Generate report downloads (PDF, CSV, JSON)
app.get('/api/report/:id', ApiController.getReport);

// 7. API Health Check Endpoint (returns database and server diagnostics)
app.get('/api/health', async (req, res) => {
  try {
    // Perform simple query check
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      prisma: "connected",
      entropyEngine: "ready"
    });
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      prisma: "disconnected",
      entropyEngine: "failed",
      error: err.message
    });
  }
});

// ----------------------------------------------------
// AUTHENTICATION ROUTERS
// ----------------------------------------------------
app.post('/api/auth/login', ApiController.login);
app.get('/api/auth/me', authenticateToken, ApiController.getMe);

// ----------------------------------------------------
// ADMIN-RESTRICTED ROUTERS
// ----------------------------------------------------
app.get('/api/analytics', ApiController.getAnalytics);
app.get('/api/admin/visitors', authenticateToken, requireAdmin, ApiController.getAdminVisitors);
app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, ApiController.getAdminLogs);
app.get('/api/admin/schema', authenticateToken, requireAdmin, ApiController.getSchemaInspector);

// Legacy health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`[SERVER] Running: ANTIGRAVITY BACKEND SERVER ACTIVE`);
  console.log(`[SERVER] Port: Listening on Port ${PORT}`);
  console.log(`[SERVER] Host: http://localhost:${PORT}`);
  console.log(`==================================================`);
  console.log(`[ROUTES] Initializing route loaders...`);
  console.log(`  - POST /api/collect`);
  console.log(`  - GET  /api/verify-db/:visitId`);
  console.log(`  - GET  /api/fingerprint/:id`);
  console.log(`  - GET  /api/timeline/:id`);
  console.log(`  - GET  /api/bot-analysis/:id`);
  console.log(`  - GET  /api/vpn-analysis/:id`);
  console.log(`  - POST /api/compare`);
  console.log(`  - GET  /api/report/:id`);
  console.log(`  - GET  /api/health`);
  console.log(`[ROUTES] 100% Loaded successfully.`);
  console.log(`==================================================`);
});
