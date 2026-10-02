'use client';

import { useState } from 'react';
import {
  Code,
  AlertTriangle,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { HealthDot } from '@/components/ui/badges';

export default function EmbedPage() {
  const [shouldError, setShouldError] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  // When shouldError is true, throw to trigger the embed error boundary
  if (shouldError) {
    throw new Error('Simulated embed application failure');
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="page-title">Embed Application</h1>
        <p className="page-subtitle">Monitor the embedded application widget.</p>
      </div>

      {/* Status */}
      <section style={{ marginBottom: '48px' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '32px' }}>
          <HealthDot status="healthy" />
          <span className="text-sm font-medium" style={{ color: 'var(--green)' }}>Connected</span>
        </div>

        {/* Widget Preview */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <Code size={32} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
            Embedded Widget
          </h2>
          <p className="text-sm" style={{ color: 'var(--green)' }}>Operational</p>
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
          <div>
            <span className="label">Widget Version</span>
            <p className="text-sm font-mono" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>v2.4.1</p>
          </div>
          <div>
            <span className="label">Last Sync</span>
            <p className="text-sm" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Error Boundary Testing */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="section-title" style={{ marginBottom: '8px' }}>Error Boundary Testing</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          The embed error boundary is hardened with Sentry integration.
        </p>

        <div className="flex items-center gap-4" style={{ marginBottom: '20px' }}>
          <div className="flex items-center gap-2">
            <Shield size={14} style={{ color: 'var(--green)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hardened</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} style={{ color: 'var(--green)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sentry Connected</span>
          </div>
        </div>

        <button
          onClick={() => setShouldError(true)}
          className="btn btn-danger"
        >
          <AlertTriangle size={14} />
          Simulate Embed Failure
        </button>
        <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          This intentionally triggers the embed error boundary and reports the exception to Sentry.
        </p>
      </section>

      {/* Technical details (progressive disclosure) */}
      <button
        onClick={() => setShowTechnical(!showTechnical)}
        className="text-xs font-medium"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {showTechnical ? '▾ Hide technical details' : '▸ Technical details'}
      </button>
      {showTechnical && (
        <div className="card" style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            {[
              { label: 'Boundary', value: 'embed' },
              { label: 'Sentry Integration', value: 'Hardened (captureException)' },
              { label: 'Duplicate Prevention', value: 'Active (useRef guard)' },
              { label: 'Tags', value: 'error_boundary, route_type, module' },
              { label: 'Widget ID', value: 'emb-wgt-001' },
              { label: 'Protocol', value: 'WebSocket' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
