'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Globe,
  Clock,
  Languages,
  Cpu,
  ImageIcon,
  Layers,
  Music,
  Type,
  Lock,
  Eye,
  Search,
  Users,
  GraduationCap,
  Code2,
  Bug,
  FlaskConical,
  Fingerprint,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  Scan,
  Bot,
  Wifi,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Scanner from '../components/Scanner';

// ─── Animation Variants ─────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── Data ───────────────────────────────────────────────────────────────────
const features = [
  { icon: Fingerprint, text: 'Browser Fingerprint Analysis' },
  { icon: BarChart3, text: 'Entropy & Uniqueness Detection' },
  { icon: Eye, text: 'Privacy Exposure Assessment' },
  { icon: AlertTriangle, text: 'Browser Tracking Risk Analysis' },
  { icon: Monitor, text: 'Device & Environment Identification' },
  { icon: Bot, text: 'Bot & Automation Detection' },
  { icon: ShieldCheck, text: 'Security Research Dashboard' },
  { icon: FileText, text: 'Professional Audit Reports' },
];

const flowSteps = [
  { icon: Monitor, label: 'Browser', desc: 'Your browser environment is detected' },
  { icon: Scan, label: 'Signals Collected', desc: 'Canvas, WebGL, audio, fonts, and 50+ signals' },
  { icon: Fingerprint, label: 'Fingerprint Generated', desc: 'A unique hash is computed from signals' },
  { icon: BarChart3, label: 'Entropy Analysis', desc: 'Shannon entropy measures uniqueness' },
  { icon: FileText, label: 'Privacy Report', desc: 'Full report with risk assessment' },
];

const analyzeCards = [
  { icon: Monitor, label: 'Browser Information', color: '#0EA5E9' },
  { icon: Cpu, label: 'Operating System', color: '#2563EB' },
  { icon: Layers, label: 'Screen Configuration', color: '#7C3AED' },
  { icon: Clock, label: 'Timezone', color: '#DB2777' },
  { icon: Languages, label: 'Language', color: '#EA580C' },
  { icon: ImageIcon, label: 'Canvas Fingerprint', color: '#16A34A' },
  { icon: Globe, label: 'WebGL', color: '#0891B2' },
  { icon: Music, label: 'Audio Fingerprint', color: '#DC2626' },
  { icon: Type, label: 'Fonts', color: '#9333EA' },
  { icon: Lock, label: 'Security Signals', color: '#64748B' },
];

const whyMatters = [
  {
    icon: Eye,
    title: 'Privacy Awareness',
    desc: 'Understand exactly what information your browser reveals about you to every website you visit.',
  },
  {
    icon: AlertTriangle,
    title: 'Browser Tracking',
    desc: 'See how advertisers and trackers build persistent profiles without cookies using your fingerprint.',
  },
  {
    icon: BarChart3,
    title: 'Fingerprint Uniqueness',
    desc: 'Discover how unique your browser fingerprint is among millions of internet users.',
  },
  {
    icon: Search,
    title: 'Online Identification',
    desc: 'Learn how fingerprinting can identify you across sessions even in private browsing mode.',
  },
  {
    icon: ShieldCheck,
    title: 'Security Research',
    desc: 'Useful for researchers, developers, and professionals studying web tracking techniques.',
  },
];

