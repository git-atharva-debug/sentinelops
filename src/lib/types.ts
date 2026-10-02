// ===========================================
// SentinelOps - Shared TypeScript Types
// ===========================================

export interface Incident {
  id: string;
  title: string;
  message: string;
  module: 'procedure' | 'embed' | 'api' | 'system';
  route: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  errorBoundary: string | null;
  sentryEventId: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  events?: IncidentEvent[];
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  eventType: 'CREATED' | 'STATUS_CHANGE' | 'SENTRY_LINKED' | 'NOTE' | 'RESOLVED';
  message: string;
  metadata: string | null;
  createdAt: string;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  metadata: string | null;
  createdAt: string;
}

export interface HealthService {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  latency?: number;
}

export interface HealthResponse {
  status: 'healthy' | 'warning' | 'error';
  services: HealthService[];
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface MetricsResponse {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  procedureErrors: number;
  embedErrors: number;
  criticalCount: number;
  errorRate: string;
  lastErrorTime: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export interface Procedure {
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'idle' | 'error';
  lastExecution: string;
  executionCount: number;
  successRate: number;
  category: string;
}
