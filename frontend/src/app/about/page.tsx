'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Fingerprint,
  BarChart3,
  Eye,
  GraduationCap,
  Code2,
  Lock,
  Globe,
  Cpu,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Target,
  Layers,
  Users,
  Sparkles,
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const features = [
  { icon: Fingerprint, label: 'Browser Fingerprint Analysis', desc: 'Collect and analyze 50+ browser signals to generate a unique fingerprint hash.' },
  { icon: BarChart3, label: 'Entropy & Uniqueness Scoring', desc: 'Calculate Shannon entropy and uniqueness percentile among all analyzed browsers.' },
  { icon: Eye, label: 'Privacy Exposure Assessment', desc: 'Evaluate your privacy risk level based on fingerprint stability and uniqueness.' },
  { icon: Shield, label: 'Bot & Automation Detection', desc: 'Detect automation frameworks, headless browsers, and webdriver signatures.' },
  { icon: Globe, label: 'VPN & Proxy Detection', desc: 'Identify VPN exits, proxy routes, Tor nodes, and datacenter subnets.' },
  { icon: Lock, label: 'Security Hardening Advice', desc: 'Receive actionable recommendations to reduce your fingerprint exposure.' },
  { icon: Layers, label: 'Multi-Hash Fingerprinting', desc: 'Generate Hash V1, V2, and Privacy Hash for comprehensive identification.' },
  { icon: Code2, label: 'Developer Audit Reports', desc: 'Export PDF, CSV, or JSON reports for research and documentation.' },
];

const howItWorks = [
  { step: '01', title: 'Signal Collection', desc: 'Your browser shares dozens of attributes — screen size, GPU, fonts, timezone, language, and more. These are collected client-side using JavaScript APIs.' },
  { step: '02', title: 'Fingerprint Generation', desc: 'The collected signals are hashed using multiple algorithms to produce stable, unique identifiers that persist across browser sessions.' },
  { step: '03', title: 'Entropy Calculation', desc: 'Shannon entropy is calculated for each signal to measure how much identifying information it contributes to the overall fingerprint.' },
  { step: '04', title: 'Privacy Analysis', desc: 'Risk scores, uniqueness percentiles, and threat indicators are computed to assess your overall privacy exposure.' },
  { step: '05', title: 'Report Generation', desc: 'A comprehensive audit report is generated with all findings, recommendations, and exportable data.' },
];

const techStack = [
  { label: 'Next.js 15', desc: 'React framework for the frontend' },
  { label: 'TypeScript', desc: 'Type-safe development' },
  { label: 'Node.js + Express', desc: 'Backend API server' },
  { label: 'Prisma ORM', desc: 'Database management' },
  { label: 'SQLite', desc: 'Lightweight data storage' },
  { label: 'Framer Motion', desc: 'Smooth UI animations' },
];

