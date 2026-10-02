'use client';

import { useEffect, useRef } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

// ===========================================
// GLOBAL ERROR BOUNDARY
// ===========================================
// Catches unexpected errors that are not
// handled by route-level error boundaries.
// ===========================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reportedRef = useRef(false);

  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;

    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', 'global');
      scope.setTag('route_type', 'global');
      scope.setTag('module', 'application');
      scope.setTag('environment', process.env.NEXT_PUBLIC_APP_ENV || 'demo');
      scope.setTag('app', 'sentinelops');

      scope.setContext('error_boundary', {
        boundary: 'global',
        routeType: 'global',
        module: 'application',
        timestamp: new Date().toISOString(),
      });

      scope.setLevel('fatal');
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#0a0e1a',
          color: '#f1f5f9',
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '500px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <AlertOctagon size={36} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Critical Application Error
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            An unexpected error occurred. This error has been reported to the monitoring system.
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: '#ef4444',
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            {error.message}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                background: '#252b3d',
                color: '#f1f5f9',
                border: '1px solid #1e293b',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <Home size={16} />
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
