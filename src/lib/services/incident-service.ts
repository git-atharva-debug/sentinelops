// ===========================================
// SentinelOps - Incident Service
// ===========================================
// Business logic for incident management.
// ===========================================

import prisma from '@/lib/db/prisma';
import type { CreateIncidentInput, UpdateIncidentInput } from '@/lib/validation/schemas';

export class IncidentService {
  /**
   * Create a new incident with an initial event
   */
  static async create(input: CreateIncidentInput) {
    const incident = await prisma.incident.create({
      data: {
        title: input.title,
        message: input.message,
        module: input.module,
        route: input.route,
        severity: input.severity,
        status: input.status || 'OPEN',
        errorBoundary: input.errorBoundary || null,
        sentryEventId: input.sentryEventId || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        events: {
          create: {
            eventType: 'CREATED',
            message: `Incident created: ${input.title}`,
            metadata: JSON.stringify({
              module: input.module,
              severity: input.severity,
              errorBoundary: input.errorBoundary,
            }),
          },
        },
      },
      include: {
        events: true,
      },
    });

    return incident;
  }

  /**
   * Get all incidents with optional filtering
   */
  static async findAll(options?: {
    module?: string;
    status?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (options?.module) where.module = options.module;
    if (options?.status) where.status = options.status;
    if (options?.severity) where.severity = options.severity;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          events: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.incident.count({ where }),
    ]);

    return { incidents, total };
  }

  /**
   * Get a single incident by ID
   */
  static async findById(id: string) {
    return prisma.incident.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Update an incident's status or details
   */
  static async update(id: string, input: UpdateIncidentInput) {
    const data: Record<string, unknown> = {};

    if (input.status) {
      data.status = input.status;
      if (input.status === 'RESOLVED') {
        data.resolvedAt = new Date();
      }
    }
    if (input.severity) data.severity = input.severity;
    if (input.sentryEventId) data.sentryEventId = input.sentryEventId;

    const incident = await prisma.incident.update({
      where: { id },
      data,
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Create status change event
    if (input.status) {
      await prisma.incidentEvent.create({
        data: {
          incidentId: id,
          eventType: input.status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGE',
          message: `Status changed to ${input.status}`,
          metadata: JSON.stringify({
            newStatus: input.status,
            updatedAt: new Date().toISOString(),
          }),
        },
      });
    }

    return incident;
  }

  /**
   * Get incident metrics/stats
   */
  static async getMetrics() {
    const [total, open, investigating, resolved, procedureErrors, embedErrors] =
      await Promise.all([
        prisma.incident.count(),
        prisma.incident.count({ where: { status: 'OPEN' } }),
        prisma.incident.count({ where: { status: 'INVESTIGATING' } }),
        prisma.incident.count({ where: { status: 'RESOLVED' } }),
        prisma.incident.count({ where: { module: 'procedure' } }),
        prisma.incident.count({ where: { module: 'embed' } }),
      ]);

    const lastError = await prisma.incident.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const criticalCount = await prisma.incident.count({
      where: { severity: 'CRITICAL', status: { not: 'RESOLVED' } },
    });

    return {
      total,
      open,
      investigating,
      resolved,
      procedureErrors,
      embedErrors,
      criticalCount,
      errorRate: total > 0 ? ((total - resolved) / total * 100).toFixed(1) : '0.0',
      lastErrorTime: lastError?.createdAt?.toISOString() || null,
    };
  }
}
