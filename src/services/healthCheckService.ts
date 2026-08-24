/**
 * Health Check & Keep-Alive Service
 * Sends periodic ping requests to /api/health every 5 minutes
 * to prevent the container / server from idling or sleeping.
 */

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export interface HealthStatus {
  isHealthy: boolean;
  lastPingTime: number | null;
  serverUptime?: number;
  error?: string;
}

class HealthCheckService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private status: HealthStatus = {
    isHealthy: true,
    lastPingTime: null,
  };
  private listeners: Set<(status: HealthStatus) => void> = new Set();
  private isStarted = false;

  public start() {
    if (this.isStarted) return;
    this.isStarted = true;

    // Initial ping on load
    this.ping();

    // Set recurring 5-minute interval
    this.timer = setInterval(() => {
      this.ping();
    }, PING_INTERVAL_MS);

    // Ping whenever tab becomes visible again
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.isStarted = false;
  }

  public async ping(): Promise<HealthStatus> {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.status = {
          isHealthy: true,
          lastPingTime: Date.now(),
          serverUptime: data.uptime,
        };
      } else {
        this.status = {
          isHealthy: false,
          lastPingTime: Date.now(),
          error: `HTTP ${response.status}`,
        };
      }
    } catch (err: unknown) {
      this.status = {
        isHealthy: false,
        lastPingTime: Date.now(),
        error: err instanceof Error ? err.message : 'Network error',
      };
    }

    this.notify();
    return this.status;
  }

  public getStatus(): HealthStatus {
    return this.status;
  }

  public subscribe(listener: (status: HealthStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const now = Date.now();
      // If it's been more than 2 minutes since last ping, ping immediately on return
      if (!this.status.lastPingTime || now - this.status.lastPingTime > 2 * 60 * 1000) {
        this.ping();
      }
    }
  };

  private notify() {
    this.listeners.forEach((fn) => fn(this.status));
  }
}

export const healthCheckService = new HealthCheckService();
