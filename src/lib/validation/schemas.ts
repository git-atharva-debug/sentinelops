// ===========================================
// SentinelOps - Zod Validation Schemas
// ===========================================

import { z } from 'zod';

// Incident creation schema
export const createIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  message: z.string().min(1, 'Message is required').max(5000),
  module: z.enum(['procedure', 'embed', 'api', 'system']),
  route: z.string().min(1, 'Route is required').max(500),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED']).default('OPEN'),
  errorBoundary: z.enum(['procedure', 'embed', 'global']).optional(),
  sentryEventId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Incident update schema
export const updateIncidentSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  sentryEventId: z.string().optional(),
  resolvedAt: z.string().datetime().optional(),
});

// Incident event creation schema
export const createIncidentEventSchema = z.object({
  eventType: z.enum(['CREATED', 'STATUS_CHANGE', 'SENTRY_LINKED', 'NOTE', 'RESOLVED']),
  message: z.string().min(1).max(2000),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Simulation request schema
export const simulateErrorSchema = z.object({
  module: z.enum(['procedure', 'embed']),
  errorMessage: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
});

// Types inferred from schemas
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type CreateIncidentEventInput = z.infer<typeof createIncidentEventSchema>;
export type SimulateErrorInput = z.infer<typeof simulateErrorSchema>;
