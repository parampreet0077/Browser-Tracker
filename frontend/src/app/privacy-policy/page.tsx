'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  Database,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Globe,
  Info,
  ShieldCheck,
  UserX,
  Clock,
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const sections = [
  {
    id: 'what-analyzed',
    icon: Eye,
    title: 'What Data Is Analyzed',
    color: 'bg-blue-50 text-primary border-blue-100',
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-textMuted leading-relaxed">
          When you click "Analyze Browser," the following browser signals are collected client-side (in your own browser) and sent to our backend for analysis:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            'User Agent string',
            'Browser name and version',
            'Operating system name and version',
            'Screen resolution and color depth',
            'Timezone and language settings',
            'Canvas fingerprint hash',
            'WebGL renderer and vendor string',
            'Audio context hash',
            'Installed font signatures',
            'Hardware concurrency (CPU cores)',
            'Device memory (approximate)',
            'Network connection type',
            'Platform and architecture',
            'IP address (from request headers)',
            'WebRTC local IP leak detection',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
              <span className="text-textMuted">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'not-collected',
    icon: UserX,
    title: 'What Data Is Not Collected',
    color: 'bg-green-50 text-success border-green-100',
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-textMuted leading-relaxed">
          Browser Tracker is an educational tool. We do NOT collect or store the following:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            'No name or personal identity',
            'No email address',
            'No social media profiles',
            'No passwords or credentials',
            'No payment information',
            'No browsing history',
            'No cookies set on other sites',
            'No keystrokes or mouse movements',
            'No microphone or camera data',
            'No location GPS coordinates',
            'No contact list or device files',
            'No persistent tracking cookies',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs">
              <div className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-danger font-bold text-[8px]">✕</span>
              </div>
              <span className="text-textMuted">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'fingerprint-generation',
    icon: Database,
    title: 'How Fingerprints Are Generated',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    content: (
      <div className="flex flex-col gap-3 text-sm text-textMuted leading-relaxed">
        <p>
          Browser Tracker generates fingerprints using a multi-hash approach:
        </p>
        <div className="flex flex-col gap-2.5">
          {[
            {
              title: 'Hash V1 (Browser-focused)',
              desc: 'Combines browser name, version, user agent, platform, language, and screen resolution into a SHA-256 hash.',
            },
            {
              title: 'Hash V2 (Hardware-canvas-focused)',
              desc: 'Integrates GPU/WebGL renderer, canvas pixel data, audio fingerprint, font signatures, and hardware channels.',
            },
            {
              title: 'Privacy Hash (Anonymizer Check)',
              desc: 'Flags differences between standard browser variables and potentially spoofed/modified values to detect privacy tools.',
            },
            {
              title: 'Stable Hash',
              desc: 'A cross-session identifier based on signals that remain consistent across browser restarts.',
            },
          ].map((item, i) => (
            <div key={i} className="card-flat p-4 rounded-xl">
              <p className="font-semibold text-textMain text-sm mb-1">{item.title}</p>
              <p className="text-xs text-textMuted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'educational-disclaimer',
    icon: AlertTriangle,
    title: 'Educational Use Disclaimer',
    color: 'bg-yellow-50 text-warning border-yellow-100',
    content: (
      <div className="flex flex-col gap-3 text-sm text-textMuted leading-relaxed">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
          <p className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Important Notice
          </p>
          <p className="text-yellow-800 text-sm leading-relaxed">
            The analysis performed by this platform is based on browser signals, statistical calculations, entropy analysis,
            and rule-based detection methods. The results generated are educational and informational in nature.
          </p>
        </div>
        <p>
          This platform <strong className="text-textMain">does not claim</strong>:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
          <li>Absolute certainty of any identification</li>
          <li>Guaranteed tracking or re-identification of any individual</li>
          <li>Definitive attribution of VPN usage, proxy routing, or automation</li>
          <li>Legal admissibility of any findings</li>
          <li>Accuracy for use in commercial anti-fraud systems</li>
        </ul>
        <p>
          All analysis should be treated as <strong className="text-textMain">advisory information only</strong>, suitable for education and research purposes.
        </p>
      </div>
    ),
  },
  {
    id: 'data-retention',
    icon: Clock,
    title: 'Data Retention',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    content: (
      <div className="flex flex-col gap-3 text-sm text-textMuted leading-relaxed">
        <p>
          Fingerprint analysis results are stored in a local SQLite database on our server with the following retention approach:
        </p>
        <div className="flex flex-col gap-2.5">
          <div className="card-flat p-4 rounded-xl">
            <p className="font-semibold text-textMain mb-1">Analysis Records</p>
            <p className="text-xs">Fingerprint hashes, entropy scores, and risk assessments are stored for the duration of the session and may persist for research analysis purposes.</p>
          </div>
          <div className="card-flat p-4 rounded-xl">
            <p className="font-semibold text-textMain mb-1">IP Addresses</p>
            <p className="text-xs">IP addresses are stored in anonymized form and are used only for geographic context (country, city) in the analysis.</p>
          </div>
          <div className="card-flat p-4 rounded-xl">
            <p className="font-semibold text-textMain mb-1">No Cross-Site Tracking</p>
            <p className="text-xs">Data collected is not shared with third parties, advertising networks, or analytics services. This is a standalone research tool.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'security',
    icon: Lock,
    title: 'Security',
    color: 'bg-slate-50 text-textMuted border-slate-100',
    content: (
      <div className="flex flex-col gap-3 text-sm text-textMuted leading-relaxed">
        <p>We implement appropriate technical measures to protect the data processed by this platform:</p>
        {[
          { title: 'Local Storage Only', desc: 'All data is stored locally in SQLite — no cloud databases, no third-party storage providers.' },
          { title: 'No Authentication Required', desc: 'No accounts, no login — you analyze anonymously. Your fingerprint ID is the only identifier.' },
          { title: 'HTTPS Recommended', desc: 'When deployed in production, HTTPS should be enforced to protect data in transit.' },
          { title: 'No Third-Party SDKs', desc: 'No analytics trackers, no advertising SDKs, no social media widgets embedded in this platform.' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-textMain text-sm mb-0.5">{item.title}</p>
              <p className="text-xs text-textMuted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'user-rights',
    icon: ShieldCheck,
    title: 'User Rights',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    content: (
      <div className="flex flex-col gap-3 text-sm text-textMuted leading-relaxed">
        <p>As a user of Browser Tracker, you have the following rights:</p>
        {[
          { right: 'Right to Access', desc: 'Your analysis results are accessible via the unique Fingerprint ID generated during your scan.' },
          { right: 'Right to Export', desc: 'Download your complete analysis report in PDF, CSV, or JSON format at any time.' },
          { right: 'Right to Anonymity', desc: 'No personal identity is required. You are identified only by a hash of your browser signals.' },
          { right: 'Right to Opt Out', desc: 'Simply close the browser tab. No persistent cookies are set. Clear your browser data to remove any local state.' },
        ].map((item, i) => (
          <div key={i} className="card-flat p-4 rounded-xl">
            <p className="font-semibold text-textMain text-sm mb-1">{item.right}</p>
            <p className="text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact Information',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    content: (
      <div className="flex flex-col gap-4 text-sm text-textMuted leading-relaxed">
        <p>
          For questions, concerns, or research collaboration related to Browser Tracker:
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="https://github.com/parampreet0077"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 card-flat p-4 rounded-xl hover:border-primary transition-colors"
          >
            <Globe className="w-4.5 h-4.5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-textMain text-sm">GitHub</p>
              <p className="text-xs text-primary">github.com/parampreet0077</p>
            </div>
          </a>
          <a
            href="https://www.linkedin.com/in/parampreet-singh-365645376/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 card-flat p-4 rounded-xl hover:border-primary transition-colors"
          >
            <FileText className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold text-textMain text-sm">LinkedIn</p>
              <p className="text-xs text-blue-600">Parampreet Singh</p>
            </div>
          </a>
        </div>
      </div>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header showAnalyzeButton={true} />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-slate-50 to-white border-b border-borderColor">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge badge-primary mb-5">
              <Shield className="w-3 h-3" />
              Legal
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-textMain tracking-tight mb-5">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-sm text-textMuted">
              Last updated: June 2026 &nbsp;·&nbsp; Browser Tracker by Parampreet Singh
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Notice Banner */}
      <section className="py-8 bg-yellow-50 border-b border-yellow-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-bold text-yellow-900 text-sm mb-1">Important Notice</p>
              <p className="text-sm text-yellow-800 leading-relaxed">
                The analysis performed by this platform is based on browser signals, statistical calculations, entropy analysis, and rule-based
                detection methods. The results generated by this platform are <strong>educational and informational in nature</strong>.
                This platform does not claim absolute certainty, guaranteed identification, or definitive attribution of any individual,
                browser, device, VPN, proxy, automation tool, or security risk. All analysis should be treated as advisory information only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-8 bg-cardBg border-b border-borderColor">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-3">Contents</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="badge badge-muted hover:badge-primary transition-colors text-xs"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                id={section.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
                variants={fadeUp}
                className="card p-6 flex flex-col gap-5 scroll-mt-24"
              >
                <div className="flex items-center gap-3 border-b border-borderColor pb-4">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${section.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-base font-bold text-textMain">{section.title}</h2>
                </div>
                {section.content}
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
