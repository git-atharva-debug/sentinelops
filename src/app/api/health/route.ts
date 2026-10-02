// ===========================================
// GET /api/health - System health check
// ===========================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { isSentryConfigured } from '@/lib/sentry/client';

interface HealthService {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  latency?: number;
}

export async function GET() {
  const services: HealthService[] = [];
  const startTime = Date.now();

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    services.push({
      name: 'database',
      status: dbLatency > 500 ? 'warning' : 'healthy',
      message: dbLatency > 500 ? 'Slow response' : 'Connected',
      latency: dbLatency,
    });
  } catch {
    services.push({
      name: 'database',
      status: 'error',
      message: 'Connection failed',
    });
  }

  // Check Sentry
  services.push({
    name: 'sentry',
    status: isSentryConfigured() ? 'healthy' : 'warning',
    message: isSentryConfigured() ? 'Configured' : 'DSN not configured',
  });

  // API service (always healthy if responding)
  services.push({
    name: 'api',
    status: 'healthy',
    message: 'Operational',
    latency: Date.now() - startTime,
  });

  // Procedure service (simulated - always healthy unless triggered)
  services.push({
    name: 'procedure',
    status: 'healthy',
    message: 'Operational',
  });

  // Embed service (simulated - always healthy unless triggered)
  services.push({
    name: 'embed',
    status: 'healthy',
    message: 'Operational',
  });

  const overallStatus = services.some((s) => s.status === 'error')
    ? 'error'
    : services.some((s) => s.status === 'warning')
    ? 'warning'
    : 'healthy';

  return NextResponse.json({
    success: true,
    data: {
      status: overallStatus,
      services,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    },
  });
}
