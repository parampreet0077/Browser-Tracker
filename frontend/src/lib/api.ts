const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  type: string;
  endpoint: string;
  status?: number;
  suggestedFix?: string;
  diagnostics?: string;

  constructor(message: string, type: string, endpoint: string) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.endpoint = endpoint;
  }
}

export class ApiClient {
  public static getBaseUrl() {
    return BASE_URL;
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private static async diagnoseNetworkError(err: Error, endpoint: string): Promise<ApiError> {
    const requestTarget = `${BASE_URL}${endpoint}`;
    
    // 1. Client offline check
    if (typeof window !== 'undefined' && !navigator.onLine) {
      const error = new ApiError('Client is offline. No local network connection detected.', 'Network Error', requestTarget);
      error.suggestedFix = 'Verify your local network interfaces, router settings, or ethernet cables.';
      error.diagnostics = `Navigator Online: false\nEndpoint Target: ${requestTarget}\nTrace: ${err.message}`;
      return error;
    }

    // 2. Health check connection check
    try {
      const healthRes = await fetch(`${BASE_URL}/health`, { method: 'GET' });
      if (healthRes.ok) {
        // Health endpoint is fine, but this specific call failed. High probability of CORS blockage or invalid route mapping.
        const error = new ApiError('Request failed. Access blocked by CORS security constraints.', 'CORS Blocked', requestTarget);
        error.suggestedFix = 'Ensure your current frontend host/port is whitelisted under the backend allowed origins in backend/src/index.ts.';
        error.diagnostics = `Health Check: 200 OK\nCORS suspicion: True\nEndpoint: ${requestTarget}\nTrace: ${err.message}`;
        return error;
      }
    } catch (_) {}

    // 3. Backend Offline check
    const error = new ApiError('Backend Express server is offline or unreachable.', 'Backend Server Offline', requestTarget);
    error.suggestedFix = 'Ensure the Express service is running at port 5000. Try executing "npm run dev" at the root directory.';
    error.diagnostics = `Target API Endpoint: ${BASE_URL}\nConnection status: Connection Refused / Timed Out\nTrace: ${err.message}`;
    return error;
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    const requestKey = `${method} ${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!res.ok) {
        let errPayload: any = {};
        try {
          errPayload = await res.json();
        } catch (_) {}

        const errMsg = errPayload.error || `HTTP request failed with status: ${res.status}`;
        const errorType = res.status === 404 ? 'API Route Missing' : 'Database / Internal Server Error';
        const error = new ApiError(errMsg, errorType, requestKey);
        error.status = res.status;

        // Custom suggested fixes for standard statuses
        if (res.status === 404) {
          error.suggestedFix = 'Verify the route path is declared in backend/src/index.ts and matches the client query.';
        } else if (res.status === 500 && (errMsg.toLowerCase().includes('prisma') || errMsg.toLowerCase().includes('database') || errMsg.toLowerCase().includes('sqlite'))) {
          error.type = 'Database Error';
          error.suggestedFix = 'Check SQLite file locks, verify database seedings exist, and rerun migrations if database tables are out of sync.';
        } else {
          error.suggestedFix = 'Inspect backend runtime logs to check for internal crashes or validation alerts.';
        }
        
        error.diagnostics = `HTTP Status: ${res.status} ${res.statusText}\nEndpoint: ${requestKey}\nServer Message: ${errMsg}`;
        throw error;
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const diagnosed = await this.diagnoseNetworkError(err, requestKey);
      throw diagnosed;
    }
  }

  public static async getHealth() {
    return this.request('/health');
  }

  public static async collect(payload: any) {
    return this.request('/collect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async getFingerprint(id: string) {
    return this.request(`/fingerprint/${id}`);
  }

  public static async getTimeline(id: string, filter = '') {
    return this.request(`/timeline/${id}?filter=${filter}`);
  }

  public static async getAnalytics() {
    return this.request('/analytics');
  }

  public static async compare(id1: string, id2: string) {
    return this.request('/compare', {
      method: 'POST',
      body: JSON.stringify({ id1, id2 }),
    });
  }

  public static async login(credentials: any) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  public static async getMe() {
    return this.request('/auth/me');
  }

  public static async getAdminVisitors() {
    return this.request('/admin/visitors');
  }

  public static async getAdminLogs() {
    return this.request('/admin/audit-logs');
  }

  public static getReportUrl(id: string, format = 'pdf') {
    return `${BASE_URL}/report/${id}?format=${format}`;
  }

  public static async verifyDatabase(visitId: string) {
    return this.request(`/verify-db/${visitId}`);
  }

  public static async getSchemaInspector() {
    return this.request('/admin/schema');
  }
}
