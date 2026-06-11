# 🔍 Browser Tracker

> **Privacy & Browser Tracking Audit Tool**

Browser Tracker is an educational and research-focused platform that helps users understand how websites identify and track browsers using browser fingerprinting techniques. It analyzes your browser fingerprint, uniqueness, entropy, tracking risk, and privacy exposure.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)

---

## ✨ Features

- **Browser Fingerprint Analysis** — Collect and analyze 50+ browser signals
- **Entropy & Uniqueness Scoring** — Shannon entropy calculation and uniqueness percentile
- **Privacy Exposure Assessment** — Risk level based on fingerprint stability
- **Bot & Automation Detection** — Detect headless browsers, webdrivers, and automation frameworks
- **VPN & Proxy Detection** — Identify VPN exits, proxies, Tor nodes, and datacenter subnets
- **Security Hardening Recommendations** — Actionable privacy improvement steps
- **Multi-Hash Fingerprinting** — Hash V1, V2, Privacy Hash, and Stable Hash
- **Professional Audit Reports** — Export as PDF, CSV, or JSON
- **Visit Drift Timeline** — Track fingerprint changes across sessions
- **Browser Comparison Engine** — Jaccard similarity between two fingerprints

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v3, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | SQLite via Prisma ORM |
| Charts | Recharts |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/parampreet0077/Browser-Tracker.git
cd Browser-Tracker
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env  # Edit with your values

# Run database migrations
npx prisma migrate dev

# Start backend (port 5000)
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start frontend (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker (Optional)

```bash
# From the project root
docker-compose up
```

---

## 📁 Project Structure

```
Browser-Tracker/
├── frontend/                  # Next.js 15 frontend
│   └── src/
│       ├── app/               # App Router pages
│       │   ├── page.tsx       # Landing page (hero + sections)
│       │   ├── results/[id]/  # Analysis results dashboard
│       │   ├── about/         # About page
│       │   ├── privacy-policy/ # Privacy policy
│       │   ├── admin/         # Admin dashboard (protected)
│       │   └── login/         # Admin login
│       ├── components/
│       │   ├── Scanner.tsx    # Core scan engine UI
│       │   ├── Header.tsx     # Sticky navigation
│       │   ├── Footer.tsx     # Professional footer
│       │   └── ErrorBoundary.tsx
│       └── lib/
│           ├── fingerprintCollector.ts  # Client-side signal collection
│           └── api.ts                   # API client
│
├── backend/                   # Express.js API
│   ├── src/
│   │   └── services/          # Scan, entropy, VPN, bot detection
│   └── prisma/
│       └── schema.prisma      # Database schema
│
└── docker-compose.yml
```

---

## 🔒 Privacy Notice

Browser Tracker is built for **educational and research purposes only**.

- No personal identity is collected (no name, email, or account required)
- Analysis results are stored locally in SQLite
- No third-party analytics, advertising SDKs, or tracking
- Data is not shared with any external services

See the full [Privacy Policy](http://localhost:3000/privacy-policy) for details.

---

## 📖 How It Works

1. **Signal Collection** — JavaScript APIs collect browser attributes client-side
2. **Fingerprint Generation** — Signals are hashed using multiple algorithms
3. **Entropy Analysis** — Shannon entropy measures uniqueness of each signal
4. **Privacy Assessment** — Risk scores and threat indicators are computed
5. **Report Generation** — Full audit report with export options

---

## 👤 Creator

**Parampreet Singh**
- 🎓 MCA Student
- 🔐 Cyber Security Enthusiast
- 🐙 [GitHub](https://github.com/parampreet0077)
- 💼 [LinkedIn](https://www.linkedin.com/in/parampreet-singh-365645376/)
- 📸 [Instagram](https://www.instagram.com/parampreet584/)

---

## ⚠️ Disclaimer

The analysis performed by this platform is based on browser signals, statistical calculations, entropy analysis, and rule-based detection methods. Results are educational and informational in nature. This platform does not claim absolute certainty, guaranteed identification, or definitive attribution of any individual, browser, device, VPN, proxy, or automation tool. All analysis should be treated as advisory information only.

---

## 📄 License

This project is for educational purposes. All rights reserved © 2026 Parampreet Singh.
