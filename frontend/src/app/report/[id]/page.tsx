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
  ChevronRight
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
  PieChart,
  Pie,
  Legend
} from 'recharts';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [data, setData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'entropy' | 'timeline' | 'hardening'>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [mounted, setMounted] = useState(false);
  
  // Comparison state
  const [compareId, setCompareId] = useState('');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareError, setCompareError] = useState('');
  const [compareLoading, setCompareLoading] = useState(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (id) {
      fetchData();
    }
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background text-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <span className="text-xs font-bold text-primary tracking-widest uppercase font-mono animate-pulse">
            RETRIEVING SECURITY REPORT...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background text-gray-100 p-4">
        <div className="glass-panel max-w-md w-full rounded-2xl p-8 border border-red-500/15 text-center flex flex-col gap-6">
          <div className="p-3.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 w-fit mx-auto">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider">Report Load Failure</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-semibold">
            {error || 'The requested browser fingerprint record is unavailable.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link 
              href="/"
              className="px-6 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-gray-300 hover:text-white transition-all"
            >
              Back to Scan
            </Link>
            <button
              onClick={fetchData}
              className="px-6 py-2.5 rounded-lg bg-primary text-background font-black text-xs hover:bg-primary/90 transition-all"
            >
              Retry Load
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { visit, entropy } = data;
  const { signals, botAnalysis, vpnAnalysis, privacyReport } = visit;

  // Prepare chart data from entropy breakdown
  const chartData = entropy?.breakdown?.map((item: any) => ({
    name: item.signalName.replace('Hash', '').replace('Name', ''),
    entropy: Number(item.entropy.toFixed(2)),
    uniqueness: item.uniquenessScore
  })) || [];

  const pieData = [
    { name: 'Trackability', value: privacyReport.trackability * 100, color: '#FF5252' },
    { name: 'Stability', value: privacyReport.stabilityScore * 100, color: '#00C853' },
    { name: 'Exposure Risk', value: privacyReport.exposureRisk * 100, color: '#FFD600' },
    { name: 'Uniqueness Risk', value: privacyReport.uniquenessRisk * 100, color: '#00E5FF' },
  ];

  return (
    <ErrorBoundary>
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between z-20 bg-background/50 backdrop-blur-md sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary animate-pulse" />
          <span className="font-bold tracking-tight text-white font-sans text-sm md:text-base">
            Browser <span className="text-primary">Fingerprinting</span>
          </span>
        </Link>
        <div className="flex gap-3">
          <Link 
            href="/" 
            className="text-xs font-semibold px-4 py-2 rounded-md border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            New Scan
          </Link>
          <Link 
            href="/login" 
            className="text-xs font-semibold px-4 py-2 rounded-md border border-primary/20 text-primary hover:text-white hover:bg-primary/10 transition-all font-mono"
          >
            Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 z-10 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: NAVIGATION & SUMMARY CARDS */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {/* Identity Card */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2.5">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                privacyReport.riskLevel === 'Critical' || privacyReport.riskLevel === 'High'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {privacyReport.riskLevel} Risk
              </span>
            </div>
            
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Active Security Profile
            </span>
            <h2 className="text-xl font-extrabold text-white mb-4">
              {signals?.browserName || 'Web Browser'} ({signals?.osName || 'Generic OS'})
            </h2>
            
            <div className="flex flex-col gap-2.5 font-mono text-[10px] border-t border-white/5 pt-4">
              <div>
                <span className="text-gray-500 block font-bold mb-0.5">FINGERPRINT HASH V2</span>
                <div className="flex items-center justify-between gap-1.5 bg-black/45 rounded p-1.5 border border-white/5">
                  <span className="text-gray-300 truncate w-44">{id}</span>
                  <button 
                    onClick={() => copyToClipboard(id, 'id')}
                    className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedId === 'id' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block font-bold mb-0.5">STABLE IDENTIFIER</span>
                <div className="flex items-center justify-between gap-1.5 bg-black/45 rounded p-1.5 border border-white/5">
                  <span className="text-gray-300 truncate w-44">{data.stableHash}</span>
                  <button 
                    onClick={() => copyToClipboard(data.stableHash, 'stable')}
                    className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedId === 'stable' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Export Report Actions Card */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
              Export Audit Reports
            </h3>
            <a
              href={ApiClient.getReportUrl(id, 'pdf')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary text-background font-bold text-xs tracking-wider uppercase hover:bg-primary/95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.15)]"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Download PDF Audit
              </span>
              <Download className="w-3.5 h-3.5" />
            </a>
            
            <a
              href={ApiClient.getReportUrl(id, 'csv')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-gray-300 hover:text-white transition-all bg-white/5"
            >
              <span className="flex items-center gap-1.5 font-mono">
                CSV Row Format
              </span>
              <Download className="w-3.5 h-3.5" />
            </a>

            <a
              href={ApiClient.getReportUrl(id, 'json')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-gray-300 hover:text-white transition-all bg-white/5 font-mono"
            >
              <span>RAW JSON Payload</span>
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Navigation Tab list */}
          <div className="glass-panel rounded-2xl p-3 border border-white/5 flex flex-col gap-1">
            {[
              { id: 'overview', label: 'Security Overview', icon: Shield },
              { id: 'threats', label: 'Threat Profiling', icon: AlertTriangle },
              { id: 'entropy', label: 'Entropy & Signals', icon: Layers },
              { id: 'hardening', label: 'Hardening Audit', icon: Lock },
              { id: 'timeline', label: 'Visit Drift Timeline', icon: Clock },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    activeTab === tab.id
                      ? 'bg-secondary text-white shadow-[0_0_15px_rgba(124,77,255,0.25)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL WORK AREA */}
        <div className="flex-grow flex flex-col gap-6 min-w-0">
          
          {/* ========================================================== */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================== */}
          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-xl p-4 border border-white/5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Human Reliability</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">{Math.round(botAnalysis.humanScore * 100)}%</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">{botAnalysis.classification}</span>
                </div>

                <div className="glass-panel rounded-xl p-4 border border-white/5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Connection Shield</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">{vpnAnalysis.isVpn ? 'VPN Active' : 'Direct Link'}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium truncate mt-1 block max-w-full" title={vpnAnalysis.isp}>
                    ISP: {vpnAnalysis.isp}
                  </span>
                </div>

                <div className="glass-panel rounded-xl p-4 border border-white/5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Shannon Entropy</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">{entropy?.totalEntropy || '14.50'}</span>
                    <span className="text-[10px] text-gray-500 font-mono">bits</span>
                  </div>
                  <span className="text-[10px] text-primary font-semibold mt-1 block">{entropy?.strength || 'Moderate'} strength</span>
                </div>

                <div className="glass-panel rounded-xl p-4 border border-white/5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Uniqueness Metric</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">{entropy?.uniquenessScore || '92.5'}%</span>
                  </div>
                  <span className="text-[10px] text-secondary font-semibold mt-1 block">DRIFT SIMILARITY BASELINE</span>
                </div>
              </div>

              {/* Browser details and User Agent panel */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  Browser security summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-300">
                  <div className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5">
                    <span className="text-gray-500">Browser Engine</span>
                    <span>{signals?.browserName} v{signals?.browserVersion}</span>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5">
                    <span className="text-gray-500">OS Architecture</span>
                    <span>{signals?.osName} v{signals?.osVersion}</span>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5">
                    <span className="text-gray-500">Device Category</span>
                    <span className="capitalize">{signals?.deviceType || 'Desktop'}</span>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5">
                    <span className="text-gray-500">Visitor Location</span>
                    <span>{visit.city}, {visit.country}</span>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5 md:col-span-2">
                    <span className="text-gray-500 shrink-0 mr-4">User Agent</span>
                    <span className="font-mono text-[10px] truncate select-all max-w-lg" title={visit.userAgent}>
                      {visit.userAgent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Graphic Radar Threat Vectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 min-h-[300px]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Privacy threat vector index
                  </h3>
                  <div className="w-full h-52 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" stroke="#555" fontSize={10} domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" stroke="#555" fontSize={10} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Metric Value']} contentStyle={{ backgroundColor: '#0A0F1F', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
                    Diagnostics Score
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between font-mono text-xs font-semibold">
                      <span className="text-gray-400">Exposure Index</span>
                      <span className="text-yellow-400">{(privacyReport.exposureRisk * 10).toFixed(1)} / 10.0</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs font-semibold">
                      <span className="text-gray-400">Trackability ratio</span>
                      <span className="text-red-400">{(privacyReport.trackability * 10).toFixed(1)} / 10.0</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs font-semibold">
                      <span className="text-gray-400">Stability profile</span>
                      <span className="text-green-400">{(privacyReport.stabilityScore * 10).toFixed(1)} / 10.0</span>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-white/5 pt-4 text-center">
                    <span className="text-[10px] text-gray-500 font-mono block">
                      Shannon calculated match bounds: {entropy?.populationMatchEstimate || '1 in 16k users'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: THREAT PROFILING */}
          {/* ========================================================== */}
          {activeTab === 'threats' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bot Analysis details */}
                <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-red-400" />
                    Bot & automation detection
                  </h3>

                  <div className="flex flex-col gap-3">
                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">Automation Webdriver</span>
                      <span className={botAnalysis.webdriver ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {botAnalysis.webdriver ? 'webdriver active' : 'disabled / clean'}
                      </span>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">Headless Browser Signature</span>
                      <span className={botAnalysis.headless ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {botAnalysis.headless ? 'headless mode flagged' : 'standard window context'}
                      </span>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">Automation Tool Framework</span>
                      <span className={botAnalysis.automationTool !== 'None' ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {botAnalysis.automationTool}
                      </span>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">Timing Anomalies Checked</span>
                      <span className={botAnalysis.timingAnomaly ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {botAnalysis.timingAnomaly ? 'anomaly flagged' : 'normal execution timing'}
                      </span>
                    </div>
                  </div>

                  {botAnalysis.explanations && botAnalysis.explanations.length > 0 && (
                    <div className="mt-2 bg-red-950/10 border border-red-500/10 rounded-xl p-4">
                      <h4 className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2">Flag Explanations:</h4>
                      <ul className="text-[10px] text-gray-400 space-y-1.5 list-disc list-inside">
                        {botAnalysis.explanations.map((exp: string, index: number) => (
                          <li key={index} className="leading-relaxed">{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* VPN & Connection details */}
                <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    VPN & Proxy Diagnostic
                  </h3>

                  <div className="flex flex-col gap-3">
                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">VPN Node Exit Flag</span>
                      <span className={vpnAnalysis.isVpn ? 'text-primary font-bold' : 'text-gray-300'}>
                        {vpnAnalysis.isVpn ? 'ACTIVE VPN' : 'Direct Link Connection'}
                      </span>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">Anonymous Proxy</span>
                      <span className={vpnAnalysis.isProxy ? 'text-primary font-bold' : 'text-gray-300'}>
                        {vpnAnalysis.isProxy ? 'PROXY ROUTE DETECTED' : 'Direct Connection'}
                      </span>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">Tor Network exit point</span>
                      <span className={vpnAnalysis.isTor ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {vpnAnalysis.isTor ? 'TOR NODE ROUTED' : 'Clean / Direct Link'}
                      </span>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">Datacenter Subnet Block</span>
                      <span className={vpnAnalysis.isDatacenter ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {vpnAnalysis.isDatacenter ? 'HOSTING SUBNET' : 'ISP Subnet Link'}
                      </span>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3.5 border border-white/5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">WebRTC Channel Leaks</span>
                      <span className={vpnAnalysis.webrtcLeak ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {vpnAnalysis.webrtcLeak ? 'VULNERABLE / LEAK' : 'Protected Socket'}
                      </span>
                    </div>
                  </div>

                  {vpnAnalysis.explanation && (
                    <div className="mt-2 bg-blue-950/10 border border-blue-500/10 rounded-xl p-4 text-[10px] text-gray-400 leading-relaxed">
                      <span className="font-bold text-primary block mb-1">Diagnostics Notes:</span>
                      {vpnAnalysis.explanation}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: ENTROPY & SIGNALS */}
          {/* ========================================================== */}
          {activeTab === 'entropy' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Shannon Entropy Bar Chart */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 min-h-[350px]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Shannon Entropy per browser signal vector (bits)
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ bottom: 20 }}>
                      <XAxis dataKey="name" stroke="#555" fontSize={10} angle={-30} textAnchor="end" />
                      <YAxis stroke="#555" fontSize={10} label={{ value: 'Entropy Bits', angle: -90, position: 'insideLeft', style: { fill: '#555', fontSize: '10px' } }} />
                      <Tooltip formatter={(value) => [`${value} bits`, 'Entropy Value']} contentStyle={{ backgroundColor: '#0A0F1F', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                      <Bar dataKey="entropy" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Entropy list details table */}
              <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-950 text-gray-400 font-bold uppercase border-b border-white/5 font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Signal Vector Name</th>
                        <th className="p-4">Extracted Signature Hash / Value</th>
                        <th className="p-4 text-center">Shannon Entropy</th>
                        <th className="p-4 text-center">Uniqueness Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300 font-semibold">
                      {entropy?.breakdown?.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-white/5 transition-all">
                          <td className="p-4 font-bold capitalize text-white font-mono text-[11px]">
                            {item.signalName.replace('Hash', '').replace('Name', '')}
                          </td>
                          <td className="p-4 font-mono text-[10px] max-w-[200px] truncate select-all" title={item.value}>
                            {item.value}
                          </td>
                          <td className="p-4 text-center font-mono text-primary font-bold">
                            {item.entropy.toFixed(2)} <span className="text-[10px] text-gray-500 font-normal">bits</span>
                          </td>
                          <td className="p-4 text-center font-mono text-secondary font-bold">
                            {item.uniquenessScore}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: HARDENING AUDIT */}
          {/* ========================================================== */}
          {activeTab === 'hardening' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-secondary animate-pulse" />
                    Security Hardening Recommendations
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Follow these step-by-step measures to decrease the stability of persistent device fingerprint signals and block canvas auditing scripts.
                  </p>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                  {privacyReport.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="bg-black/35 rounded-xl border border-white/5 p-4 flex gap-4 items-start">
                      <div className="shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center font-mono text-[10px] font-bold text-secondary">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-white leading-relaxed">{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: VISITED TIMELINE */}
          {/* ========================================================== */}
          {activeTab === 'timeline' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Comparison Engine Card */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Browser signature comparison matrix
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  Calculate Jaccard similarity bounds and drift indices between this signature and another target fingerprint ID:
                </p>
                <form onSubmit={handleCompareSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter benchmark V2 Fingerprint ID..."
                    value={compareId}
                    onChange={(e) => setCompareId(e.target.value)}
                    className="flex-grow bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-secondary/40 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={compareLoading}
                    className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-secondary/95 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(124,77,255,0.15)] flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {compareLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    RUN COMPARISON
                  </button>
                </form>

                {compareError && (
                  <span className="text-xs font-semibold text-red-400 font-mono mt-1 block">
                    [ERROR] {compareError}
                  </span>
                )}

                {compareResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/35 rounded-xl border border-white/5 p-5 flex flex-col gap-5 mt-2"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">Similarity index</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">{compareResult.similarityPercentage}%</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">drift index</span>
                        <span className="text-lg font-black text-red-400 font-mono">{compareResult.differencePercentage}%</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">matching signals</span>
                        <span className="text-lg font-black text-white font-mono">{compareResult.matchingCount}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">modified signals</span>
                        <span className="text-lg font-black text-yellow-400 font-mono">{compareResult.changedCount}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-t border-white/5 pt-4">
                      Telemetry signal modifications
                    </h4>
                    
                    <div className="max-h-[200px] overflow-y-auto border border-white/5 rounded-lg divide-y divide-white/5 bg-slate-950 font-mono text-[10px]">
                      {compareResult.changedSignals.length === 0 ? (
                        <p className="text-gray-500 p-4 text-center italic">No signal drift detected. Device parameters are identical.</p>
                      ) : (
                        compareResult.changedSignals.map((item: any, index: number) => (
                          <div key={index} className="p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-white/[0.02] transition-colors">
                            <span className="text-primary font-bold">{item.signal}</span>
                            <div className="flex items-center gap-2 text-gray-400 font-semibold truncate max-w-sm">
                              <span className="text-red-400 truncate block max-w-[120px]" title={JSON.stringify(item.val1)}>{JSON.stringify(item.val1)}</span>
                              <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                              <span className="text-emerald-400 truncate block max-w-[120px]" title={JSON.stringify(item.val2)}>{JSON.stringify(item.val2)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Historical Visited log list */}
              <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Visit history & geographic drift
                  </h3>
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-gray-400 font-mono">
                    <span className="text-gray-500 uppercase">TIMELINE LIMIT:</span>
                    <select 
                      value={timelineFilter} 
                      onChange={(e) => setTimelineFilter(e.target.value)}
                      className="bg-transparent text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All visits</option>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-gray-400 font-bold uppercase border-b border-white/5 font-mono text-[9px]">
                      <tr>
                        <th className="p-4">Visit timestamp</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Resolved Location</th>
                        <th className="p-4 text-center">Threat Risk Index</th>
                        <th className="p-4 text-center">Bot Score</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300 font-semibold">
                      {timeline?.timeline?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500 italic">No tracking visit records available.</td>
                        </tr>
                      ) : (
                        timeline?.timeline?.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-white/5 transition-all">
                            <td className="p-4 text-gray-400 font-bold">
                              {new Date(item.visitTime).toLocaleString()}
                            </td>
                            <td className="p-4 font-mono text-[10px] select-all">{item.ipAddress}</td>
                            <td className="p-4">{item.location}</td>
                            <td className="p-4 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                item.riskLevel === 'Critical' || item.riskLevel === 'High'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {item.riskLevel}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold">
                              {Math.round(item.botScore * 100)}%
                            </td>
                            <td className="p-4 text-center">
                              <Link 
                                href={`/report/${id}`} // links back to current V2 index or reload
                                className="text-secondary hover:text-white transition-colors text-[10px] font-mono font-bold flex items-center gap-0.5 justify-center"
                              >
                                LOAD
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
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

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-white/5 z-20 text-[11px] text-gray-500 font-mono mt-16">
        Browser Fingerprinting analyzer platform © 2026. Built with Next.js 15, Node.js, and Prisma.
      </footer>
    </div>
    </ErrorBoundary>
  );
}
