'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  Activity, 
  Server, 
  Settings, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  LogOut,
  AlertOctagon,
  Globe,
  Settings2,
  Terminal
} from 'lucide-react';
import { ApiClient } from '../../lib/api';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState<any>(null);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings representation
  const [platformName, setPlatformName] = useState('Browser Fingerprinting Analytics');
  const [entropyThreshold, setEntropyThreshold] = useState('12.5');
  const [retentionDays, setRetentionDays] = useState('90');

  // Filter conditions
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [deviceFilter, setDeviceFilter] = useState('ALL');

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check authentication
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAnalytics();
      setAnalytics(data);

      const visitorData = await ApiClient.getAdminVisitors();
      setVisitors(visitorData);

      const logsData = await ApiClient.getAdminLogs();
      setAuditLogs(logsData);
    } catch (err) {
      console.error(err);
      // If error (forbidden), logout
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  if (!mounted) return null;
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <span className="text-xs font-bold text-primary tracking-widest uppercase font-mono animate-pulse">
            LOADING PLATFORM ANALYTICS...
          </span>
        </div>
      </div>
    );
  }

  // Filter logic for visitors list
  const filteredVisitors = visitors.filter(v => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      v.ipAddress.toLowerCase().includes(query) ||
      v.country.toLowerCase().includes(query) ||
      v.city.toLowerCase().includes(query) ||
      v.signals?.browserName.toLowerCase().includes(query) ||
      v.signals?.osName.toLowerCase().includes(query) ||
      v.fingerprintId.toLowerCase().includes(query);

    const matchesRisk = riskFilter === 'ALL' || v.privacyReport?.riskLevel === riskFilter;
    const matchesDevice = deviceFilter === 'ALL' || v.signals?.deviceType === deviceFilter;

    return matchesSearch && matchesRisk && matchesDevice;
  });

  const COLORS = ['#00E5FF', '#7C4DFF', '#00C853', '#FFD600', '#FF5252'];

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-white/5 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/5">
            <Shield className="w-6 h-6 text-primary animate-pulse" />
            <span className="font-extrabold tracking-tight text-white font-sans text-xs">
              BROWSER FINGERPRINTING ADMIN
            </span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'visitors', label: 'Visitor Logs', icon: Users },
              { id: 'bot-activity', label: 'Bot Intelligence', icon: AlertOctagon },
              { id: 'vpn-analysis', label: 'VPN Diagnostics', icon: Server },
              { id: 'audit-logs', label: 'Audit Logs', icon: Terminal },
              { id: 'settings', label: 'Configuration', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(0,229,255,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/5 text-xs font-semibold text-danger hover:bg-danger/10 hover:border-danger/20 transition-all mt-8"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </aside>

      {/* Main Admin Contents */}
      <main className="flex-1 bg-[#070b16] p-6 md:p-8 overflow-y-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white capitalize">{activeTab.replace('-', ' ')} Console</h1>
            <p className="text-xs text-gray-400 mt-1">Platform analytics and operational security diagnostics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 text-xs font-semibold transition-all text-gray-300 hover:text-white"
            >
              Refresh Logs
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && analytics && (
          <div className="space-y-8">
            {/* STATS HIGHLIGHT */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Visits', val: analytics.totalVisitors, desc: 'Aggregated client hits' },
                { label: 'Unique Fingerprints', val: analytics.uniqueVisitors, desc: 'Distinct device hashes' },
                { label: 'Automation Bots Flagged', val: analytics.botVisitors, desc: `${analytics.botVisitors} malicious browsers` },
                { label: 'VPN / Tor Connections', val: analytics.vpnVisitors, desc: 'Anonymized routing paths' }
              ].map((stat, i) => (
                <div key={i} className="glass-panel rounded-xl p-5 border border-white/5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">{stat.label}</span>
                  <h3 className="text-2xl font-black text-white">{stat.val}</h3>
                  <span className="text-[10px] text-gray-500 font-medium block mt-1">{stat.desc}</span>
                </div>
              ))}
            </div>

            {/* CHARTS CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Trends Area Chart */}
              <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5 min-h-[300px]">
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider font-mono">Visitor Trends (Last 7 Days)</h3>
                <div className="w-full h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.visitorTrends}>
                      <defs>
                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBots" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5252" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#FF5252" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#555" fontSize={10} />
                      <YAxis stroke="#555" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#131C31', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="visitors" stroke="#00E5FF" fillOpacity={1} fill="url(#colorVis)" strokeWidth={2} />
                      <Area type="monotone" dataKey="bots" stroke="#FF5252" fillOpacity={1} fill="url(#colorBots)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Distribution Pie */}
              <div className="glass-panel rounded-xl p-6 border border-white/5 min-h-[300px] flex flex-col justify-between">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">Risk Level Matrix</h3>
                <div className="w-full h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.riskDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#131C31', borderColor: 'rgba(255,255,255,0.05)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-bold border-t border-white/5 pt-4 mt-2">
                  {analytics.riskDistribution.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DISTRIBUTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Top Browsers', data: analytics.browserDistribution },
                { title: 'Top Operating Systems', data: analytics.osDistribution },
                { title: 'Top Countries', data: analytics.countryDistribution }
              ].map((dist, idx) => (
                <div key={idx} className="glass-panel rounded-xl p-6 border border-white/5">
                  <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider font-mono">{dist.title}</h3>
                  <div className="space-y-3">
                    {dist.data.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-400 truncate max-w-[150px]">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-900 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${(item.value / analytics.totalVisitors) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-[10px] font-bold font-mono">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: VISITOR LOGS */}
        {/* ======================================================== */}
        {activeTab === 'visitors' && (
          <div className="space-y-6">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by IP, country, browser, or Fingerprint ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Risk:</span>
                  <select 
                    value={riskFilter} 
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="bg-transparent text-white focus:outline-none"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Device:</span>
                  <select 
                    value={deviceFilter} 
                    onChange={(e) => setDeviceFilter(e.target.value)}
                    className="bg-transparent text-white focus:outline-none"
                  >
                    <option value="ALL">All Devices</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-gray-400 font-bold uppercase border-b border-white/5">
                    <tr>
                      <th className="p-4">Visitor IP & Location</th>
                      <th className="p-4">Browser & OS</th>
                      <th className="p-4">Fingerprint ID</th>
                      <th className="p-4 text-center">Threat Index</th>
                      <th className="p-4 text-center">VPN Link</th>
                      <th className="p-4 text-center">Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                    {filteredVisitors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No visitor logs match the specified search conditions.
                        </td>
                      </tr>
                    ) : (
                      filteredVisitors.map((v, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-all">
                          <td className="p-4">
                            <span className="font-bold text-white block">{v.ipAddress}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{v.city}, {v.country}</span>
                          </td>
                          <td className="p-4">
                            <span className="block">{v.signals?.browserName} ({v.signals?.browserVersion.split('.')[0]})</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{v.signals?.osName} {v.signals?.osVersion}</span>
                          </td>
                          <td className="p-4 font-mono text-[10px] select-all truncate max-w-[120px]" title={v.fingerprintId}>
                            {v.fingerprintId}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              v.privacyReport?.riskLevel === 'Critical' || v.privacyReport?.riskLevel === 'High'
                                ? 'bg-danger/10 text-danger border border-danger/20' 
                                : 'bg-success/10 text-success border border-success/20'
                            }`}>
                              {v.privacyReport?.riskLevel || 'Low'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold font-mono">
                            {v.vpnAnalysis?.isVpn ? (
                              <span className="text-primary text-[10px]">VPN</span>
                            ) : (
                              <span className="text-gray-500 text-[10px] font-normal">CLEAN</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={ApiClient.getReportUrl(v.fingerprintId, 'pdf')}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                                title="Download PDF Audit"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: BOT ACTIVITY */}
        {/* ======================================================== */}
        {activeTab === 'bot-activity' && (
          <div className="space-y-6">
            <div className="bg-red-950/15 border border-red-500/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Automation Threat Report</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Summary of bots, automation drivers, headless browsers, and crawler networks detected accessing the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel rounded-xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">Critical Detections (Automation)</h4>
                <div className="space-y-4">
                  {visitors.filter(v => v.botAnalysis?.classification === 'Likely Bot').slice(0, 5).map((v, idx) => (
                    <div key={idx} className="bg-black/30 border border-white/5 rounded-lg p-4 text-xs font-semibold flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">{v.ipAddress}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Tool: {v.botAnalysis?.automationTool}</span>
                      </div>
                      <span className="text-danger font-bold font-mono">{Math.round(v.botAnalysis?.botScore * 100)}% Bot Score</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">Common Indicators Flagged</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Active Webdrivers', val: visitors.filter(v => v.botAnalysis?.webdriver).length },
                    { label: 'Headless Browsers Signature', val: visitors.filter(v => v.botAnalysis?.headless).length },
                    { label: 'Restricted Font Matrices', val: visitors.filter(v => v.signals?.fontsHash === '00000000').length }
                  ].map((ind, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-400">{ind.label}</span>
                      <span className="text-white font-bold font-mono bg-white/5 px-2 py-0.5 rounded">{ind.val} counts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VPN ANALYSIS */}
        {/* ======================================================== */}
        {activeTab === 'vpn-analysis' && (
          <div className="space-y-6">
            <div className="bg-blue-950/15 border border-blue-500/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">VPN & Proxy Diagnostic Center</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Audits of WebRTC connection disclosures, remote timezone mismatches, datacenter subnet identifications, and exit route servers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Total Datacenter IP Visits', val: visitors.filter(v => v.vpnAnalysis?.isDatacenter).length },
                { title: 'WebRTC Disclosures Flagged', val: visitors.filter(v => v.vpnAnalysis?.webrtcLeak).length },
                { title: 'Tor Network Node Connections', val: visitors.filter(v => v.vpnAnalysis?.isTor).length }
              ].map((stat, i) => (
                <div key={i} className="glass-panel rounded-xl p-5 border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">{stat.title}</span>
                  <h3 className="text-3xl font-black text-white">{stat.val}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: AUDIT LOGS */}
        {/* ======================================================== */}
        {activeTab === 'audit-logs' && (
          <div className="space-y-6">
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-gray-400 font-bold uppercase border-b border-white/5">
                  <tr>
                    <th className="p-4">Action Type</th>
                    <th className="p-4">Audit Account</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Trigger IP</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No admin operations have been logged.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td className="p-4 font-bold text-white">{log.action}</td>
                        <td className="p-4">{log.user?.email || 'System'}</td>
                        <td className="p-4 text-gray-400 font-semibold">{log.details}</td>
                        <td className="p-4 font-mono">{log.ipAddress}</td>
                        <td className="p-4 font-semibold text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: SETTINGS CONFIGURATION */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="glass-panel rounded-xl p-6 border border-white/5 max-w-2xl">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider font-mono">Platform Global Settings</h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Platform System Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Minimum Unique Entropy Threshold (bits)</label>
                <input
                  type="text"
                  value={entropyThreshold}
                  onChange={(e) => setEntropyThreshold(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Visitor Data Retention Limit (Days)</label>
                <input
                  type="text"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                />
              </div>

              <button
                onClick={() => alert('Operational settings saved successfully.')}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-background font-bold text-xs hover:from-primary/95 hover:to-secondary/95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
              >
                APPLY GLOBAL CONFIGURATIONS
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
