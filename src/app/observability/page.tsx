'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle,
  Shield,
  Radio,
  FileText,
  Search,
  CheckCircle,
  ArrowDown,
} from 'lucide-react';
import { showToast } from '@/components/ui/toast';
import type { MetricsResponse } from '@/lib/types';

export default function ObservabilityPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      if (data.success) setMetrics(data.data);
    } catch {
      showToast('Failed to fetch metrics', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const pipelineSteps = [
    { title: 'Application', desc: 'User interacts with procedures or embedded widgets', icon: <FileText size={16} /> },
    { title: 'Error Occurs', desc: 'A runtime error is thrown in the route', icon: <AlertTriangle size={16} /> },
    { title: 'Error Boundary', desc: 'Route-level boundary catches the error', icon: <Shield size={16} /> },
    { title: 'Sentry.captureException()', desc: 'Exception captured with structured context', icon: <Radio size={16} /> },
    { title: 'Sentry Event', desc: 'Event received by Sentry platform', icon: <CheckCircle size={16} /> },
    { title: 'Incident Created', desc: 'Local record created in application database', icon: <FileText size={16} /> },
    { title: 'Investigation', desc: 'Developer reviews in SentinelOps and Sentry', icon: <Search size={16} /> },
  ];

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="page-title">Observability</h1>
        <p className="page-subtitle">Trace application failures from detection to investigation.</p>
      </div>

      {/* Pipeline */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="section-title" style={{ marginBottom: '24px' }}>Error Pipeline</h2>
        <div>
          {pipelineSteps.map((step, index) => (
            <div key={step.title}>
              <div className="pipeline-node">
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    {step.desc}
                  </p>
                </div>
                <CheckCircle size={14} style={{ color: 'var(--green)' }} className="shrink-0" />
              </div>
              {index < pipelineSteps.length - 1 && (
                <div className="pipeline-connector">
                  <ArrowDown size={0} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* Error Distribution */}
      {metrics && !loading && (
        <section style={{ marginBottom: '48px' }}>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Error Distribution</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Procedure</span>
              <div className="flex items-center gap-3">
                <div style={{ width: '120px', height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '3px',
                      background: 'var(--purple)',
                      width: metrics.total > 0 ? `${(metrics.procedureErrors / metrics.total) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-sm font-mono" style={{ color: 'var(--text-primary)', minWidth: '24px', textAlign: 'right' }}>
                  {metrics.procedureErrors}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Embed</span>
              <div className="flex items-center gap-3">
                <div style={{ width: '120px', height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '3px',
                      background: 'var(--cyan)',
                      width: metrics.total > 0 ? `${(metrics.embedErrors / metrics.total) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-sm font-mono" style={{ color: 'var(--text-primary)', minWidth: '24px', textAlign: 'right' }}>
                  {metrics.embedErrors}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <hr className="divider" />

      {/* Latest Event */}
      {metrics && (
        <section>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Latest Captured Event</h2>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <span className="label">Last Event</span>
                <p style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
                  {metrics.lastErrorTime ? new Date(metrics.lastErrorTime).toLocaleString() : 'No events captured'}
                </p>
              </div>
              <div>
                <span className="label">Total Captured</span>
                <p style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
                  {metrics.total} events
                </p>
              </div>
              <div>
                <span className="label">Error Rate</span>
                <p style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
                  {metrics.errorRate}%
                </p>
              </div>
              <div>
                <span className="label">Resolved</span>
                <p style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
                  {metrics.resolved} of {metrics.total}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
