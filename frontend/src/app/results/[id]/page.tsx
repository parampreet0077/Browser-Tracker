'use client';

import React, { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Cpu,
  Layers,
  Key,
  Download,
  ArrowRight,
  Server,
  Eye,
  AlertTriangle,
  RotateCcw,
  Copy,
  ChevronDown,
  CheckCircle,
  Clock,
  ArrowLeft,
  Settings,
  HelpCircle,
  FileText,
  TrendingUp,
  MapPin,
  Lock,
  UserCheck,
  Zap,
  Globe,
  Terminal,
  ChevronRight,
  Database,
  Info,
  Fingerprint,
  BarChart3,
  Activity,
  Scan,
} from 'lucide-react';
import { ApiClient } from '../../../lib/api';
import Link from 'next/link';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const fadeIn = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-24 rounded-xl ${className}`} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = 'text-textMain',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
      {sub && <p className="text-xs font-medium text-textMuted mt-1">{sub}</p>}
    </div>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Critical: 'badge-danger',
    High: 'bg-orange-50 text-orange-600 border-orange-200',
    Medium: 'badge-warning',
    Low: 'badge-success',
  };
  return (
    <span className={`badge ${styles[level] || 'badge-muted'}`}>
      {level} Risk
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'entropy-debug' | 'threats' | 'hardening' | 'timeline'>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  const [compareId, setCompareId] = useState('');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareError, setCompareError] = useState('');
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getFingerprint(id);
      setData(res);
      const timelineRes = await ApiClient.getTimeline(id);
      setTimeline(timelineRes);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to retrieve analysis report. Ensure the ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCompareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareId) return;
    setCompareError('');
    setCompareResult(null);
    setCompareLoading(true);
    try {
      const res = await ApiClient.compare(id, compareId);
      setCompareResult(res);
    } catch (err: any) {
      setCompareError(err.message || 'Comparison failed. Verify the target Fingerprint ID exists.');
    } finally {
      setCompareLoading(false);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header showAnalyzeButton={false} />
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 py-8 pt-24 gap-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
              <SkeletonCard className="h-48" />
              <SkeletonCard className="h-32" />
              <SkeletonCard className="h-48" />
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header showAnalyzeButton={false} />
        <div className="flex-1 flex items-center justify-center p-4 pt-24">
          <div className="card max-w-md w-full p-10 border-red-200 text-center flex flex-col items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-textMain mb-2">Report Not Found</h2>
              <p className="text-sm text-textMuted leading-relaxed">
                {error || 'The requested browser fingerprint record is unavailable.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="btn-outline text-sm">
                ← New Scan
              </Link>
              <button onClick={fetchData} className="btn-primary text-sm">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { visit, entropy } = data;
  const { signals, botAnalysis, vpnAnalysis, privacyReport } = visit;

  const getBreakdownField = (name: string) => {
    return (
      entropy?.breakdown?.find((item: any) => item.signalName === name) || {
        value: 'Unknown',
        weight: 1.0,
        status: 'Fallback',
        uniquenessScore: 0,
      }
    );
  };

  const collectedSignals = [
    { name: 'Browser Name/Version', ...getBreakdownField('browserName'), displayVal: `${signals?.browserName || 'Unknown'} v${signals?.browserVersion || ''}` },
    { name: 'Timezone', ...getBreakdownField('timezone') },
    { name: 'Language', ...getBreakdownField('language') },
    { name: 'Platform', ...getBreakdownField('platform') },
    { name: 'Screen size', ...getBreakdownField('screenResolution') },
    { name: 'Canvas Hash', ...getBreakdownField('canvasHash') },
    { name: 'WebGL Renderer', ...getBreakdownField('webglRenderer') },
    { name: 'Audio Hash', ...getBreakdownField('audioHash') },
    { name: 'User Agent', ...getBreakdownField('userAgent'), displayVal: visit?.userAgent },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'signals', label: 'Signals', icon: Cpu },
    { id: 'entropy-debug', label: 'Entropy Debug', icon: Database },
    { id: 'threats', label: 'Threats', icon: AlertTriangle },
    { id: 'hardening', label: 'Hardening', icon: Lock },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-white">
        <Header showAnalyzeButton={false} />

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 pt-24 flex flex-col lg:flex-row gap-6">

          {/* ─── Left Sidebar ───────────────────────────────────── */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

            {/* Identity Card */}
            <div className="card p-5 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <RiskBadge level={privacyReport.riskLevel} />
              </div>

              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}>
                <Fingerprint className="w-5 h-5 text-white" />
              </div>

              <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-0.5">Active Profile</p>
              <h2 className="text-base font-bold text-textMain mb-4">
                {signals?.browserName || 'Web Browser'} on {signals?.osName || 'Unknown OS'}
              </h2>

              <div className="flex flex-col gap-2.5 text-xs border-t border-borderColor pt-3">
                {[
                  { label: 'FINGERPRINT HASH V2', value: id, copyKey: 'id' },
                  { label: 'STABLE IDENTIFIER', value: data.stableHash, copyKey: 'stable' },
                ].map((item) => (
                  <div key={item.copyKey}>
                    <p className="text-textMuted font-semibold mb-1 uppercase tracking-wide">{item.label}</p>
                    <div className="flex items-center justify-between gap-2 bg-cardBg px-2.5 py-2 rounded-lg border border-borderColor">
                      <span className="font-mono text-textMain truncate text-xs flex-1">{item.value}</span>
                      <button
                        onClick={() => copyToClipboard(item.value, item.copyKey)}
                        className="p-1 rounded text-textMuted hover:text-primary transition-colors shrink-0"
                      >
                        {copiedId === item.copyKey ? (
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                <div>
                  <p className="text-textMuted font-semibold mb-1 uppercase tracking-wide">CREATED</p>
                  <p className="text-textMain font-medium">
                    {mounted ? new Date(data.createdAt).toLocaleString() : data.createdAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Card */}
            <div className="card p-5 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-textMain uppercase tracking-wide border-b border-borderColor pb-2">
                Export Report
              </h3>
              <a
                href={ApiClient.getReportUrl(id, 'pdf')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Download PDF
                </span>
                <Download className="w-3.5 h-3.5" />
              </a>
              <a
                href={ApiClient.getReportUrl(id, 'csv')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-borderColor text-xs font-semibold text-textMuted hover:text-textMain hover:border-primary hover:bg-blue-50 transition-all"
              >
                <span>CSV Format</span>
                <Download className="w-3.5 h-3.5" />
              </a>
              <a
                href={ApiClient.getReportUrl(id, 'json')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-borderColor text-xs font-semibold text-textMuted hover:text-textMain hover:border-primary hover:bg-blue-50 transition-all font-mono"
              >
                <span>Raw JSON</span>
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Tab Navigation */}
            <div className="card p-2 flex flex-col gap-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Quick nav back */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-borderColor text-xs font-semibold text-textMuted hover:text-textMain hover:border-primary hover:bg-blue-50 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              New Scan
            </Link>
          </div>

          {/* ─── Right Panel ─────────────────────────────────────── */}
          <div className="flex-grow flex flex-col gap-5 min-w-0">

            {/* ─── TAB: OVERVIEW ──────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col gap-5">

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Human Reliability"
                    value={`${Math.round(botAnalysis.humanScore * 100)}%`}
                    sub={botAnalysis.classification}
                    color="text-success"
                  />
                  <StatCard
                    label="Connection"
                    value={vpnAnalysis.isVpn ? 'VPN Active' : 'Direct'}
                    sub={`ISP: ${vpnAnalysis.isp || 'Unknown'}`}
                    color={vpnAnalysis.isVpn ? 'text-danger' : 'text-textMain'}
                  />
                  <StatCard
                    label="Shannon Entropy"
                    value={`${entropy?.totalEntropy || '14.50'} bits`}
                    sub={`${entropy?.strength || 'Moderate'} strength`}
                    color="text-primary"
                  />
                  <StatCard
                    label="Uniqueness"
                    value={`${entropy?.uniquenessScore || '92.5'}%`}
                    sub="Drift similarity baseline"
                    color="text-secondary"
                  />
                </div>

                {/* Browser Summary */}
                <div className="card p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-textMain flex items-center gap-2 border-b border-borderColor pb-3">
                    <Cpu className="w-4 h-4 text-primary" />
                    Browser Fingerprint Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: 'Browser Engine', value: `${signals?.browserName} v${signals?.browserVersion}` },
                      { label: 'OS Architecture', value: `${signals?.osName} v${signals?.osVersion}` },
                      { label: 'Device Category', value: signals?.deviceType || 'Desktop' },
                      { label: 'Visitor Location', value: `${visit.city}, ${visit.country}` },
                    ].map((item) => (
                      <div key={item.label} className="card-flat p-3 flex justify-between items-center rounded-xl text-sm">
                        <span className="text-textMuted font-medium">{item.label}</span>
                        <span className="font-semibold text-textMain capitalize">{item.value}</span>
                      </div>
                    ))}
                    <div className="card-flat p-3 flex justify-between items-start rounded-xl text-sm md:col-span-2 gap-4">
                      <span className="text-textMuted font-medium shrink-0">User Agent</span>
                      <span className="font-mono text-xs text-textMuted truncate select-all text-right" title={visit.userAgent}>
                        {visit.userAgent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hash Signatures */}
                <div className="card p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-textMain flex items-center gap-2 border-b border-borderColor pb-3">
                    <Key className="w-4 h-4 text-secondary" />
                    Fingerprint Telemetry Signatures
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'HASH V1 (Browser-focused)', desc: 'Uses browser core variables and engine flags', value: data.hashV1, key: 'v1' },
                      { label: 'HASH V2 (Hardware-canvas-focused)', desc: 'Integrates deep GPU, font size maps, and hardware channels', value: data.hashV2, key: 'v2' },
                      { label: 'PRIVACY HASH (Anonymizer Check)', desc: 'Flags differences in standard vs custom spoofed variables', value: data.privacyHash, key: 'privacy' },
                    ].map((hash) => (
                      <div key={hash.key} className="card-flat p-4 flex items-center justify-between gap-4 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">{hash.label}</p>
                          <p className="text-xs text-textMuted/70 mt-0.5">{hash.desc}</p>
                          <p className="font-mono text-xs text-textMain mt-1.5 truncate select-all">{hash.value}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(hash.value, hash.key)}
                          className="p-2 rounded-lg text-textMuted hover:text-primary hover:bg-blue-50 transition-all shrink-0"
                        >
                          {copiedId === hash.key ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ─── TAB: SIGNALS ───────────────────────────────────── */}
            {activeTab === 'signals' && (
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col gap-5">
                <div className="card overflow-hidden">
                  <div className="p-5 border-b border-borderColor">
                    <h3 className="text-base font-bold text-textMain mb-1">Collected Browser Signals</h3>
                    <p className="text-sm text-textMuted leading-relaxed">
                      9 primary browser parameters parsed dynamically during analysis.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Parameter Name</th>
                          <th>Extracted Value</th>
                          <th className="text-center">Entropy Weight</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collectedSignals.map((sig, idx) => (
                          <tr key={idx}>
                            <td className="font-semibold font-mono text-xs">{sig.name}</td>
                            <td className="font-mono text-xs text-textMuted break-all max-w-xs" title={String(sig.displayVal || sig.value)}>
                              {String(sig.displayVal || sig.value)}
                            </td>
                            <td className="text-center font-mono font-bold text-secondary text-xs">{sig.weight || 1.0}×</td>
                            <td className="text-center">
                              <span className={`badge text-xs ${
                                sig.status?.includes('Seeded') || sig.status?.includes('Fallback')
                                  ? 'badge-warning'
                                  : 'badge-success'
                              }`}>
                                {sig.status || 'Calculated'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB: ENTROPY DEBUG ─────────────────────────────── */}
            {activeTab === 'entropy-debug' && (
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col gap-5">
                <div className="card overflow-hidden">
                  <div className="p-5 border-b border-borderColor flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-textMain mb-1">Dynamic Entropy Debugger</h3>
                      <p className="text-sm text-textMuted">Audits columns vs JSON fields, processing latencies, and calculation status.</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cardBg border border-borderColor text-xs font-medium text-textMuted">
                      <Database className="w-3.5 h-3.5 text-secondary" />
                      SQLite
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table min-w-[680px]">
                      <thead>
                        <tr>
                          <th>Signal Key</th>
                          <th>In Schema</th>
                          <th>In Database</th>
                          <th>Source</th>
                          <th className="text-center">Shannon Entropy</th>
                          <th className="text-center">Latency</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entropy?.breakdown?.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="font-semibold font-mono text-xs">{item.signalName}</td>
                            <td>
                              <span className={`badge text-xs ${item.existsInSchema ? 'badge-success' : 'badge-danger'}`}>
                                {item.existsInSchema ? 'YES' : 'NO'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge text-xs ${item.existsInDatabase ? 'badge-success' : 'badge-danger'}`}>
                                {item.existsInDatabase ? 'YES' : 'NO'}
                              </span>
                            </td>
                            <td className="text-xs text-textMuted">{item.source || 'Nested JSON'}</td>
                            <td className="text-center font-mono font-bold text-primary text-xs">
                              {item.entropy?.toFixed(2)} bits
                            </td>
                            <td className="text-center text-xs text-textMuted">
                              {item.processingTime !== undefined ? `${item.processingTime}ms` : 'N/A'}
                            </td>
                            <td className="text-center">
                              <span className={`badge text-xs ${
                                item.status?.includes('Fallback') ? 'badge-warning' : 'badge-success'
                              }`}>
                                {item.status || 'Calculated'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB: THREATS ───────────────────────────────────── */}
            {activeTab === 'threats' && (
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Bot Analysis */}
                  <div className="card p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-textMain flex items-center gap-2 border-b border-borderColor pb-3">
                      <UserCheck className="w-4 h-4 text-danger" />
                      Bot & Automation Detection
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: 'Automation Webdriver', val: botAnalysis.webdriver, trueLabel: 'webdriver active', falseLabel: 'disabled / clean', danger: botAnalysis.webdriver },
                        { label: 'Headless Browser', val: botAnalysis.headless, trueLabel: 'headless flagged', falseLabel: 'standard window', danger: botAnalysis.headless },
                        { label: 'Automation Tool', val: botAnalysis.automationTool !== 'None', trueLabel: botAnalysis.automationTool, falseLabel: 'None', danger: botAnalysis.automationTool !== 'None' },
                        { label: 'Timing Anomalies', val: botAnalysis.timingAnomaly, trueLabel: 'anomaly detected', falseLabel: 'normal timing', danger: botAnalysis.timingAnomaly },
                      ].map((item) => (
                        <div key={item.label} className="card-flat p-3 flex justify-between items-center rounded-xl text-sm">
                          <span className="text-textMuted font-medium">{item.label}</span>
                          <span className={`font-semibold text-xs ${item.danger ? 'text-danger' : 'text-textMain'}`}>
                            {item.val ? item.trueLabel : item.falseLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                    {botAnalysis.explanations && botAnalysis.explanations.length > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-danger mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Automation Flags
                        </h4>
                        <ul className="text-xs text-textMuted space-y-1.5 list-disc list-inside">
                          {botAnalysis.explanations.map((exp: string, index: number) => (
                            <li key={index} className="leading-relaxed">{exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* VPN Analysis */}
                  <div className="card p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-textMain flex items-center gap-2 border-b border-borderColor pb-3">
                      <Server className="w-4 h-4 text-primary" />
                      VPN & Proxy Diagnostic
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: 'VPN Node Exit Flag', val: vpnAnalysis.isVpn, trueLabel: 'ACTIVE VPN', falseLabel: 'Direct Connection', danger: vpnAnalysis.isVpn },
                        { label: 'Anonymous Proxy', val: vpnAnalysis.isProxy, trueLabel: 'PROXY DETECTED', falseLabel: 'Direct Connection', danger: vpnAnalysis.isProxy },
                        { label: 'Tor Exit Point', val: vpnAnalysis.isTor, trueLabel: 'TOR NODE ROUTED', falseLabel: 'Clean / Direct', danger: vpnAnalysis.isTor },
                        { label: 'Datacenter Subnet', val: vpnAnalysis.isDatacenter, trueLabel: 'HOSTING SUBNET', falseLabel: 'ISP Subnet', danger: vpnAnalysis.isDatacenter },
                        { label: 'WebRTC Proxy Check', val: vpnAnalysis.webrtcLeak, trueLabel: 'LEAK DETECTED', falseLabel: 'Protected', danger: vpnAnalysis.webrtcLeak },
                      ].map((item) => (
                        <div key={item.label} className="card-flat p-3 flex justify-between items-center rounded-xl text-sm">
                          <span className="text-textMuted font-medium">{item.label}</span>
                          <span className={`font-semibold text-xs ${item.danger ? 'text-danger' : 'text-textMain'}`}>
                            {item.val ? item.trueLabel : item.falseLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                    {vpnAnalysis.explanation && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-textMuted leading-relaxed">
                        <span className="font-bold text-primary block mb-1">Diagnostics Notes:</span>
                        {vpnAnalysis.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB: HARDENING ─────────────────────────────────── */}
            {activeTab === 'hardening' && (
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col gap-5">
                <div className="card p-6 flex flex-col gap-5">
                  <div>
                    <h3 className="text-base font-bold text-textMain mb-2 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-secondary" />
                      Security Hardening Recommendations
                    </h3>
                    <p className="text-sm text-textMuted leading-relaxed">
                      Follow these measures to decrease the stability of persistent device fingerprint signals and block canvas auditing scripts.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-borderColor pt-5">
                    {privacyReport.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="card-flat p-4 flex gap-4 items-start rounded-xl">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-secondary"
                          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-textMain leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB: TIMELINE ──────────────────────────────────── */}
            {activeTab === 'timeline' && (
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col gap-5">
                {/* Comparison Engine */}
                <div className="card p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-textMain border-b border-borderColor pb-3">
                    Browser Signature Comparison Matrix
                  </h3>
                  <p className="text-sm text-textMuted leading-relaxed">
                    Calculate Jaccard similarity bounds and drift indices between this signature and another target fingerprint ID:
                  </p>
                  <form onSubmit={handleCompareSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter target Fingerprint ID..."
                      value={compareId}
                      onChange={(e) => setCompareId(e.target.value)}
                      className="flex-grow bg-cardBg border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textMain placeholder-textMuted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={compareLoading}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}
                    >
                      {compareLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Compare
                    </button>
                  </form>

                  {compareError && (
                    <p className="text-sm font-medium text-danger bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                      {compareError}
                    </p>
                  )}

                  {compareResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 mt-1">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { label: 'Similarity', value: `${compareResult.similarityPercentage}%`, color: 'text-success' },
                          { label: 'Drift Index', value: `${compareResult.differencePercentage}%`, color: 'text-danger' },
                          { label: 'Matching Signals', value: compareResult.matchingCount, color: 'text-textMain' },
                          { label: 'Modified Signals', value: compareResult.changedCount, color: 'text-warning' },
                        ].map((stat) => (
                          <div key={stat.label} className="card-flat p-4 text-center rounded-xl">
                            <p className="text-xs text-textMuted font-medium mb-1">{stat.label}</p>
                            <p className={`text-xl font-black ${stat.color} font-mono`}>{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="border border-borderColor rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                        {compareResult.changedSignals.length === 0 ? (
                          <p className="text-sm text-textMuted p-5 text-center">No signal drift detected. Parameters are identical.</p>
                        ) : (
                          compareResult.changedSignals.map((item: any, index: number) => (
                            <div key={index} className="p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-borderColor last:border-b-0 hover:bg-cardBg transition-colors">
                              <span className="text-xs font-semibold text-primary font-mono">{item.signal}</span>
                              <div className="flex items-center gap-2 text-xs text-textMuted font-mono">
                                <span className="text-danger truncate max-w-[120px]" title={JSON.stringify(item.val1)}>{JSON.stringify(item.val1)}</span>
                                <ArrowRight className="w-3 h-3 text-textMuted/40 shrink-0" />
                                <span className="text-success truncate max-w-[120px]" title={JSON.stringify(item.val2)}>{JSON.stringify(item.val2)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Timeline Table */}
                <div className="card overflow-hidden">
                  <div className="p-5 border-b border-borderColor flex items-center justify-between">
                    <h3 className="text-sm font-bold text-textMain">Visit History & Geographic Drift</h3>
                    <div className="flex items-center gap-2 bg-cardBg border border-borderColor rounded-lg px-3 py-1.5 text-xs font-medium text-textMuted">
                      <Clock className="w-3.5 h-3.5" />
                      <select
                        value={timelineFilter}
                        onChange={(e) => setTimelineFilter(e.target.value)}
                        className="bg-transparent text-textMain focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">All visits</option>
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table min-w-[640px]">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>IP Address</th>
                          <th>Location</th>
                          <th className="text-center">Risk Level</th>
                          <th className="text-center">Bot Score</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeline?.timeline?.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-textMuted italic py-10">
                              No tracking visit records available.
                            </td>
                          </tr>
                        ) : (
                          timeline?.timeline?.map((item: any, index: number) => (
                            <tr key={index}>
                              <td className="text-textMuted font-medium text-xs">
                                {mounted ? new Date(item.visitTime).toLocaleString() : item.visitTime}
                              </td>
                              <td className="font-mono text-xs select-all">{item.ipAddress}</td>
                              <td className="text-sm">{item.location}</td>
                              <td className="text-center">
                                <RiskBadge level={item.riskLevel} />
                              </td>
                              <td className="text-center font-mono font-bold text-xs">
                                {Math.round(item.botScore * 100)}%
                              </td>
                              <td className="text-center">
                                <button
                                  onClick={() => copyToClipboard(item.visitId, 'visitId')}
                                  className="text-xs font-semibold text-primary hover:text-secondary transition-colors font-mono"
                                >
                                  {copiedId === 'visitId' ? 'Copied!' : 'Copy ID'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
