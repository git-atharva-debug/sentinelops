'use client';

import { useEffect, useRef } from 'react';
import { XCircle, RefreshCw, ArrowLeft, Radio, Shield } from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { reportApplicationError, generateCorrelationId } from '@/lib/error-reporting';

// ===========================================
// EMBED ERROR BOUNDARY (HARDENED)
// ===========================================
// This is the hardened error boundary for
// the /embed route.
//
// BEFORE hardening: Errors were caught but
// silently dropped — no Sentry reporting.
//
// AFTER hardening: Errors are caught AND
// reported to Sentry with structured context.
// ===========================================

export default function EmbedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Ref to prevent duplicate Sentry reporting
  const reportedRef = useRef(false);
  const sentryEventIdRef = useRef<string | undefined>(undefined);
  const correlationIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (reportedRef.current) return;
    const correlationId = generateCorrelationId();
    correlationIdRef.current = correlationId;

    const eventId = reportApplicationError(error, {
      boundary: 'embed',
      route: 'embed',
      module: 'embed-application',
      correlationId,
      severity: 'error'
    });
    sentryEventIdRef.current = eventId;

    // Create an incident record in the application database
    fetch('/api/simulate/embed-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorMessage: error.message,
        sentryEventId: sentryEventIdRef.current,
        correlationId: correlationIdRef.current,
      }),
    }).catch(() => {
      // Silently fail
    });
  }, [error]);

  return (
    <div className="error-fallback">
      <div className="error-fallback-icon">
        <XCircle size={36} style={{ color: 'var(--red)' }} />
      </div>

      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
        Embedded Application Crashed
      </h2>

      <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '28rem' }}>
        The embedded application widget encountered a critical error.
        This error has been automatically reported to the monitoring system.
      </p>

      {/* Error Details Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '32rem',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Error Message
            </span>
            <span className="badge badge-error">Embed Boundary</span>
          </div>
          <p className="text-sm font-mono" style={{ color: 'var(--red)' }}>
            {error.message}
          </p>

          {error.digest && (
            <div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Digest: {error.digest}
              </span>
            </div>
          )}

          {/* Sentry Status */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}
          >
            <Radio size={14} style={{ color: 'var(--green)' }} />
            <span className="text-xs" style={{ color: 'var(--green)' }}>
              Reported to Sentry
            </span>
            {sentryEventIdRef.current && (
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                ({sentryEventIdRef.current.substring(0, 8)}...)
              </span>
            )}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <span className="badge badge-purple">error_boundary: embed</span>
            <span className="badge badge-info">route_type: embed</span>
          </div>
        </div>
      </div>

      {/* Hardening Badge */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '8px 16px', borderRadius: '8px', background: 'var(--green-dim)' }}
      >
        <Shield size={16} style={{ color: 'var(--green)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--green)' }}>
          HARDENED — Error boundary reports to Sentry via captureException()
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={reset} className="btn btn-primary">
          <RefreshCw size={16} />
          Reload Widget
        </button>
        <Link href="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <Link href="/incidents" className="btn btn-ghost">
          View Incidents
        </Link>
      </div>
    </div>
  );
}
