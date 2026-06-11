import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

export interface ReportData {
  id: string;
  hashV1: string;
  hashV2: string;
  stableHash: string;
  privacyHash: string;
  createdAt: Date;
  visit: {
    ipAddress: string;
    country: string;
    region: string;
    city: string;
    timezone: string;
    userAgent: string;
    signals: {
      browserName: string;
      browserVersion: string;
      osName: string;
      osVersion: string;
      deviceType: string;
      canvasHash: string;
      webglVendor: string;
      webglRenderer: string;
      audioHash: string;
      fontsHash: string;
    };
    botAnalysis: {
      humanScore: number;
      botScore: number;
      confidenceScore: number;
      riskScore: number;
      classification: string;
      explanations: string[];
      webdriver: boolean;
    };
    vpnAnalysis: {
      isVpn: boolean;
      isProxy: boolean;
      isTor: boolean;
      isDatacenter: boolean;
      webrtcLeak: boolean;
      timezoneMismatch: boolean;
      isp: string;
      explanation: string;
    };
    privacyReport: {
      trackability: number;
      exposureRisk: number;
      stabilityScore: number;
      uniquenessRisk: number;
      riskLevel: string;
      recommendations: string[];
    };
  };
}

export class ReportService {
  /**
   * Generates a PDF report and returns it as a Buffer
   */
  public static generatePdf(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Theme Colors
      const primaryColor = '#00E5FF';
      const secondaryColor = '#7C4DFF';
      const bgColor = '#0A0F1F';
      const cardColor = '#131C31';
      const textColor = '#EEEEEE';
      const subTextColor = '#9E9E9E';
      const dangerColor = '#FF5252';
      const successColor = '#00C853';

      // ----------------------------------------------------
      // Background & Header
      // ----------------------------------------------------
      // Draw background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#060913');

      // Title & Branding
      doc.fillColor(primaryColor).fontSize(22).font('Helvetica-Bold')
         .text('ANTIGRAVITY FINGERPRINT INTELLIGENCE', 50, 50);
         
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text(`Platform Report ID: ${data.id}`, 50, 75);
      doc.text(`Generated On: ${new Date().toUTCString()}`, 50, 90);
      
      doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).strokeColor(primaryColor).lineWidth(1.5).stroke();

      // ----------------------------------------------------
      // Executive Summary Panel
      // ----------------------------------------------------
      let y = 130;
      doc.rect(50, y, doc.page.width - 100, 90).fill(cardColor);
      
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
         .text('EXECUTIVE SECURITY SUMMARY', 65, y + 15);

      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text(`Overall Threat Level:`, 65, y + 35)
         .fillColor(data.visit.botAnalysis.riskScore > 0.4 ? dangerColor : successColor).font('Helvetica-Bold')
         .text(data.visit.botAnalysis.classification.toUpperCase(), 180, y + 35)
         
      doc.fillColor(textColor).font('Helvetica')
         .text(`Privacy Risk Level:`, 65, y + 50)
         .fillColor(data.visit.privacyReport.riskLevel === 'Critical' || data.visit.privacyReport.riskLevel === 'High' ? dangerColor : successColor).font('Helvetica-Bold')
         .text(data.visit.privacyReport.riskLevel.toUpperCase(), 180, y + 50)

      doc.fillColor(textColor).font('Helvetica')
         .text(`Connection Profile:`, 65, y + 65)
         .text(`${data.visit.vpnAnalysis.isVpn ? 'Secured / VPN Proxy' : 'Direct / Non-VPN Link'} (${data.visit.vpnAnalysis.isp})`, 180, y + 65);

      // ----------------------------------------------------
      // Hashing Details
      // ----------------------------------------------------
      y += 110;
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
         .text('FINGERPRINT IDENTITY HASHS', 50, y);
         
      y += 20;
      const drawHashRow = (label: string, value: string, rowY: number) => {
        doc.fillColor(subTextColor).fontSize(9).font('Helvetica-Bold').text(label, 50, rowY);
        doc.fillColor(textColor).fontSize(9).font('Courier').text(value, 160, rowY);
      };
      
      drawHashRow('Fingerprint Hash V1:', data.hashV1, y);
      drawHashRow('Fingerprint Hash V2:', data.hashV2, y + 15);
      drawHashRow('Stable Identifier:', data.stableHash, y + 30);
      drawHashRow('Privacy Shield Hash:', data.privacyHash, y + 45);

      // ----------------------------------------------------
      // Browser & OS Parameters
      // ----------------------------------------------------
      y += 75;
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
         .text('COLLECTED DEVICE ENVIRONMENT', 50, y);

