// ===========================================
// SentinelOps - Sentry Client Configuration
// ===========================================
// Centralized Sentry utilities for error reporting
// with structured context and duplicate prevention.
// ===========================================

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for the application.
 * Called from instrumentation.ts and sentry configs.
 */
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn(
      '[SentinelOps] Sentry DSN not configured. Error reporting is disabled. ' +
      'Set NEXT_PUBLIC_SENTRY_DSN in your .env file to enable Sentry.'
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    debug: false,
    beforeSend(event) {
      // Strip any sensitive data before sending
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.request?.headers) {
        // Remove authorization headers
        const safeHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(event.request.headers)) {
          if (!['authorization', 'cookie', 'set-cookie'].includes(key.toLowerCase())) {
            safeHeaders[key] = value;
          }
        }
        event.request.headers = safeHeaders;
      }
      return event;
    },
  });
}

/**
 * Report an error boundary exception to Sentry with structured context.
 * Prevents duplicate reporting through the dedup mechanism.
 */
export function reportErrorBoundary(
  error: Error,
  options: {
    errorBoundary: 'procedure' | 'embed' | 'global';
    routeType: string;
    module: string;
    route?: string;
    additionalContext?: Record<string, unknown>;
  }
): string | undefined {
  const { errorBoundary, routeType, module: moduleName, route, additionalContext } = options;

  let eventId: string | undefined;

  Sentry.withScope((scope) => {
    // Set tags for filtering in Sentry dashboard
    scope.setTag('error_boundary', errorBoundary);
    scope.setTag('route_type', routeType);
    scope.setTag('module', moduleName);
    scope.setTag('environment', process.env.NEXT_PUBLIC_APP_ENV || 'demo');
    scope.setTag('app', 'sentinelops');

    if (route) {
      scope.setTag('route', route);
    }

    // Set structured context (no sensitive data)
    scope.setContext('error_boundary', {
      boundary: errorBoundary,
      routeType,
      module: moduleName,
      route: route || 'unknown',
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0',
    });

    scope.setContext('application', {
      name: 'SentinelOps',
      module: moduleName,
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'demo',
    });

    if (additionalContext) {
      // Filter out any potentially sensitive fields
      const safeContext: Record<string, unknown> = {};
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential', 'ssn', 'credit'];
      for (const [key, value] of Object.entries(additionalContext)) {
        if (!sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          safeContext[key] = value;
        }
      }
      scope.setContext('additional', safeContext);
    }

    // Set severity level
    scope.setLevel('error');

    // Capture the actual Error object, not just a string
    eventId = Sentry.captureException(error);
  });

  return eventId;
}

/**
 * Check if Sentry is configured and reachable
 */
export function isSentryConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SENTRY_DSN;
}

/**
 * Get the Sentry DSN status (without exposing the actual DSN)
 */
export function getSentryStatus(): {
  configured: boolean;
  environment: string;
} {
  return {
    configured: isSentryConfigured(),
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  };
}
