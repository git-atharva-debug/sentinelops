'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Clock,
  RefreshCw,
  Radio,
  AlertTriangle,
  Eye,
  XCircle,
  Search,
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from '@/components/ui/badges';
import { showToast } from '@/components/ui/toast';
import type { Incident } from '@/lib/types';

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const fetchIncident = useCallback(async () => {
    try {
      const res = await fetch(`/api/incidents/${id}`);
      const data = await res.json();
      if (data.success) {
        setIncident(data.data);
      } else {
        showToast('Incident not found', 'error');
      }
    } catch {
      showToast('Failed to fetch incident', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated to ${status}`, 'success');
        fetchIncident();
      }
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '80px' }} />
        ))}
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Search size={32} style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-base font-medium mt-4" style={{ color: 'var(--text-primary)' }}>
          Incident Not Found
        </h2>
        <Link href="/incidents" className="btn btn-primary mt-4 btn-sm">
          Back to Incidents
        </Link>
      </div>
    );
  }

  const metadata = incident.metadata ? JSON.parse(incident.metadata) : {};

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Back */}
      <Link
        href="/incidents"
        className="inline-flex items-center gap-2 text-xs font-medium"
        style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', display: 'inline-flex' }}
      >
        <ArrowLeft size={14} />
        Back to Incidents
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '12px' }}>{incident.title}</h1>
        <div className="flex items-center gap-3">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      {/* Error */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="label" style={{ marginBottom: '8px' }}>Error Message</h2>
        <div
          className="font-mono text-sm"
          style={{
            padding: '12px 16px',
            background: 'var(--red-dim)',
            color: 'var(--red)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}
        >
          {incident.message}
        </div>
      </section>

      <hr className="divider" />

      {/* Details */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Incident Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <span className="label">Module</span>
            <p className="text-sm" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>{incident.module}</p>
          </div>
          <div>
            <span className="label">Route</span>
            <p className="text-sm font-mono" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>{incident.route}</p>
          </div>
          <div>
            <span className="label">Error Boundary</span>
            <p className="text-sm font-mono" style={{ marginTop: '4px', color: 'var(--purple)' }}>{incident.errorBoundary || '—'}</p>
          </div>
          <div>
            <span className="label">Correlation ID</span>
            <p className="text-sm font-mono" style={{ marginTop: '4px', color: 'var(--cyan)' }}>
              {metadata.correlationId || '—'}
            </p>
          </div>
          <div>
            <span className="label">Created</span>
            <p className="text-sm" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
              {new Date(incident.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Sentry */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Sentry</h2>
        {incident.sentryEventId ? (
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
              <CheckCircle size={14} style={{ color: 'var(--green)' }} />
              <span className="text-sm" style={{ color: 'var(--green)' }}>Exception captured</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
              <div>
                <span className="label">Event ID</span>
                <p className="text-sm font-mono" style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                  {incident.sentryEventId}
                </p>
              </div>
              <div>
                <span className="label">Environment</span>
                <p className="text-sm" style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                  {process.env.NEXT_PUBLIC_APP_ENV || 'demo'}
                </p>
              </div>
              <div>
                <span className="label">Release</span>
                <p className="text-sm" style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                  {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
                </p>
              </div>
            </div>
            {process.env.NEXT_PUBLIC_SENTRY_ORG && process.env.NEXT_PUBLIC_SENTRY_PROJECT && (
              <a
                href={`https://sentry.io/organizations/${process.env.NEXT_PUBLIC_SENTRY_ORG}/issues/?query=${incident.sentryEventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={13} />
                Open in Sentry
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: 'var(--yellow)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Sentry event not available
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              This incident was recorded locally and does not have an associated Sentry event.
            </p>
          </div>
        )}
      </section>

      <hr className="divider" />

      {/* Resolution */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Resolution</h2>
        <div className="flex items-center gap-3">
          {incident.status !== 'INVESTIGATING' && (
            <button
              onClick={() => updateStatus('INVESTIGATING')}
              disabled={updating}
              className="btn btn-secondary btn-sm"
            >
              <Eye size={13} />
              Investigate
            </button>
          )}
          {incident.status !== 'RESOLVED' && (
            <button
              onClick={() => updateStatus('RESOLVED')}
              disabled={updating}
              className="btn btn-success btn-sm"
            >
              <CheckCircle size={13} />
              Resolve
            </button>
          )}
          {incident.status === 'RESOLVED' && (
            <button
              onClick={() => updateStatus('OPEN')}
              disabled={updating}
              className="btn btn-danger btn-sm"
            >
              <XCircle size={13} />
              Reopen
            </button>
          )}
        </div>
      </section>

      {/* Timeline */}
      {incident.events && incident.events.length > 0 && (
        <>
          <hr className="divider" />
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title" style={{ marginBottom: '16px' }}>Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {incident.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3"
                  style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="mt-0.5 shrink-0">
                    {event.eventType === 'CREATED' && <AlertTriangle size={14} style={{ color: 'var(--red)' }} />}
                    {event.eventType === 'STATUS_CHANGE' && <RefreshCw size={14} style={{ color: 'var(--yellow)' }} />}
                    {event.eventType === 'RESOLVED' && <CheckCircle size={14} style={{ color: 'var(--green)' }} />}
                    {event.eventType === 'SENTRY_LINKED' && <Radio size={14} style={{ color: 'var(--cyan)' }} />}
                    {event.eventType === 'NOTE' && <Eye size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {event.message}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Metadata (progressive disclosure) */}
      {Object.keys(metadata).length > 0 && (
        <>
          <hr className="divider" />
          <section>
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="text-xs font-medium"
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {showMeta ? '▾ Hide metadata' : '▸ View metadata'}
            </button>
            {showMeta && (
              <div style={{ marginTop: '12px' }}>
                <pre
                  className="text-xs font-mono"
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-inset)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
