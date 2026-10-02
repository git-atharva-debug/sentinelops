'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Code,
  Server,
  Database,
  Radio,
  Activity,
} from 'lucide-react';
import { HealthDot } from '@/components/ui/badges';
import { showToast } from '@/components/ui/toast';
import type { HealthResponse } from '@/lib/types';

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.success) setHealth(data.data);
    } catch {
      showToast('Failed to fetch health status', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const serviceIcons: Record<string, React.ReactNode> = {
    procedure: <Settings size={16} />,
    embed: <Code size={16} />,
    api: <Server size={16} />,
    database: <Database size={16} />,
    sentry: <Radio size={16} />,
  };

  const serviceLabels: Record<string, string> = {
    procedure: 'Procedure Service',
    embed: 'Embed Service',
    api: 'API Service',
    database: 'Database',
    sentry: 'Sentry Integration',
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: '48px' }}>
        <div>
          <h1 className="page-title">System Health</h1>
          <p className="page-subtitle">Service status and availability.</p>
        </div>
        <button onClick={fetchHealth} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !health ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '48px' }} />
          ))}
        </div>
      ) : health ? (
        <>
          {/* Overall Status */}
          <section style={{ marginBottom: '48px' }}>
            <div className="flex items-center gap-3">
              {health.status === 'healthy' ? (
                <CheckCircle size={20} style={{ color: 'var(--green)' }} />
              ) : health.status === 'warning' ? (
                <AlertTriangle size={20} style={{ color: 'var(--yellow)' }} />
              ) : (
                <XCircle size={20} style={{ color: 'var(--red)' }} />
              )}
              <div>
                <span className="text-base font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                  {health.status === 'healthy' ? 'All Systems Operational' : `System ${health.status}`}
                </span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {health.services.filter((s) => s.status === 'healthy').length}/{health.services.length} services healthy · Updated {new Date(health.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 className="section-title" style={{ marginBottom: '16px' }}>Services</h2>
            <div className="card" style={{ padding: 0 }}>
              {health.services.map((service, i) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between"
                  style={{
                    padding: '14px 24px',
                    borderBottom: i < health.services.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: 'var(--text-muted)' }}>
                      {serviceIcons[service.name] || <Activity size={16} />}
                    </span>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {serviceLabels[service.name] || service.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {service.message}
                        {service.latency !== undefined && ` · ${service.latency}ms`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HealthDot status={service.status} />
                    <span
                      className="text-xs capitalize"
                      style={{
                        color: service.status === 'healthy' ? 'var(--green)' : service.status === 'warning' ? 'var(--yellow)' : 'var(--red)',
                      }}
                    >
                      {service.status === 'healthy' ? 'Operational' : service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
