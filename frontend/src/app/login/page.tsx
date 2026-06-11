'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, Mail, AlertCircle } from 'lucide-react';
import { ApiClient } from '../../lib/api';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await ApiClient.login({ email, password });
      localStorage.setItem('auth_token', res.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-white/5 relative overflow-hidden">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Admin Console</h1>
          <p className="text-xs text-gray-400 mt-1">Authenticate to access platform visitor databases</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Login Failed</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="admin@fingerprint.intel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-background font-bold text-xs hover:from-primary/95 hover:to-secondary/95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING OPERATIONS...' : 'LOGIN TO ADMIN AREA'}
          </button>
        </form>

        <div className="border-t border-white/5 pt-6 mt-8 text-center">
          <span className="text-[10px] text-gray-500 block">Default Setup Access Credentials:</span>
          <span className="text-[10px] text-gray-400 font-mono font-semibold block mt-1">
            admin@fingerprint.intel / AdminPass123!
          </span>
        </div>
      </div>
    </div>
  );
}
