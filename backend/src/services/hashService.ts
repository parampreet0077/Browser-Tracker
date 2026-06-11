import * as crypto from 'crypto';

export interface FingerprintPayload {
  browser: {
    name: string;
    version: string;
    engine: string;
    userAgent: string;
  };
  os: {
    name: string;
    version: string;
    architecture: string;
  };
  hardware: {
    cpuThreads: number;
    deviceMemory: number;
    touchSupport: boolean;
    deviceType: string;
  };
  display: {
    screenWidth: number;
    screenHeight: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: string;
  };
  localization: {
    timezone: string;
    language: string;
    languages: string[];
    locale: string;
  };
  storage: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDb: boolean;
  };
  graphics: {
    canvasHash: string;
    webglVendor: string;
    webglRenderer: string;
    webglExtensions: string[];
  };
  audio: {
    audioHash: string;
  };
  fonts: {
    fontsList: string[];
    fontsHash: string;
  };
  plugins: {
    pluginsList: string[];
    mimeTypes: string[];
  };
  permissions: {
    camera: string;
    microphone: string;
    notifications: string;
    clipboard: string;
  };
  network: {
    type: string;
    speed: number;
  };
  security: {
    cookiesEnabled: boolean;
    doNotTrack: string;
    secureContext: boolean;
  };
  webrtc: {
    capabilities: string[];
  };
}

export class HashService {
  public static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public static generateHashes(payload: FingerprintPayload) {
    // 1. Hash V1: Stable hardware and localization features (classic approach)
    const v1Data = [
      payload.browser.name,
      payload.os.name,
      payload.os.architecture,
      payload.hardware.cpuThreads,
      payload.hardware.deviceMemory,
      payload.localization.timezone,
      payload.localization.language
    ].join('|');
    const hashV1 = this.sha256(v1Data);

    // 2. Hash V2: All signals concatenated
    const hashV2 = this.sha256(JSON.stringify(payload));

    // 3. Stable Hash: Ignores dynamic and volatile items (like storage size, screen resolution details which can change on screen zoom or permissions that change)
    const stableData = [
      payload.browser.name,
      payload.os.name,
      payload.os.architecture,
      payload.hardware.cpuThreads,
      payload.hardware.deviceMemory,
      payload.localization.timezone,
      payload.localization.language,
      payload.graphics.canvasHash,
      payload.graphics.webglVendor,
      payload.graphics.webglRenderer,
      payload.audio.audioHash,
      payload.fonts.fontsHash
    ].join('|');
    const stableHash = this.sha256(stableData);

    // 4. Similarity Hash: Vector of hashes representing 8 core categories
    // This allows weighted similarity calculation (e.g. drift detection)
    const similarityVector = {
      browser: this.sha256([payload.browser.name, payload.browser.engine].join('|')),
      os: this.sha256([payload.os.name, payload.os.architecture].join('|')),
      hardware: this.sha256([payload.hardware.cpuThreads, payload.hardware.deviceMemory, payload.hardware.touchSupport].join('|')),
      display: this.sha256([payload.display.screenWidth, payload.display.screenHeight, payload.display.colorDepth].join('|')),
      localization: this.sha256([payload.localization.timezone, payload.localization.locale].join('|')),
      graphics: this.sha256([payload.graphics.canvasHash, payload.graphics.webglVendor, payload.graphics.webglRenderer].join('|')),
      audio: payload.audio.audioHash || 'no-audio',
      fonts: payload.fonts.fontsHash || 'no-fonts'
    };
    const similarityHash = JSON.stringify(similarityVector);

    // 5. Privacy Hash: Non-identifying features (general groups, no exact hardware/canvas, just broad categories)
    const privacyData = [
      payload.browser.name,
      payload.browser.version.split('.')[0], // major version only
      payload.os.name,
      payload.hardware.deviceType,
      payload.localization.timezone,
      payload.localization.language
    ].join('|');
    const privacyHash = this.sha256(privacyData);

    return {
      hashV1,
      hashV2,
      stableHash,
      similarityHash,
      privacyHash
    };
  }

  /**
   * Compares two similarity vectors and returns a similarity percentage (0-100)
   */
  public static calculateSimilarity(simHash1: string, simHash2: string): number {
    try {
      const v1 = JSON.parse(simHash1) as Record<string, string>;
      const v2 = JSON.parse(simHash2) as Record<string, string>;
      
      const keys = Object.keys(v1);
      if (keys.length === 0) return 0;
      
      let matches = 0;
      keys.forEach(key => {
        if (v1[key] === v2[key]) {
          matches++;
        }
      });
      
      return Math.round((matches / keys.length) * 100);
    } catch {
      return 0;
    }
  }
}
