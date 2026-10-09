// ===========================================
// SentinelOps - Centralized Error Reporting
// ===========================================
// Reusable abstraction for reporting errors
// to Sentry with consistent metadata, severity
// and correlation IDs.
// ===========================================

import * as Sentry from '@sentry/nextjs';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

export interface ApplicationErrorContext {
  boundary: string;
  route: string;
  module: string;
  correlationId?: string;
  severity?: ErrorSeverity;
  additionalContext?: Record<string, unknown>;
}

/**
 * Report an application error to Sentry with full structured context.
 */
export function reportApplicationError(
  error: Error,
  context: ApplicationErrorContext
): string {
  let eventId = '';

  Sentry.withScope((scope) => {
    // Feature 3: Environment + Release context
    const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';
    const release = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

    scope.setTag('error_boundary', context.boundary);
    scope.setTag('route_type', context.route);
    scope.setTag('module', context.module);
    scope.setTag('environment', env);
    scope.setTag('release', release);
    scope.setTag('app', 'sentinelops');

    // Feature 2: Correlation ID
    if (context.correlationId) {
      scope.setTag('correlation_id', context.correlationId);
    }

    // Feature 6: Error Severity Classification
    scope.setLevel(context.severity || 'error');

    // Structured Context (No sensitive data)
    scope.setContext('error_boundary', {
      boundary: context.boundary,
      routeType: context.route,
      module: context.module,
      correlationId: context.correlationId,
      timestamp: new Date().toISOString(),
    });

    scope.setContext('application', {
      name: 'SentinelOps',
      module: context.module,
      environment: env,
      release: release,
    });

    if (context.additionalContext) {
      // Basic sanitization
      const safeContext: Record<string, unknown> = {};
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
      for (const [key, value] of Object.entries(context.additionalContext)) {
        if (!sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          safeContext[key] = value;
        }
      }
      scope.setContext('additional', safeContext);
    }

    eventId = Sentry.captureException(error);
  });

  return eventId;
}

/**
 * Generate a robust collision-resistant correlation ID for incidents
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INC-${new Date().getFullYear()}-${timestamp}-${randomStr}`;
}