      y += 20;
      const sigs = data.visit.signals;
      const browserGrid = [
        ['Browser Engine', sigs.browserName, 'OS Architecture', sigs.osName],
        ['Browser Version', sigs.browserVersion, 'Device Form-factor', sigs.deviceType],
        ['WebGL Renderer', sigs.webglRenderer.substring(0, 25), 'IP Address', data.visit.ipAddress],
        ['Locale Language', sigs.fontsHash ? 'Installed Local Fonts' : 'Default fonts', 'Visitor Location', `${data.visit.city}, ${data.visit.country}`]
      ];

      browserGrid.forEach((row, rowIndex) => {
        const rowY = y + (rowIndex * 20);
        // Column 1
        doc.fillColor(subTextColor).fontSize(9).font('Helvetica-Bold').text(row[0], 50, rowY);
        doc.fillColor(textColor).font('Helvetica').text(row[1], 150, rowY);
        // Column 2
        doc.fillColor(subTextColor).font('Helvetica-Bold').text(row[2], doc.page.width / 2 + 10, rowY);
        doc.fillColor(textColor).font('Helvetica').text(row[3], doc.page.width / 2 + 120, rowY);
      });

      // ----------------------------------------------------
      // Bot Detection Assessment
      // ----------------------------------------------------
      y += 110;
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
         .text('BOT & AUTOMATION THREAT PROFILE', 50, y);

      y += 20;
      doc.rect(50, y, doc.page.width - 100, 60).fill(cardColor);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text('Confidence Score:', 65, y + 12)
         .text(`${Math.round(data.visit.botAnalysis.confidenceScore * 100)}%`, 180, y + 12);
      doc.text('Automation Webdriver:', 65, y + 27)
         .text(data.visit.botAnalysis.webdriver ? 'Active Webdriver flag' : 'Disabled / Webdriver clean', 180, y + 27);
      doc.text('Threat Explanations:', 65, y + 42)
         .fillColor(subTextColor)
         .text(data.visit.botAnalysis.explanations.join(', '), 180, y + 42);

      // Add a page break for the rest of the report
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#060913');
      
      // Page 2 Header
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
         .text('ANTIGRAVITY PRIVACY AUDIT & HARDENING', 50, 40);
      doc.moveTo(50, 60).lineTo(doc.page.width - 50, 60).strokeColor(primaryColor).lineWidth(1.0).stroke();

      // ----------------------------------------------------
      // VPN & Threat Analysis
      // ----------------------------------------------------
      y = 80;
      doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold')
         .text('VPN, Proxy, and Anonymizer Status', 50, y);

      y += 20;
      const vpn = data.visit.vpnAnalysis;
      const vpnDetails = [
        ['VPN Connected', vpn.isVpn ? 'YES' : 'NO', 'Datacenter Subnet', vpn.isDatacenter ? 'YES' : 'NO'],
        ['Anonymizer Proxy', vpn.isProxy ? 'YES' : 'NO', 'Tor Network Node', vpn.isTor ? 'YES' : 'NO'],
        ['WebRTC Leakage', vpn.webrtcLeak ? 'YES / Vulnerable' : 'NO / Protected', 'Timezone Skew', vpn.timezoneMismatch ? 'YES / Alert' : 'NO']
      ];

      vpnDetails.forEach((row, rowIndex) => {
        const rowY = y + (rowIndex * 18);
        doc.fillColor(subTextColor).fontSize(9).font('Helvetica-Bold').text(row[0], 50, rowY);
        doc.fillColor(row[1] === 'YES' || row[1] === 'YES / Vulnerable' ? dangerColor : textColor).font('Helvetica').text(row[1], 150, rowY);
        
        doc.fillColor(subTextColor).font('Helvetica-Bold').text(row[2], doc.page.width / 2 + 10, rowY);
        doc.fillColor(row[3] === 'YES' || row[3] === 'YES / Alert' ? dangerColor : textColor).font('Helvetica').text(row[3], doc.page.width / 2 + 120, rowY);
      });

      // ----------------------------------------------------
      // Privacy Recommendations
      // ----------------------------------------------------
      y += 85;
      doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold')
         .text('PRIVACY RECOVERY RECOMMENDATIONS', 50, y);

      y += 20;
      const recs = data.visit.privacyReport.recommendations;
      recs.forEach((rec, recIndex) => {
        const rowY = y + (recIndex * 22);
        // Bullet point
        doc.fillColor(secondaryColor).fontSize(12).text('•', 50, rowY - 2);
        doc.fillColor(textColor).fontSize(9).font('Helvetica').text(rec, 65, rowY, { width: doc.page.width - 115 });
      });

      // ----------------------------------------------------
      // Footer
      // ----------------------------------------------------
      doc.fillColor(subTextColor).fontSize(8).font('Helvetica')
         .text('Confidential - Generated for Browser Verification Auditing. Antigravity Platform © 2026.', 50, doc.page.height - 50, { align: 'center' });

      doc.end();
    });
  }
}
