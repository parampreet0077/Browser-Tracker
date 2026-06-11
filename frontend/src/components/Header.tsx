'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Scan } from 'lucide-react';

interface HeaderProps {
  onAnalyzeClick?: () => void;
  showAnalyzeButton?: boolean;
}

export default function Header({ onAnalyzeClick, showAnalyzeButton = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-glass shadow-nav' : 'bg-white/80 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center shadow-sm group-hover:shadow-primary-glow transition-shadow duration-300">
            <Shield className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base text-textMain tracking-tight">
            Browser <span className="gradient-text">Tracker</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/about"
            className="px-4 py-2 text-sm font-medium text-textMuted hover:text-textMain hover:bg-slate-50 rounded-lg transition-all duration-200"
          >
            About
          </Link>
          <Link
            href="/privacy-policy"
            className="px-4 py-2 text-sm font-medium text-textMuted hover:text-textMain hover:bg-slate-50 rounded-lg transition-all duration-200"
          >
            Privacy Policy
          </Link>

          {showAnalyzeButton && (
            <button
              id="header-analyze-btn"
              onClick={onAnalyzeClick}
              className="ml-3 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}
            >
              <Scan className="w-4 h-4" />
              Analyze Browser
            </button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-textMuted hover:text-textMain hover:bg-slate-50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-borderColor bg-white overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-textMuted hover:text-textMain hover:bg-slate-50 rounded-lg transition-all"
              >
                About
              </Link>
              <Link
                href="/privacy-policy"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-textMuted hover:text-textMain hover:bg-slate-50 rounded-lg transition-all"
              >
                Privacy Policy
              </Link>
              {showAnalyzeButton && (
                <button
                  onClick={() => { setMobileOpen(false); onAnalyzeClick?.(); }}
                  className="mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white w-full"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}
                >
                  <Scan className="w-4 h-4" />
                  Analyze Browser
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
