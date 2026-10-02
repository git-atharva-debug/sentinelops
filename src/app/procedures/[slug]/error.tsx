'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Radio, Shield } from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import '../../../../sentry.client.config';

// ===========================================
// PROCEDURE ERROR BOUNDARY (HARDENED)
// ===========================================
// This is the hardened error boundary for
// /procedures/[slug] routes.
//
// BEFORE hardening: Errors were caught but
// silently dropped — no Sentry reporting.
//
// AFTER hardening: Errors are caught AND
// reported to Sentry with structured context.
// ===========================================

export default function ProcedureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Ref to prevent duplicate Sentry reporting
  // React may re-render the error boundary, and we
  // must NOT send the same error to Sentry twice.
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
      // Set tags for filtering in Sentry dashboard
      scope.setTag('error_boundary', 'procedure');
      scope.setTag('route_type', 'procedure');
      scope.setTag('module', 'procedure-processing');
      scope.setTag('environment', process.env.NEXT_PUBLIC_APP_ENV || 'demo');
      scope.setTag('app', 'sentinelops');

      // Set structured context (NO sensitive data)
      scope.setContext('error_boundary', {
        boundary: 'procedure',
        routeType: 'procedure',
        module: 'procedure-processing',
        timestamp: new Date().toISOString(),
        appVersion: '1.0.0',
      });

      scope.setContext('application', {
        name: 'SentinelOps',
        module: 'procedure-processing',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'demo',
      });

      scope.setLevel('error');

      // Capture the ACTUAL Error object, not just a string
      const eventId = Sentry.captureException(error);
      sentryEventIdRef.current = eventId;
    });

    // Also create an incident record in the application database
    fetch('/api/simulate/procedure-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: typeof window !== 'undefined'
          ? window.location.pathname.split('/').pop()
          : 'unknown',
        errorMessage: error.message,
        sentryEventId: sentryEventIdRef.current,
      }),
    }).catch(() => {
      // Silently fail — we don't want incident creation
      // failure to cascade into more errors
    });
  }, [error]);

  return (
    <div className="error-fallback">
      <div className="error-fallback-icon">
        <AlertTriangle size={36} style={{ color: 'var(--accent-red)' }} />
      </div>

      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Procedure Execution Failed
      </h2>

      <p className="text-sm mb-6 max-w-md" style={{ color: 'var(--text-muted)' }}>
        The procedure encountered an error during execution.
        This error has been automatically reported to the monitoring system.
      </p>

      {/* Error Details Card */}
      <div
        className="w-full max-w-lg rounded-xl p-4 mb-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-red)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Error Message
            </span>
            <span className="badge badge-error">Procedure Boundary</span>
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
            <span className="badge badge-purple">error_boundary: procedure</span>
            <span className="badge badge-info">route_type: procedure</span>
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
          Retry Procedure
        </button>
        <Link href="/procedures" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Procedures
        </Link>
        <Link href="/incidents" className="btn btn-ghost">
          View Incidents
        </Link>
      </div>
    </div>
  );
}
