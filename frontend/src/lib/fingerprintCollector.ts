export class FingerprintCollector {
  
  /**
   * Helper hash function for string contents (MurmurHash3-style or fast FNV-1a)
   */
  private static hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return '00000000';
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Collect all browser telemetry signals
   */
  public static async collectAll(): Promise<any> {
    if (typeof window === 'undefined') return null;

    const nav = window.navigator;
    const screen = window.screen;
    const ua = nav.userAgent;

    // 1. Gather browser info
    let browserName = 'Other';
    let browserVersion = '0.0';
    let browserEngine = 'Other';

    if (ua.includes('Firefox')) {
      browserName = 'Firefox';
      browserEngine = 'Gecko';
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
      browserName = 'Chrome';
      browserEngine = 'Blink';
      const match = ua.match(/Chrome\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browserName = 'Safari';
      browserEngine = 'WebKit';
      const match = ua.match(/Version\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('Edg')) {
      browserName = 'Edge';
      browserEngine = 'Blink';
      const match = ua.match(/Edg\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    }

    // 2. Gather OS Info
    let osName = 'Other';
    let osVersion = 'Unknown';
    if (ua.includes('Windows')) {
      osName = 'Windows';
      if (ua.includes('Windows NT 10.0')) osVersion = '10/11';
      else if (ua.includes('Windows NT 6.3')) osVersion = '8.1';
      else if (ua.includes('Windows NT 6.2')) osVersion = '8';
      else if (ua.includes('Windows NT 6.1')) osVersion = '7';
    } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
      osName = 'macOS';
      const match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
      if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (ua.includes('Android')) {
      osName = 'Android';
      const match = ua.match(/Android (\d+\.\d+)/);
      if (match) osVersion = match[1];
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      osName = 'iOS';
      const match = ua.match(/OS (\d+[._]\d+)/);
      if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (ua.includes('Linux')) {
      osName = 'Linux';
    }

    // 3. Hardware details
    const cpuThreads = nav.hardwareConcurrency || 4;
    const deviceMemory = (nav as any).deviceMemory || 8;
    const touchSupport = nav.maxTouchPoints > 0;
    const deviceType = touchSupport && (ua.includes('Mobi') || ua.includes('Android') || ua.includes('iPhone')) ? 'mobile' : 'desktop';

    // 4. Graphics Canvas fingerprinting
    let canvasHash = 'canvas_blocked';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Antigravity Intel <canvas> 🌊', 2, 15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText('Antigravity Intel <canvas> 🌊', 4, 17);
        const dataUrl = canvas.toDataURL();
        canvasHash = this.hashString(dataUrl);
      }
    } catch (e) {
      canvasHash = 'canvas_blocked';
    }

    // 5. Graphics WebGL fingerprinting
    let webglVendor = 'WebGL Disabled';
    let webglRenderer = 'WebGL Disabled';
    let webglExtensions: string[] = [];
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown Vendor';
          webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown Renderer';
        }
        webglExtensions = gl.getSupportedExtensions() || [];
      }
    } catch (e) {
      // ignored
    }

    // 6. Audio context fingerprinting
    let audioHash = 'audio_blocked';
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const oscillator = audioCtx.createOscillator();
        const compressor = audioCtx.createDynamicsCompressor();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, audioCtx.currentTime);
        
        compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
        compressor.knee.setValueAtTime(40, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        compressor.reduction.setValueAtTime(-20, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
        
        oscillator.connect(compressor);
        compressor.connect(audioCtx.destination);
        
        // Use offline context for silent, instant calculation
        const OfflineContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
        const offlineCtx = new OfflineContext(1, 44100, 44100);
        const offOsc = offlineCtx.createOscillator();
        const offComp = offlineCtx.createDynamicsCompressor();
        
        offOsc.type = 'triangle';
        offOsc.frequency.setValueAtTime(10000, offlineCtx.currentTime);
        
        offComp.threshold.setValueAtTime(-50, offlineCtx.currentTime);
        offComp.knee.setValueAtTime(40, offlineCtx.currentTime);
        offComp.ratio.setValueAtTime(12, offlineCtx.currentTime);
        offComp.attack.setValueAtTime(0, offlineCtx.currentTime);
        offComp.release.setValueAtTime(0.25, offlineCtx.currentTime);
        
        offOsc.connect(offComp);
        offComp.connect(offlineCtx.destination);
        offOsc.start(0);
        
        const audioBuffer = await offlineCtx.startRendering();
        const floatData = audioBuffer.getChannelData(0);
        let audioSum = 0;
        for (let i = 4000; i < 4500; i++) {
          audioSum += Math.abs(floatData[i]);
        }
        audioHash = this.hashString(audioSum.toString());
      }
    } catch (e) {
      audioHash = 'audio_blocked';
    }

    // 7. Font Detection (renders text with fallback sans-serif vs tested font)
    const testedFonts = ['Arial', 'Calibri', 'Consolas', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'];
    const detectedFonts: string[] = [];
    try {
      const container = document.createElement('span');
      container.style.fontSize = '72px';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.innerHTML = 'mmmmmmmmmmlli';
      document.body.appendChild(container);

      // Default fallback size
      container.style.fontFamily = 'sans-serif';
      const baseWidth = container.offsetWidth;
      const baseHeight = container.offsetHeight;

      testedFonts.forEach(font => {
        container.style.fontFamily = `"${font}", sans-serif`;
        // If width or height differs from baseline, font is locally installed
        if (container.offsetWidth !== baseWidth || container.offsetHeight !== baseHeight) {
          detectedFonts.push(font);
        }
      });
      document.body.removeChild(container);
    } catch (e) {
      // ignored
    }
    const fontsHash = this.hashString(detectedFonts.join(','));

    // 8. Storage capacities
    let localStorageSupported = false;
    let sessionStorageSupported = false;
    let indexedDbSupported = false;
    try {
      localStorageSupported = typeof window.localStorage !== 'undefined';
      sessionStorageSupported = typeof window.sessionStorage !== 'undefined';
      indexedDbSupported = typeof window.indexedDB !== 'undefined';
    } catch (e) {}

    // 9. Plugins details
    const pluginsList: string[] = [];
    const mimeTypes: string[] = [];
    try {
      if (nav.plugins) {
        for (let i = 0; i < nav.plugins.length; i++) {
          pluginsList.push(nav.plugins[i].name);
        }
      }
      if (nav.mimeTypes) {
        for (let i = 0; i < nav.mimeTypes.length; i++) {
          mimeTypes.push(nav.mimeTypes[i].type);
        }
      }
    } catch (e) {}

    // 10. Query client permissions
    const permissions = { camera: 'unknown', microphone: 'unknown', notifications: 'unknown', clipboard: 'unknown' };
    try {
      if (nav.permissions) {
        const queryPerm = async (name: PermissionName) => {
          try {
            const status = await nav.permissions.query({ name });
            return status.state;
          } catch (e) {
            return 'denied';
          }
        };
        permissions.notifications = await queryPerm('notifications');
        permissions.clipboard = await queryPerm('clipboard-read' as any);
      }
    } catch (e) {}

    // 11. Network conditions
    const conn = (nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection;
    const network = {
      type: conn?.type || 'unknown',
      speed: conn?.downlink || 0
    };

    // 12. Security configurations
    const security = {
      cookiesEnabled: nav.cookieEnabled || false,
      doNotTrack: nav.doNotTrack || (window as any).doNotTrack || (nav as any).msDoNotTrack || 'unspecified',
      secureContext: window.isSecureContext || false
    };

    // 13. WebRTC capabilities & IP leak gathering
    const webrtcIPs: string[] = [];
    try {
      const RTCPeerConnectionClass = window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection;
      if (RTCPeerConnectionClass) {
        const pc = new RTCPeerConnectionClass({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        pc.createDataChannel('');
        pc.onicecandidate = (e) => {
          if (e.candidate && e.candidate.candidate) {
            const match = e.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9:]+)/i);
            if (match && !webrtcIPs.includes(match[1])) {
              webrtcIPs.push(match[1]);
            }
          }
        };
        await pc.createOffer().then(sdp => pc.setLocalDescription(sdp));
        // Allow STUN a small timeframe to gather candidates
        await new Promise(resolve => setTimeout(resolve, 600));
        pc.close();
      }
    } catch (e) {}

    // WebRTC capabilities checking
    const webrtcCapabilities = ['RTCPeerConnection', 'RTCDataChannel'];

    // 14. Gather everything together into the normalized payload structure
    return {
      browser: {
        name: browserName,
        version: browserVersion,
        engine: browserEngine,
        userAgent: ua,
      },
      os: {
        name: osName,
        version: osVersion,
        architecture: (nav as any).platform || 'Unknown',
      },
      hardware: {
        cpuThreads,
        deviceMemory,
        touchSupport,
        deviceType,
      },
      display: {
        screenWidth: screen.width || 0,
        screenHeight: screen.height || 0,
        colorDepth: screen.colorDepth || 0,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: screen.orientation?.type || 'landscape-primary',
      },
      localization: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        language: nav.language || 'en',
        languages: nav.languages ? [...nav.languages] : [],
        locale: nav.language || 'en',
      },
      storage: {
        localStorage: localStorageSupported,
        sessionStorage: sessionStorageSupported,
        indexedDb: indexedDbSupported,
      },
      graphics: {
        canvasHash,
        webglVendor,
        webglRenderer,
        webglExtensions,
      },
      audio: {
        audioHash,
      },
      fonts: {
        fontsList: detectedFonts,
        fontsHash,
      },
      plugins: {
        pluginsList,
        mimeTypes,
      },
      permissions,
      network,
      security,
      webrtc: {
        capabilities: webrtcCapabilities,
        ips: webrtcIPs
      },
      webdriver: nav.webdriver || false
    };
  }
}