const researchGoals = [
  'Educate users about browser fingerprinting techniques used by advertisers and trackers',
  'Provide a transparent, open analysis of what data browsers expose to websites',
  'Help security researchers and students study fingerprinting entropy and uniqueness',
  'Enable developers to test their applications against fingerprinting detection',
  'Promote privacy awareness and informed decision-making online',
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header showAnalyzeButton={true} />

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-slate-50 to-white border-b border-borderColor">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge badge-primary mb-5">About</span>
            <h1 className="text-4xl sm:text-5xl font-black text-textMain tracking-tight mb-5">
              About <span className="gradient-text">Browser Tracker</span>
            </h1>
            <p className="text-base text-textMuted leading-relaxed max-w-2xl mx-auto">
              Browser Tracker is an educational and research-focused platform designed to help users understand
              how websites may identify browsers through browser fingerprinting techniques. The platform analyzes
              browser characteristics and presents them in an easy-to-understand format for privacy awareness,
              security education, and browser research.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Project Purpose ───────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="badge badge-primary mb-4">Project Purpose</span>
            <h2 className="section-title mb-4">What Is Browser Tracker?</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              A free, open, and transparent tool that shows you exactly what your browser reveals — and how that information can be used to track you across the web.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Educational Purpose',
                desc: 'Built primarily for educational use — helping students, privacy advocates, and security professionals understand browser fingerprinting from first principles.',
              },
              {
                icon: FlaskConical,
                title: 'Research Tool',
                desc: 'Useful for researchers studying web tracking, advertising technology, and browser privacy. Export data in multiple formats for academic use.',
              },
              {
                icon: Target,
                title: 'Privacy Awareness',
                desc: 'Many users don\'t know what browsers expose. Browser Tracker makes this visible in a clear, understandable way — no technical knowledge required.',
              },
              {
                icon: Shield,
                title: 'Security Testing',
                desc: 'Developers and security professionals can use this tool to test their browser configurations and understand what fingerprinting signals are visible.',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="card p-6 flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-textMain text-base mb-1.5">{item.title}</h3>
                    <p className="text-sm text-textMuted leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section className="py-20 bg-cardBg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="badge badge-primary mb-4">Features</span>
            <h2 className="section-title mb-4">Platform Features</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Everything you need to understand your browser's fingerprint and privacy exposure.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} className="card p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-textMain text-sm mb-1">{f.label}</h3>
                    <p className="text-xs text-textMuted leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="badge badge-primary mb-4">How It Works</span>
            <h2 className="section-title mb-4">Under the Hood</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              A step-by-step breakdown of how Browser Tracker analyzes your browser.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="card p-6 flex gap-5 items-start"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)', color: '#fff' }}>
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-textMain text-base mb-1.5">{item.title}</h3>
                  <p className="text-sm text-textMuted leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Research Goals ────────────────────────────────────── */}
      <section className="py-20 bg-cardBg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="badge badge-primary mb-4">Research Goals</span>
            <h2 className="section-title mb-4">Our Research Goals</h2>
          </motion.div>

          <div className="card p-8 flex flex-col gap-4">
            {researchGoals.map((goal, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="flex items-start gap-3.5"
              >
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                </div>
                <p className="text-sm text-textMain font-medium leading-relaxed">{goal}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Technology Overview ───────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="badge badge-primary mb-4">Technology</span>
            <h2 className="section-title mb-4">Technology Overview</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Browser Tracker is built with a modern, production-grade technology stack.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="card p-4 flex flex-col gap-1"
              >
                <p className="font-bold text-textMain text-sm">{tech.label}</p>
                <p className="text-xs text-textMuted">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Creator Section ───────────────────────────────────── */}
      <section className="py-20 bg-cardBg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="badge badge-primary mb-4">Creator</span>
            <h2 className="section-title mb-4">Meet the Creator</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="card max-w-sm mx-auto p-8 text-center flex flex-col items-center gap-5"
          >
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-primary-glow"
              style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}
            >
              PS
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black text-textMain">Parampreet Singh</h3>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                <span className="badge badge-primary text-xs">
                  <Shield className="w-3 h-3" />
                  Cyber Security Enthusiast
                </span>
                <span className="badge badge-muted text-xs">
                  <GraduationCap className="w-3 h-3" />
                  MCA Student
                </span>
              </div>
            </div>

            <p className="text-sm text-textMuted leading-relaxed max-w-xs">
              Passionate about cybersecurity, privacy, and building tools that empower users to understand and protect their digital footprint.
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href="https://github.com/parampreet0077"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs px-4 py-2"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/parampreet-singh-365645376/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs px-4 py-2"
              >
                LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-black text-textMain mb-4">Ready to Check Your Browser?</h2>
            <p className="text-sm text-textMuted mb-8">Run a free analysis and see what your browser reveals.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)', boxShadow: '0 8px 30px rgb(14 165 233 / 0.3)' }}
            >
              <Sparkles className="w-4.5 h-4.5" />
              Start Free Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
