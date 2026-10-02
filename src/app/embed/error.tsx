'use client';

import { useEffect, useRef } from 'react';
import { XCircle, RefreshCw, ArrowLeft, Radio, Shield } from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

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

  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;

    // ==========================================
    // SENTRY ERROR REPORTING (HARDENED)
    // ==========================================
    // This is the KEY fix for the original problem:
    // Previously, this error boundary did NOT call
    // Sentry.captureException(), so errors were
    // invisible to the monitoring system.
    // ==========================================

    Sentry.withScope((scope) => {
      // Set tags for Sentry dashboard filtering
      scope.setTag('error_boundary', 'embed');
      scope.setTag('route_type', 'embed');
      scope.setTag('module', 'embed-application');
      scope.setTag('environment', process.env.NEXT_PUBLIC_APP_ENV || 'demo');
      scope.setTag('app', 'sentinelops');

      // Set structured context (NO sensitive data)
      scope.setContext('error_boundary', {
        boundary: 'embed',
        routeType: 'embed',
        module: 'embed-application',
        timestamp: new Date().toISOString(),
        appVersion: '1.0.0',
      });

      scope.setContext('application', {
        name: 'SentinelOps',
        module: 'embed-application',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'demo',
      });

      scope.setLevel('error');

      // Capture the ACTUAL Error object
      const eventId = Sentry.captureException(error);
      sentryEventIdRef.current = eventId;
    });

    // Create an incident record in the application database
    fetch('/api/simulate/embed-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorMessage: error.message,
        sentryEventId: sentryEventIdRef.current,
      }),
    }).catch(() => {
      // Silently fail
    });
  }, [error]);

  return (
    <div className="error-fallback">
      <div className="error-fallback-icon">
        <XCircle size={36} style={{ color: 'var(--accent-red)' }} />
      </div>

      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Embedded Application Crashed
      </h2>

      <p className="text-sm mb-6 max-w-md" style={{ color: 'var(--text-muted)' }}>
        The embedded application widget encountered a critical error.
        This error has been automatically reported to the monitoring system.
      </p>

      {/* Error Details Card */}
      <div
        className="w-full max-w-lg rounded-xl p-4 mb-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Error Message
            </span>
            <span className="badge badge-error">Embed Boundary</span>
          </div>
          <p className="text-sm font-mono" style={{ color: 'var(--accent-red)' }}>
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
            className="flex items-center gap-2 pt-2"
            style={{ borderTop: '1px solid var(--border-default)' }}
          >
            <Radio size={14} style={{ color: 'var(--accent-green)' }} />
            <span className="text-xs" style={{ color: 'var(--accent-green)' }}>
              Reported to Sentry
            </span>
            {sentryEventIdRef.current && (
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                ({sentryEventIdRef.current.substring(0, 8)}...)
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            <span className="badge badge-purple">error_boundary: embed</span>
            <span className="badge badge-info">route_type: embed</span>
          </div>
        </div>
      </div>

      {/* Hardening Badge */}
      <div
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg"
        style={{ background: 'var(--accent-green-dim)' }}
      >
        <Shield size={16} style={{ color: 'var(--accent-green)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>
          HARDENED — Error boundary reports to Sentry via captureException()
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
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
