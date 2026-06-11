import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Browser Tracker – Privacy & Browser Tracking Audit Tool",
  description:
    "Discover how websites identify and track your browser. Analyze your browser fingerprint, uniqueness, entropy, tracking risk, and privacy exposure.",
  keywords: [
    "browser fingerprinting",
    "privacy audit",
    "browser tracking",
    "fingerprint uniqueness",
    "entropy analysis",
    "bot detection",
    "VPN detection",
    "privacy awareness",
    "cyber security",
    "browser privacy tool",
  ],
  authors: [{ name: "Parampreet Singh" }],
  openGraph: {
    title: "Browser Tracker – Privacy & Browser Tracking Audit Tool",
    description:
      "Discover how websites identify and track your browser. Analyze your browser fingerprint, uniqueness, entropy, tracking risk, and privacy exposure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-white text-textMain">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
