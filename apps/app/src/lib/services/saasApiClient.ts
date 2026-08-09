import { auth } from "$lib/firebase";
import { PUBLIC_SAAS_API_URL } from "$env/static/public";

const API_BASE_URL = PUBLIC_SAAS_API_URL || "http://localhost:8787";

export interface SaasApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

/**
 * Gets Firebase Auth ID Token for current user
 */
async function getAuthToken(forceRefresh = true): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    return await currentUser.getIdToken(forceRefresh);
  } catch (err) {
    console.error("Failed to get Firebase ID token:", err);
    return null;
  }
}

/**
 * Unified SaaS Backend API Fetcher
 */
async function saasFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${text.slice(0, 150)}`);
    }
    throw new Error(`Invalid response format: ${text.slice(0, 150)}`);
  }

  if (!response.ok) {
    const errorMsg = json.message || json.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return json as T;
}

export const saasApiClient = {
  // ─── Workspace Cloud Sync ─────────────────────────────────────
  async syncWorkspace(payload: {
    workspaceId: string;
    workspaceName: string;
    files: Array<{
      relativePath: string;
      contentHash: string;
      sizeBytes: number;
      content?: string;
    }>;
  }) {
    return saasFetch("/api/v1/workspaces/sync", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSyncedWorkspaces() {
    return saasFetch("/api/v1/workspaces", { method: "GET" });
  },

  // ─── AI Copilot Service ───────────────────────────────────────
  async sendCopilotMessage(message: string, sessionId?: string) {
    return saasFetch<{
      sessionId: string;
      reply: string;
      generatedBerry?: string;
    }>("/api/v1/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ message, sessionId }),
    });
  },

  // ─── Cloud Berry Executor ─────────────────────────────────────
  async executeCloudBerry(source: string, scriptId?: string) {
    return saasFetch<{
      success: boolean;
      runId: string;
      status: string;
      streamUrl: string;
    }>("/api/v1/berry/execute", {
      method: "POST",
      body: JSON.stringify({ source, scriptId }),
    });
  },

  async getExecutionRuns() {
    return saasFetch<{ runs: any[] }>("/api/v1/berry/runs", { method: "GET" });
  },

  async getRunDetails(runId: string) {
    return saasFetch<{ run: any; stepLogs: any[] }>(`/api/v1/berry/runs/${runId}`, {
      method: "GET",
    });
  },

  // ─── Berry Scheduler Service ──────────────────────────────────
  async getSchedules() {
    return saasFetch<{ schedules: any[] }>("/api/v1/schedules", { method: "GET" });
  },

  async createSchedule(scriptId: string, cronExpression: string) {
    return saasFetch("/api/v1/schedules", {
      method: "POST",
      body: JSON.stringify({ scriptId, cronExpression }),
    });
  },

  async deleteSchedule(scheduleId: string) {
    return saasFetch(`/api/v1/schedules/${scheduleId}`, { method: "DELETE" });
  },

  // ─── Monitoring & Telemetry Metrics ───────────────────────────
  async getMonitoringMetrics() {
    return saasFetch<{
      planTier: string;
      quotas: {
        monthlyRunsUsed: number;
        monthlyRunsLimit: number;
        monthlyCopilotUsed: number;
        monthlyCopilotLimit: number;
        syncedWorkspacesLimit: number;
      };
      metrics: {
        totalRuns: number;
        passedRuns: number;
        failedRuns: number;
        passRatePercent: number;
        avgDurationMs: number;
      };
    }>("/api/v1/monitoring/metrics", { method: "GET" });
  },

  /**
   * Helper to connect to real-time WebSocket log stream for a run
   */
  connectExecutionWebSocket(runId: string, onMessage: (evt: any) => void): WebSocket {
    const wsUrl = API_BASE_URL.replace(/^http/, "ws") + `/api/v1/realtime/runs/${runId}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch (err) {
        console.error("WS Parse error:", err);
      }
    };
    return ws;
  },
};
