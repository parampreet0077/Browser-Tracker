'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Cpu,
  Activity,
  Globe,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Settings,
  ArrowRight,
  Clock,
  Sparkles,
  Info,
  RotateCcw,
  ExternalLink,
  Bug,
  Wifi,
  WifiOff,
  Database,
  Gauge,
  Scan,
  ChevronDown,
  ChevronUp,
  Fingerprint,
} from 'lucide-react';
import { FingerprintCollector } from '../lib/fingerprintCollector';
import { ApiClient, ApiError } from '../lib/api';
import { useRouter } from 'next/navigation';

interface ScannerProps {
  onScanComplete: (data: any) => void;
}

interface LogEntry {
  timestamp: string;
  source: 'CLIENT' | 'SERVER' | 'DATABASE';
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

const STAGES = [
  { id: 'waiting', label: 'Collecting Browser Signals', icon: Scan, progress: 0, time: 10 },
  { id: 'collecting', label: 'Collecting Browser Signals', icon: Cpu, progress: 15, time: 8 },
  { id: 'processing', label: 'Processing Environment', icon: Settings, progress: 30, time: 7 },
  { id: 'entropy', label: 'Generating Fingerprint', icon: Fingerprint, progress: 45, time: 5 },
  { id: 'bot', label: 'Calculating Entropy', icon: Activity, progress: 60, time: 4 },
  { id: 'vpn', label: 'Running Privacy Audit', icon: Shield, progress: 75, time: 3 },
  { id: 'report', label: 'Building Security Report', icon: Eye, progress: 90, time: 2 },
  { id: 'completed', label: 'Finalizing Results', icon: CheckCircle2, progress: 100, time: 0 },
];

export default function Scanner({ onScanComplete }: ScannerProps) {
  const [progress, setProgress] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [scanError, setScanError] = useState<ApiError | null>(null);
  const [scanSuccessResult, setScanSuccessResult] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const [dbWarning, setDbWarning] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [logsExpanded, setLogsExpanded] = useState(false);

  // Health check state
  const [apiHealth, setApiHealth] = useState<{
    status: 'checking' | 'ok' | 'error';
    database: string;
    server: string;
    responseTime: number;
    errorDetail?: string;
  }>({
    status: 'checking',
    database: 'unknown',
    server: 'unknown',
    responseTime: 0,
  });

  const router = useRouter();
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const redirectTimerRef = useRef<any>(null);

  const addToast = (msg: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const addLog = (source: 'CLIENT' | 'SERVER' | 'DATABASE', type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, source, type, message }]);
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setApiHealth((prev) => ({ ...prev, status: 'checking' }));
    const startTime = performance.now();
    try {
      const res = await ApiClient.getHealth();
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      setApiHealth({
        status: res.status === 'ok' && res.database === 'connected' ? 'ok' : 'error',
        database: res.database || 'disconnected',
        server: res.server || 'running',
        responseTime,
        errorDetail: res.error,
      });
      if (res.status === 'ok' && res.database === 'connected') {
        addToast('Platform ready. All systems online.', 'success');
      } else if (res.database === 'disconnected') {
        addToast('Database is offline!', 'error');
      }
    } catch (err: any) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      setApiHealth({
        status: 'error',
        database: 'disconnected',
        server: 'offline',
        responseTime,
        errorDetail: err.message || 'Connection refused',
      });
      addToast('Backend API is offline!', 'error');
    }
  };

  useEffect(() => {
    if (scanSuccessResult && countdown > 0) {
      redirectTimerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (scanSuccessResult && countdown === 0) {
      handleViewReport();
    }
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [scanSuccessResult, countdown]);

  const handleViewReport = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    if (scanSuccessResult?.fingerprintId) {
      router.push(`/results/${scanSuccessResult.fingerprintId}`);
    }
  };

  const runScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setScanSuccessResult(null);
    setDbWarning(null);
    setCountdown(5);
    setProgress(0);
    setLogs([]);

    setActiveStageIndex(0);
    addToast('Analysis started', 'info');
    addLog('CLIENT', 'info', 'Initializing Browser Tracker scan engine...');
    addLog('CLIENT', 'info', 'Acquiring security parameters and scheduling threads...');

    try {
      await new Promise((r) => setTimeout(r, 1000));
      if (debugMode) addLog('CLIENT', 'info', 'API Request queued: Resolving endpoint connections.');

      setActiveStageIndex(1);
      setProgress(15);
      addToast('Collecting browser signals...', 'info');
      addLog('CLIENT', 'info', 'Entering Stage: Collecting Signals.');
      addLog('CLIENT', 'info', 'Extracting screen metrics, locales, hardware information, and platform variables...');

      const telemetry = await FingerprintCollector.collectAll();
      addLog('CLIENT', 'success', 'Telemetry extraction completed from browser.');
      addToast('Fingerprint generated', 'success');
      if (debugMode) {
        addLog('CLIENT', 'info', `Telemetry payload extracted. keys count: ${Object.keys(telemetry).length}`);
      }
      await new Promise((r) => setTimeout(r, 800));

      setActiveStageIndex(2);
      setProgress(30);
      addLog('CLIENT', 'info', 'Entering Stage: Processing Signals.');
      addLog('CLIENT', 'info', 'Normalizing signals and validating graphic payloads against user agent schema...');
      await new Promise((r) => setTimeout(r, 800));

      setActiveStageIndex(3);
      setProgress(45);
      addLog('CLIENT', 'info', 'Entering Stage: Calculating Entropy.');
      addLog('CLIENT', 'info', 'Computing Shannon entropy indices for fonts, canvas, and audio buffers...');
      await new Promise((r) => setTimeout(r, 800));

      setActiveStageIndex(4);
      setProgress(60);
      addLog('CLIENT', 'info', 'Entering Stage: Running Bot Detection.');
      addLog('CLIENT', 'info', 'Auditing permissions query flags, webdrivers, and headless window dimensions...');
      await new Promise((r) => setTimeout(r, 800));

      setActiveStageIndex(5);
      setProgress(75);
      addLog('CLIENT', 'info', 'Entering Stage: Running VPN Detection.');
      addLog('CLIENT', 'info', 'Checking WebRTC network disclosures, timezone offsets, and datacenter proxy nodes...');
      await new Promise((r) => setTimeout(r, 800));

      setActiveStageIndex(6);
      setProgress(90);
      addLog('CLIENT', 'info', 'Entering Stage: Generating Report.');
      addLog('CLIENT', 'info', 'Transmitting telemetry to backend API collect endpoint: POST /api/collect');

      const startTime = performance.now();
      const response = await ApiClient.collect(telemetry);
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      addLog('CLIENT', 'success', `Backend response received (201 Created) in ${executionTime}ms.`);
      addToast('Report created', 'success');

      if (response.logs && Array.isArray(response.logs)) {
        response.logs.forEach((blog: string) => {
          let type: 'info' | 'success' | 'warning' | 'error' = 'info';
          let source: 'CLIENT' | 'SERVER' | 'DATABASE' = 'SERVER';
          if (blog.includes('SUCCESS') || blog.includes('complete') || blog.includes('committed') || blog.includes('completed')) type = 'success';
          if (blog.includes('Error') || blog.includes('failed')) type = 'error';
          if (blog.includes('Prisma') || blog.includes('Database') || blog.includes('write')) source = 'DATABASE';
          const cleanedMsg = blog.replace(/^\[[^\]]+\]\s*/, '');
          addLog(source, type, cleanedMsg);
        });
      }

      addLog('CLIENT', 'info', 'Initiating database records integrity verification...');
      const verifyRes = await ApiClient.verifyDatabase(response.visitId);

      if (verifyRes.logs && Array.isArray(verifyRes.logs)) {
        verifyRes.logs.forEach((vlog: string) => {
          let type: 'info' | 'success' | 'warning' | 'error' = 'info';
          if (vlog.includes('SUCCESS') || vlog.includes('integrity') || vlog.includes('verified')) type = 'success';
          if (vlog.includes('ERROR') || vlog.includes('FAILED')) type = 'error';
          const cleanedMsg = vlog.replace(/^\[[^\]]+\]\s*/, '');
          addLog('DATABASE', type, cleanedMsg);
        });
      }

      if (!verifyRes.verified) {
        const missing = verifyRes.missing?.join(', ') || 'records';
        setDbWarning(`Database verification warning: Missing records detected in tables: ${missing}.`);
        addLog('DATABASE', 'warning', `Integrity check failed. Missing table entries: ${missing}`);
        addToast('Database warning detected', 'warning');
      } else {
        addLog('DATABASE', 'success', 'Verification success. All database entries saved and validated.');
      }

      setProgress(100);
      setActiveStageIndex(7);
      setScanSuccessResult(response);
      addToast('Analysis complete!', 'success');
      onScanComplete(response);
    } catch (err: any) {
      console.error(err);
      setScanError(err);
      setActiveStageIndex(-1);
      setIsScanning(false);
      addToast('Error detected', 'error');
      addLog('CLIENT', 'error', `Analysis aborted: ${err.message || 'Unknown network error'}`);
    }
  };

  const getEstimatedRemainingTime = () => {
    if (activeStageIndex < 0) return 0;
    return STAGES[activeStageIndex]?.time || 0;
  };

  const getConnectionStateLabel = () => {
    if (apiHealth.status === 'checking') return 'Checking...';
    if (apiHealth.status === 'ok') return 'Online';
    if (apiHealth.database === 'disconnected') return 'DB Offline';
    return 'Offline';
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">

      {/* ─── Toast HUD ─────────────────────────────────────── */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-3.5 rounded-xl shadow-card-hover border pointer-events-auto flex items-center gap-3 ${
                toast.type === 'success'
                  ? 'bg-white border-green-200 text-green-700'
                  : toast.type === 'error'
                  ? 'bg-white border-red-200 text-red-600'
                  : toast.type === 'warning'
                  ? 'bg-white border-yellow-200 text-yellow-700'
                  : 'bg-white border-blue-200 text-blue-600'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
              {toast.type === 'error' && <XCircle className="w-4 h-4 text-danger shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-primary shrink-0" />}
              <span className="text-xs font-semibold">{toast.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ─── LEFT: Main Scanner Block ─────────────────────── */}
        <div className="flex-grow flex flex-col gap-5">

          {/* CHECKING state */}
          {apiHealth.status === 'checking' && (
            <div className="card p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-primary animate-spin" />
              <p className="text-sm font-semibold text-textMuted animate-pulse">Running startup checks...</p>
            </div>
          )}

          {/* ERROR state */}
          {apiHealth.status === 'error' && !isScanning && !scanError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 border-red-200 flex flex-col items-center gap-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <WifiOff className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-textMain mb-2">
                  {apiHealth.database === 'disconnected' && apiHealth.server === 'running'
                    ? 'Database Connection Failed'
                    : 'Backend API Offline'}
                </h2>
                <p className="text-sm text-textMuted leading-relaxed max-w-md mx-auto">
                  {apiHealth.database === 'disconnected' && apiHealth.server === 'running'
                    ? 'The database connection is severed. Please check SQLite storage locks, run migrations, and verify backend environment.'
                    : 'Cannot connect to the backend API. Please ensure the backend server is running.'}
                </p>
              </div>
              {apiHealth.errorDetail && (
                <pre className="w-full p-4 bg-red-50 rounded-xl border border-red-100 font-mono text-xs text-red-600 text-left overflow-x-auto max-w-lg">
                  {apiHealth.errorDetail}
                </pre>
              )}
              <button
                onClick={checkBackendHealth}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Connection
              </button>
            </motion.div>
          )}

          {/* IDLE state (ready to scan) */}
          {apiHealth.status === 'ok' && !isScanning && !scanError && !scanSuccessResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-10 flex flex-col items-center gap-6 text-center relative overflow-hidden"
            >
              {/* Debug mode toggle */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    debugMode
                      ? 'bg-blue-50 border-primary text-primary'
                      : 'bg-cardBg border-borderColor text-textMuted hover:text-textMain'
                  }`}
                >
                  <Bug className="w-3 h-3" />
                  Debug {debugMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Shield icon */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-primary-glow"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}
                >
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-ping opacity-30" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-textMain mb-3 tracking-tight">
                  Analyze Your Browser
                </h2>
                <p className="text-sm text-textMuted max-w-md leading-relaxed">
                  Audit privacy tracking indicators, calculate device entropy weight distributions, analyze Bot classifiers, and detect hidden VPN nodes.
                </p>
              </div>

              <button
                id="start-scan-btn"
                onClick={runScan}
                className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                  boxShadow: '0 8px 30px rgb(14 165 233 / 0.3)',
                }}
              >
                <Sparkles className="w-4.5 h-4.5" />
                Start Analysis
              </button>
            </motion.div>
          )}

          {/* SCANNING state */}
          {isScanning && !scanSuccessResult && (
            <div className="card p-8 flex flex-col gap-6 relative overflow-hidden">
              {/* Animated top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary animate-pulse" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-semibold text-textMain">Analysis in Progress</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-textMuted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{getEstimatedRemainingTime()}s remaining
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-lg font-bold text-primary"
                    style={{ background: '#EFF6FF' }}
                  >
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              {/* Steps checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STAGES.slice(1, 8).map((stage, index) => {
                  const actualIndex = index + 1;
                  const isDone = progress > stage.progress;
                  const isActive = activeStageIndex === actualIndex;
                  const Icon = stage.icon;
                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-blue-50 border-primary/30'
                          : isDone
                          ? 'bg-green-50 border-green-100'
                          : 'bg-cardBg border-borderColor'
                      }`}
                    >
                      <div className="shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : isActive ? (
                          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-borderColor" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-primary' : isDone ? 'text-success' : 'text-textMuted'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Current stage label */}
              <div className="flex items-center gap-2 text-sm font-medium text-textMuted border-t border-borderColor pt-4">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                <span>Currently: <strong className="text-textMain">{STAGES[activeStageIndex]?.label || 'Initializing...'}</strong></span>
              </div>
            </div>
          )}

          {/* SUCCESS state */}
          {scanSuccessResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-black text-textMain">Analysis Complete!</h2>
                <p className="text-sm text-textMuted">
                  Redirecting to full report in{' '}
                  <span className="font-bold text-primary">{countdown}s</span>...
                </p>
              </div>

              {/* DB Warning */}
              {dbWarning && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-yellow-800 mb-0.5">Database Alert</p>
                    <p className="text-xs text-yellow-700 leading-relaxed">{dbWarning}</p>
                  </div>
                </div>
              )}

              {/* Quick results grid */}
              {(() => {
                const browserVal = scanSuccessResult.entropy?.breakdown?.find((b: any) => b.signalName === 'browserName')?.value || 'Unknown';
                const browserVer = scanSuccessResult.entropy?.breakdown?.find((b: any) => b.signalName === 'browserVersion')?.value || '';
                const osVal = scanSuccessResult.entropy?.breakdown?.find((b: any) => b.signalName === 'osName')?.value || 'Unknown';
                const deviceVal = scanSuccessResult.entropy?.breakdown?.find((b: any) => b.signalName === 'deviceType')?.value || 'Unknown';

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { label: 'Fingerprint ID', value: scanSuccessResult.fingerprintId, mono: true, truncate: true },
                      { label: 'Browser', value: `${browserVal} ${browserVer}`, mono: false },
                      { label: 'OS', value: osVal, mono: false },
                      { label: 'Device', value: deviceVal, mono: false, capitalize: true },
                      { label: 'Entropy', value: `${scanSuccessResult.entropy.totalEntropy} bits`, mono: true },
                      { label: 'Stability', value: `${Math.round((scanSuccessResult.privacyReport.stabilityScore || 0.95) * 100)}%`, mono: true, color: 'text-success' },
                      { label: 'Uniqueness', value: `${scanSuccessResult.entropy.uniquenessScore}%`, mono: true, color: 'text-secondary' },
                      { label: 'Risk Level', value: scanSuccessResult.privacyReport.riskLevel, mono: false,
                        color: ['Critical', 'High'].includes(scanSuccessResult.privacyReport.riskLevel) ? 'text-danger' : 'text-success' },
                      { label: 'Bot Score', value: `${Math.round(scanSuccessResult.botAnalysis.botScore * 100)}%`, mono: true,
                        color: scanSuccessResult.botAnalysis.botScore > 0.4 ? 'text-danger' : 'text-success' },
                      { label: 'VPN', value: scanSuccessResult.vpnAnalysis.isVpn ? 'Detected' : 'Inactive', mono: false,
                        color: scanSuccessResult.vpnAnalysis.isVpn ? 'text-danger' : 'text-success' },
                    ].map((item, idx) => (
                      <div key={idx} className="card-flat p-3 flex flex-col gap-1 rounded-xl">
                        <span className="text-xs text-textMuted font-medium">{item.label}</span>
                        <span className={`text-sm font-bold truncate ${item.mono ? 'font-mono' : ''} ${item.color || 'text-textMain'} ${item.capitalize ? 'capitalize' : ''}`} title={item.value}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => { setIsScanning(false); setScanSuccessResult(null); setDbWarning(null); }}
                  className="btn-outline flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Run Again
                </button>
                <button
                  onClick={handleViewReport}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  View Full Report
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCAN ERROR state */}
          {scanError && !isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 border-red-200 flex flex-col gap-5"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-danger" />
                </div>
                <h2 className="text-lg font-bold text-textMain">Analysis Failed</h2>
                <p className="text-sm text-textMuted">
                  The fingerprint analysis was aborted. Error details are shown below.
                </p>
              </div>

              <div className="bg-red-50 rounded-xl border border-red-100 p-5 flex flex-col gap-3 text-sm">
                <div className="grid grid-cols-2 gap-4 border-b border-red-100 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wide block mb-0.5">Error Type</span>
                    <span className="font-semibold text-textMain">{scanError?.type || 'Connection Refused'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wide block mb-0.5">Status</span>
                    <span className="font-semibold text-textMain">{scanError?.status || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wide block mb-0.5">Endpoint</span>
                  <span className="font-mono text-xs text-textMuted">{scanError?.endpoint || 'POST /api/collect'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wide block mb-0.5">Message</span>
                  <span className="text-textMuted text-xs">{scanError?.message}</span>
                </div>
                {scanError?.suggestedFix && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <span className="text-xs font-semibold text-green-700 block mb-0.5">Suggested Fix</span>
                    <span className="text-xs text-green-700">{scanError.suggestedFix}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setScanError(null); setIsScanning(false); }}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={runScan}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Scan
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Developer Diagnostics Log ─────────────── */}
          {(debugMode || isScanning || scanSuccessResult || scanError) && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-borderColor">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-textMuted" />
                  <span className="text-xs font-semibold text-textMuted uppercase tracking-wide">Developer Console</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-textMuted">
                    <input
                      type="checkbox"
                      checked={debugMode}
                      onChange={(e) => setDebugMode(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-borderColor text-primary cursor-pointer"
                    />
                    Enable Logging
                  </label>
                  <button
                    onClick={() => setLogs([])}
                    className="text-xs font-medium text-textMuted hover:text-textMain transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setLogsExpanded(!logsExpanded)}
                    className="text-textMuted hover:text-textMain transition-colors"
                  >
                    {logsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {debugMode && (
                <div
                  className={`bg-slate-950 font-mono text-xs p-4 overflow-y-auto transition-all duration-300 ${
                    logsExpanded ? 'max-h-72' : 'max-h-36'
                  }`}
                >
                  {logs.length === 0 ? (
                    <span className="text-slate-600 italic">Waiting for events...</span>
                  ) : (
                    logs.map((entry, index) => (
                      <div key={index} className="flex gap-2 items-start mb-1.5">
                        <span className="text-slate-500 shrink-0">[{entry.timestamp}]</span>
                        <span
                          className={`font-bold shrink-0 ${
                            entry.source === 'CLIENT'
                              ? 'text-sky-400'
                              : entry.source === 'DATABASE'
                              ? 'text-violet-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {entry.source}:
                        </span>
                        <span
                          className={
                            entry.type === 'success'
                              ? 'text-emerald-400'
                              : entry.type === 'error'
                              ? 'text-red-400 font-bold'
                              : entry.type === 'warning'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {entry.message}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={consoleEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Connection Diagnostics ────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-5">
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-textMuted" />
                <span className="text-xs font-semibold text-textMain uppercase tracking-wide">System Status</span>
              </div>
              <span
                className={`badge text-xs ${
                  apiHealth.status === 'ok'
                    ? 'badge-success'
                    : apiHealth.status === 'checking'
                    ? 'badge-primary animate-pulse'
                    : 'badge-danger'
                }`}
              >
                {apiHealth.status === 'ok' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {getConnectionStateLabel()}
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <p className="text-textMuted font-medium mb-1">Client Node</p>
                <p className="font-mono text-textMain bg-cardBg px-3 py-2 rounded-lg border border-borderColor break-all select-all text-xs">
                  {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
                </p>
              </div>
              <div>
                <p className="text-textMuted font-medium mb-1">API Gateway</p>
                <p className="font-mono text-textMain bg-cardBg px-3 py-2 rounded-lg border border-borderColor break-all select-all text-xs">
                  {ApiClient.getBaseUrl()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-borderColor">
                {[
                  {
                    label: 'API Server',
                    value: apiHealth.server === 'offline' ? 'Offline' : 'Online',
                    ok: apiHealth.server !== 'offline',
                  },
                  {
                    label: 'Database',
                    value: apiHealth.database === 'connected' ? 'Connected' : 'Disconnected',
                    ok: apiHealth.database === 'connected',
                  },
                  {
                    label: 'Prisma ORM',
                    value: apiHealth.database === 'connected' ? 'Ready' : 'Error',
                    ok: apiHealth.database === 'connected',
                  },
                  {
                    label: 'Latency',
                    value: apiHealth.status === 'error' ? 'N/A' : `${apiHealth.responseTime}ms`,
                    ok: apiHealth.status !== 'error' && apiHealth.responseTime < 200,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-cardBg rounded-lg p-2.5 border border-borderColor">
                    <p className="text-textMuted text-xs mb-0.5">{stat.label}</p>
                    <p className={`font-bold text-xs ${stat.ok ? 'text-success' : 'text-danger'}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {apiHealth.status === 'error' && (
              <button
                onClick={checkBackendHealth}
                className="w-full py-2 rounded-xl border border-red-200 text-xs font-semibold text-danger hover:bg-red-50 transition-all text-center"
              >
                Re-check Connection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
