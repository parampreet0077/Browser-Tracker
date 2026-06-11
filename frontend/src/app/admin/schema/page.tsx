'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Database, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Search,
  AlertTriangle,
  RefreshCw,
  Info,
  Lock,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import { ApiClient } from '../../../lib/api';
import Link from 'next/link';

export default function SchemaInspectorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);
    fetchSchemaData();
  };

  const fetchSchemaData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getSchemaInspector();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await ApiClient.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('user_role', res.user.role);
      setIsAuthenticated(true);
      fetchSchemaData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Verify your admin credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const filteredSignals = data?.signals?.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background text-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <span className="text-xs font-bold text-primary tracking-widest uppercase font-mono animate-pulse">
            Loading Schema Audit...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background text-gray-100 p-4">
        <div className="glass-panel max-w-sm w-full rounded-2xl p-8 border border-white/5 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="p-3.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">Admin Authentication</h2>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">
              Schema Inspector requires administrator authentication privileges. Log in with your standard credentials below.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@antigravity.io"
                className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-secondary/40 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-secondary/40 font-mono"
              />
            </div>

            {loginError && (
              <span className="text-[10px] font-semibold text-red-400 font-mono block">
                [ERROR] {loginError}
              </span>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-background font-black text-xs tracking-wider uppercase hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
            >
              {loginLoading ? 'Authenticating...' : 'LOG IN TO INSPECTOR'}
              <ArrowRight className="w-3.5 h-3.5 fill-background" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between z-20 bg-background/50 backdrop-blur-md sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary animate-pulse" />
          <span className="font-bold tracking-tight text-white font-sans text-sm md:text-base">
            Browser Fingerprinting <span className="text-primary">ADMIN CONSOLE</span>
          </span>
        </Link>
        <div className="flex gap-3">
          <Link 
            href="/" 
            className="text-xs font-semibold px-4 py-2 rounded-md border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Scanner Home
          </Link>
          <button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              setIsAuthenticated(false);
            }} 
            className="text-xs font-semibold px-4 py-2 rounded-md border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-all"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 z-10 flex flex-col gap-6">
        
        {/* Info Banner */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-gray-600 select-none">
            SYSTEM STATUS: ONLINE
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary mt-1 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wider font-sans">
                SQLite Signal Schema Auditor
              </h1>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed max-w-xl mt-1">
                Verify SQLite schema definitions against collector payloads in real time. Validates Case B integration where dynamic browser signals are stored in JSON objects to avoid unnecessary database migrations.
              </p>
            </div>
          </div>

          <button 
            onClick={fetchSchemaData} 
            className="px-5 py-2 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-gray-300 hover:text-white transition-all bg-white/5 flex items-center gap-1.5 self-end md:self-auto shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH AUDIT
          </button>
        </div>

        {/* Diagnostic Error Hud if database fails */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-5 flex items-start gap-3.5 text-left font-mono text-[10px] text-gray-300 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center">
                <span className="font-bold text-red-400 text-xs">AUDIT FAULT DETECTED</span>
                <span className="text-gray-500 uppercase">STATUS CODE: {error.status || 500}</span>
              </div>
              <p className="text-gray-400 font-sans font-semibold text-xs mt-1">{error.message || 'The schema audit process encountered a database error.'}</p>
              
              <div className="bg-slate-950/50 border border-white/5 p-3 rounded mt-2">
                <span className="text-[9px] text-red-400 font-bold block mb-1">SUGGESTED CORRECTION:</span>
                <span className="text-gray-300">{error.suggestedFix || 'Check SQLite database connections, lock states, or prisma client schemas.'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Database Metrics Stats */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-xl p-4 border border-white/5 flex flex-col justify-between h-20">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">DATABASE ENGINE</span>
              <span className="text-base font-black text-white uppercase mt-1">{data.databaseType || 'SQLite'}</span>
            </div>

            <div className="glass-panel rounded-xl p-4 border border-white/5 flex flex-col justify-between h-20">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">TARGET TABLE</span>
              <span className="text-base font-black text-primary font-mono mt-1">`{data.tableName || 'signals'}`</span>
            </div>

            <div className="glass-panel rounded-xl p-4 border border-white/5 flex flex-col justify-between h-20">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">TOTAL SAVED VISITS</span>
              <span className="text-base font-black text-white font-mono mt-1">{data.totalVisits} visits</span>
            </div>

            <div className="glass-panel rounded-xl p-4 border border-white/5 flex flex-col justify-between h-20">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">TOTAL SIGNALS DATA</span>
              <span className="text-base font-black text-white font-mono mt-1">{data.totalSignals} entries</span>
            </div>
          </div>
        )}

        {/* Schema Inspection Grid and Columns List */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Table audit list (Left 2 cols) */}
            <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 flex flex-col gap-4 p-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Telemetry Signals Mapping Alignment
                </h3>
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Search signal name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-secondary/40 font-mono"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden mt-1">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-950 text-gray-400 font-bold uppercase border-b border-white/5 font-mono text-[9px] tracking-wider">
                    <tr>
                      <th className="p-4">Signal Key</th>
                      <th className="p-4 text-center">Schema Column</th>
                      <th className="p-4 text-center">Stored in JSON</th>
                      <th className="p-4 text-center">Source Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300 font-semibold">
                    {filteredSignals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-500 italic">No matching signals found.</td>
                      </tr>
                    ) : (
                      filteredSignals.map((signal: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-white font-bold font-mono text-[11px]">{signal.name}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center">
                              {signal.existsInSchema ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Active Column
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                  <XCircle className="w-3.5 h-3.5 text-gray-600" />
                                  Not in Columns
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center">
                              {signal.storedInJson ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Payload Stored
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                                  No
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                              signal.existsInSchema 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-secondary/10 border-secondary/20 text-secondary shadow-[0_0_8px_rgba(124,77,255,0.05)]'
                            }`}>
                              {signal.source}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Valid Columns Details List (Right 1 col) */}
            <div className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col gap-4 h-fit">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Raw SQLite Columns List
              </h3>
              
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {data.columns?.map((col: string, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-black/20 rounded-lg border border-white/5 font-mono text-[10px] text-gray-300">
                    <span className="font-bold text-white">{col}</span>
                    <span className="text-gray-500 uppercase tracking-widest text-[8px] font-sans">PRISMA DECLARED</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 text-[10px] leading-relaxed text-gray-400 mt-2 flex gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Declaring properties dynamically allows the entropy engine to load all payload parameters under Case B structure while preventing raw schema query validation errors on sqlite database instances.
                </span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-white/5 z-20 text-[11px] text-gray-500 font-mono mt-16">
        Browser Fingerprinting analyzer platform © 2026. Built with Next.js 15, Node.js, and Prisma.
      </footer>
    </div>
  );
}
