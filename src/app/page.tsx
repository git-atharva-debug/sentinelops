'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle,
  Settings,
  Code,
  Server,
  Database,
  Radio,
  RefreshCw,
  ArrowRight,
  Play,
  XCircle,
} from 'lucide-react';
import { StatusBadge, SeverityBadge, HealthDot, SkeletonCard } from '@/components/ui/badges';
import { showToast } from '@/components/ui/toast';
import type { Incident, HealthResponse, MetricsResponse } from '@/lib/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, healthRes, incidentsRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/health'),
        fetch('/api/incidents?limit=10'),
      ]);

      const metricsData = await metricsRes.json();
      const healthData = await healthRes.json();
      const incidentsData = await incidentsRes.json();

      if (metricsData.success) setMetrics(metricsData.data);
      if (healthData.success) setHealth(healthData.data);
      if (incidentsData.success) setIncidents(incidentsData.data.incidents);
    } catch {
      showToast('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const simulateError = async (type: 'procedure' | 'embed') => {
    setSimulating(type);
    try {
      const res = await fetch(`/api/simulate/${type}-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: type === 'procedure' ? 'payment-processing' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${type === 'procedure' ? 'Procedure' : 'Embed'} error simulated — incident created`, 'success');
        fetchData();
      }
    } catch {
      showToast('Simulation failed', 'error');
    } finally {
      setSimulating(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-12">
          <div className="skeleton" style={{ width: '240px', height: '28px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '360px', height: '14px' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const healthServices = [
    { name: 'Procedure Service', icon: <Settings size={15} />, key: 'procedure' },
    { name: 'Embed Service', icon: <Code size={15} />, key: 'embed' },
    { name: 'API', icon: <Server size={15} />, key: 'api' },
    { name: 'Database', icon: <Database size={15} />, key: 'database' },
    { name: 'Sentry', icon: <Radio size={15} />, key: 'sentry' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: '48px' }}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Dashboard</h1>
            <span className="badge badge-info">Demo</span>
          </div>
          <p className="page-subtitle">Application health and error activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Health Overview */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Health Overview</h2>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {healthServices.map((service) => {
              const svc = health?.services.find((s) => s.name === service.key);
              const status = svc?.status || 'healthy';
              return (
                <div
                  key={service.key}
                  className="flex items-center justify-between"
                  style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: 'var(--text-muted)' }}>{service.icon}</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HealthDot status={status} />
                    <span className="text-xs capitalize" style={{ color: status === 'healthy' ? 'var(--green)' : status === 'warning' ? 'var(--yellow)' : 'var(--red)' }}>
                      {status === 'healthy' ? 'Operational' : status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Error Activity */}
      <section style={{ marginBottom: '48px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h2 className="section-title">Recent Error Activity</h2>
          <Link href="/incidents" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--blue)' }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {incidents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <CheckCircle size={24} style={{ color: 'var(--green)', margin: '0 auto 12px' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              No incidents recorded
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              Use the quick actions below to trigger demo errors
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {incidents.slice(0, 5).map((incident, i) => (
              <Link
                key={incident.id}
                href={`/incidents/${incident.id}`}
                className="flex items-center justify-between group"
                style={{
                  padding: '14px 24px',
                  borderBottom: i < Math.min(incidents.length, 5) - 1 ? '1px solid var(--border-subtle)' : 'none',
                  textDecoration: 'none',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="shrink-0">
                    <SeverityBadge severity={incident.severity} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {incident.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      {incident.module} · {incident.route}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={incident.status} />
                  {incident.sentryEventId ? (
                    <span className="text-xs" style={{ color: 'var(--green)' }}>Sent</span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--yellow)' }}>Pending</span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(incident.createdAt).toLocaleTimeString()}
                  </span>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', opacity: 0, transition: 'opacity 120ms' }} className="group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => simulateError('procedure')}
            disabled={simulating !== null}
            className="card-interactive text-left"
            style={{ cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--red)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {simulating === 'procedure' ? 'Simulating...' : 'Simulate Procedure Error'}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Trigger the procedure error boundary
            </p>
          </button>

          <button
            onClick={() => simulateError('embed')}
            disabled={simulating !== null}
            className="card-interactive text-left"
            style={{ cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
              <XCircle size={16} style={{ color: 'var(--red)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {simulating === 'embed' ? 'Simulating...' : 'Simulate Embed Error'}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Trigger the embed error boundary
            </p>
          </button>

          <Link href="/demo" className="card-interactive" style={{ textDecoration: 'none' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
              <Play size={16} style={{ color: 'var(--blue)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Open Demo Center
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Step-by-step guided demonstration
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