const audiences = [
  { icon: Shield, label: 'Privacy Enthusiasts', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { icon: GraduationCap, label: 'Cyber Security Students', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { icon: FlaskConical, label: 'Researchers', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  { icon: Code2, label: 'Developers', color: 'bg-green-50 text-green-600 border-green-100' },
  { icon: ShieldCheck, label: 'Security Professionals', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { icon: Users, label: 'Students', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { icon: Bug, label: 'Bug Bounty Hunters', color: 'bg-red-50 text-red-600 border-red-100' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showScanner, setShowScanner] = useState(false);

  const handleAnalyzeClick = () => {
    setShowScanner(true);
    // Scroll to scanner section
    setTimeout(() => {
      document.getElementById('scanner-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onAnalyzeClick={handleAnalyzeClick} />

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden dot-grid">
        {/* Glow blobs */}
        <div
          className="glow-blob w-[600px] h-[600px] top-[-200px] right-[-100px]"
          style={{ background: 'radial-gradient(circle, #BAE6FD 0%, #E0F2FE 40%, transparent 70%)' }}
        />
        <div
          className="glow-blob w-[400px] h-[400px] bottom-[-100px] left-[-100px]"
          style={{ background: 'radial-gradient(circle, #EDE9FE 0%, #F5F3FF 40%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="badge badge-primary">
                <Sparkles className="w-3 h-3" />
                Privacy & Security Research Platform
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-textMain leading-[1.08] tracking-tight mb-5"
            >
              Browser{' '}
              <span className="gradient-text">Tracker</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="text-xl font-semibold text-textMuted mb-4"
            >
              Privacy &amp; Browser Tracking Audit Tool
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="text-base text-textMuted leading-relaxed max-w-xl mx-auto mb-10"
            >
              Discover how websites identify and track your browser.
              Analyze your browser fingerprint, uniqueness, entropy,
              tracking risk, and privacy exposure.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <button
                id="hero-analyze-btn"
                onClick={handleAnalyzeClick}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                  boxShadow: '0 8px 30px rgb(14 165 233 / 0.35)',
                }}
              >
                <Scan className="w-5 h-5" />
                Analyze My Browser
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-medium text-textMuted border border-borderColor hover:border-primary hover:text-primary hover:bg-blue-50 transition-all duration-200"
              >
                Learn More
              </a>
            </motion.div>

          </div>

          {/* Features row */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className="card p-4 flex items-center gap-3 group cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm font-semibold text-textMain">{f.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── SCANNER SECTION ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showScanner && (
          <motion.section
            id="scanner-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="py-16 bg-cardBg border-y border-borderColor"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <Scanner onScanComplete={() => {}} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="badge badge-primary mb-4">How It Works</span>
            <h2 className="section-title mb-4">How Browser Fingerprinting Works</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              A visual walkthrough of how your browser signals are collected, processed, and analyzed.
            </p>
          </motion.div>

          {/* Animated Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-primary via-secondary to-transparent hidden md:block" style={{ transform: 'translateX(-50%)' }} />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
              className="flex flex-col gap-6"
            >
              {flowSteps.map((step, i) => {
                const Icon = step.icon;
                const isRight = i % 2 !== 0;
                return (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    className={`flex items-center gap-6 ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} flex-col md:flex-row`}
                  >
                    <div className={`flex-1 ${isRight ? 'md:text-right' : ''}`}>
                      <div className={`card p-5 inline-block w-full md:max-w-xs text-left ${isRight ? 'md:ml-auto' : ''}`}>
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">
                          Step {i + 1}
                        </p>
                        <h3 className="font-bold text-textMain text-base mb-1">{step.label}</h3>
                        <p className="text-sm text-textMuted">{step.desc}</p>
                      </div>
                    </div>

                    {/* Center icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-card-hover"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE ANALYZE ─────────────────────────────────────────── */}
      <section className="py-24 bg-cardBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="badge badge-primary mb-4">Signal Analysis</span>
            <h2 className="section-title mb-4">What We Analyze</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Browser Tracker collects and analyzes over 50 browser signals to generate your unique fingerprint.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {analyzeCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className="card p-5 flex flex-col items-center gap-3 text-center group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                    style={{ background: `${card.color}18` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <span className="text-sm font-semibold text-textMain leading-tight">{card.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── WHY THIS MATTERS ────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="badge badge-primary mb-4">Why It Matters</span>
            <h2 className="section-title mb-4">Why This Matters</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Understanding browser fingerprinting is the first step to protecting your online privacy.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {whyMatters.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} className="card p-6 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
                    style={{ background: '#EFF6FF' }}>
                    <Icon className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="font-bold text-textMain text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-textMuted leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── WHO SHOULD USE THIS ─────────────────────────────────────── */}
      <section className="py-24 bg-cardBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="badge badge-primary mb-4">Who Should Use This</span>
            <h2 className="section-title mb-4">Built For Everyone</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Whether you're a student, researcher, or security professional — Browser Tracker gives you the insights you need.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-4"
          >
            {audiences.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border font-semibold text-sm transition-all duration-200 hover:scale-105 cursor-default ${a.color}`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {a.label}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="p-10 rounded-3xl border border-borderColor"
            style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 50%, #F5F3FF 100%)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-primary-glow"
              style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-textMain mb-4 tracking-tight">
              Ready to Audit Your Privacy?
            </h2>
            <p className="text-base text-textMuted mb-8 leading-relaxed">
              Run a full browser fingerprint analysis in seconds. No account required. No data stored beyond your session.
            </p>
            <button
              onClick={handleAnalyzeClick}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                boxShadow: '0 8px 30px rgb(14 165 233 / 0.35)',
              }}
            >
              <Scan className="w-5 h-5" />
              Start Free Analysis
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
