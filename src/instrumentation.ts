// ===========================================
// SentinelOps - Next.js Instrumentation
// ===========================================
// This file is used to initialize Sentry on
// both server and edge runtimes.
// ===========================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = (await import('@sentry/nextjs')).captureRequestError;
