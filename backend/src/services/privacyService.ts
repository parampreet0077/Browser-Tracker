export interface PrivacyInput {
  totalEntropy: number;
  uniquenessScore: number;
  isVpn: boolean;
  isTor: boolean;
  webrtcLeak: boolean;
  botScore: number;
  cookiesEnabled: boolean;
  doNotTrack: string;
}

export class PrivacyService {
  public static analyze(input: PrivacyInput) {
    const recommendations: string[] = [];
    
    // 1. Calculate Trackability (How easily can cookies + fingerprint identify this visitor)
    // High uniqueness + cookies enabled = highly trackable
    let trackability = (input.uniquenessScore / 100) * 0.70;
    if (input.cookiesEnabled) {
      trackability += 0.30;
    } else {
      recommendations.push('Disable or restrict third-party cookies to reduce tracking vectors.');
    }
    trackability = Number(Math.min(1.0, Math.max(0.0, trackability)).toFixed(2));

    // 2. Calculate Exposure Risk (What privacy-sensitive details are leaked)
    let exposureRisk = 0.10;
    if (input.webrtcLeak) {
      exposureRisk += 0.40;
      recommendations.push('WebRTC leaks private IP addresses. Disable WebRTC or use a VPN that routes WebRTC traffic.');
    }
    if (!input.isVpn) {
      exposureRisk += 0.30;
      recommendations.push('Your real ISP IP address is exposed. Consider using a trustworthy VPN or proxy.');
    }
    if (input.doNotTrack !== '1') {
      exposureRisk += 0.10;
      recommendations.push('Enable the Do Not Track (DNT) header in your browser settings.');
    }
    exposureRisk = Number(Math.min(1.0, Math.max(0.0, exposureRisk)).toFixed(2));

    // 3. Uniqueness Risk
    const uniquenessRisk = Number((input.uniquenessScore / 100).toFixed(2));
    if (uniquenessRisk > 0.85) {
      recommendations.push('Your browser fingerprint is highly unique. Use a privacy-focused browser (like Brave or Firefox with privacy protections) to spoof or randomize fingerprinting attributes.');
    }

    // 4. Fingerprint Stability Estimate
    // Standard stability baseline
    const stabilityScore = input.isTor ? 0.30 : 0.95;
    if (input.isTor) {
      recommendations.push('Tor Browser is randomizing some variables, preventing long-term stability tracking.');
    }

    // Determine overall risk level
    let riskLevel = 'Low';
    const averageRisk = (trackability + exposureRisk + uniquenessRisk) / 3;
    
    if (averageRisk >= 0.75 || input.botScore > 0.60) {
      riskLevel = 'Critical';
    } else if (averageRisk >= 0.55) {
      riskLevel = 'High';
    } else if (averageRisk >= 0.35) {
      riskLevel = 'Medium';
    }

    if (recommendations.length === 0) {
      recommendations.push('Your browser privacy configuration is highly optimized. Maintain current settings.');
    }

    return {
      trackability,
      exposureRisk,
      stabilityScore,
      uniquenessRisk,
      riskLevel,
      recommendations
    };
  }
}
