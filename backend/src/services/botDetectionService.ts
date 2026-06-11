export interface BotPayload {
  webdriver: boolean;
  pluginsLength: number;
  fontsLength: number;
  webglVendor: string;
  webglRenderer: string;
  canvasHash: string;
  audioHash: string;
  languages: string[];
  userAgent: string;
  screenResolution: {
    width: number;
    height: number;
  };
  permissionsState: {
    notifications: string;
  };
}

export class BotDetectionService {
  public static analyze(payload: BotPayload) {
    const explanations: string[] = [];
    let botScore = 0.0;
    let confidenceScore = 0.90; // Starting baseline confidence

    const ua = payload.userAgent.toLowerCase();
    
    // 1. webdriver flag (highest severity)
    if (payload.webdriver === true) {
      botScore += 0.60;
      explanations.push('Automation flag navigator.webdriver is active');
    }

    // 2. Headless User Agent signature
    if (ua.includes('headlesschrome') || ua.includes('headless')) {
      botScore += 0.80;
      explanations.push('User-Agent header contains headless signature');
    }

    // 3. Plugins count (headless browsers usually have 0 plugins)
    // Only check for desktop browsers since mobile devices often have 0 plugins
    const isMobile = ua.includes('mobi') || ua.includes('android') || ua.includes('iphone');
    if (!isMobile && payload.pluginsLength === 0) {
      botScore += 0.25;
      explanations.push('Zero plugins installed on desktop browser');
    }

    // 4. Missing / Limited Fonts (typically bots don't load rich local fonts)
    if (payload.fontsLength <= 2) {
      botScore += 0.20;
      explanations.push('Extremely restricted font library detected');
    }

    // 5. WebGL Renderer anomalies (Mesa, SwiftShader, SoftRasterizer are indicators of automation environments)
    const glVendor = payload.webglVendor.toLowerCase();
    const glRenderer = payload.webglRenderer.toLowerCase();
    if (
      glRenderer.includes('swiftshader') || 
      glRenderer.includes('mesa') || 
      glRenderer.includes('software rasterizer') || 
      glRenderer.includes('llvmpipe') ||
      glVendor.includes('google inc. (google)') && glRenderer === ''
    ) {
      botScore += 0.40;
      explanations.push(`Suspicious WebGL Renderer environment: ${payload.webglRenderer}`);
    }

    // 6. Timing / Notification Permission Anomalies (Headless Chrome permissions state inconsistencies)
    // For example: notifications permission is denied/granted, but prompt behavior is weird, or screen height is 0
    if (payload.screenResolution.width === 0 || payload.screenResolution.height === 0) {
      botScore += 0.35;
      explanations.push('Invalid screen dimension signature (0x0)');
    }

    // Cap the bot score at 1.0 and minimum at 0.0
    botScore = Math.min(1.0, Math.max(0.0, botScore));
    
    const humanScore = Number((1.0 - botScore).toFixed(2));
    const riskScore = Number(botScore.toFixed(2));
    
    // Classification Logic
    let classification = 'Human';
    if (riskScore >= 0.70) {
      classification = 'Likely Bot';
    } else if (riskScore >= 0.40) {
      classification = 'Suspicious';
    } else if (riskScore >= 0.15) {
      classification = 'Likely Human';
    }

    if (explanations.length === 0) {
      explanations.push('Standard human browser characteristics verified');
    }

    return {
      webdriver: payload.webdriver,
      headless: ua.includes('headless'),
      automationTool: payload.webdriver ? 'WebDriver' : ua.includes('headless') ? 'HeadlessBrowser' : 'None',
      timingAnomaly: false,
      humanScore,
      botScore: riskScore,
      confidenceScore,
      riskScore,
      classification,
      explanations
    };
  }
}
