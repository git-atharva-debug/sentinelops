// ===========================================
// Test: API Endpoints
// ===========================================
// Tests for incident API and health endpoints
// ===========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const { mockFindMany, mockFindUnique, mockCreate, mockUpdate, mockCount, mockFindFirst, mockQueryRaw } = vi.hoisted(() => {
  return {
    mockFindMany: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockCount: vi.fn(),
    mockFindFirst: vi.fn(),
    mockQueryRaw: vi.fn(),
  };
});

vi.mock('@/lib/db/prisma', () => ({
  default: {
    incident: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      count: mockCount,
      findFirst: mockFindFirst,
    },
    incidentEvent: {
      create: vi.fn(),
    },
    $queryRaw: mockQueryRaw,
  },
}));

// Mock Sentry
vi.mock('@/lib/sentry/client', () => ({
  isSentryConfigured: () => false,
}));

import { IncidentService } from '@/lib/services/incident-service';

describe('IncidentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates an incident with an initial event', async () => {
      const mockIncident = {
        id: 'test-id',
        title: 'Test Incident',
        message: 'Test error message',
        module: 'procedure',
        route: '/procedures/test',
        severity: 'HIGH',
        status: 'OPEN',
        errorBoundary: 'procedure',
        sentryEventId: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        events: [{ id: 'event-1', eventType: 'CREATED', message: 'Incident created: Test Incident' }],
      };

      mockCreate.mockResolvedValue(mockIncident);

      const result = await IncidentService.create({
        title: 'Test Incident',
        message: 'Test error message',
        module: 'procedure',
        route: '/procedures/test',
        severity: 'HIGH',
        status: 'OPEN',
        errorBoundary: 'procedure',
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(result.title).toBe('Test Incident');
      expect(result.module).toBe('procedure');
    });
  });

  describe('findAll', () => {
    it('returns incidents with pagination', async () => {
      const mockIncidents = [
        { id: '1', title: 'Incident 1', events: [] },
        { id: '2', title: 'Incident 2', events: [] },
      ];

      mockFindMany.mockResolvedValue(mockIncidents);
      mockCount.mockResolvedValue(2);

      const result = await IncidentService.findAll({ limit: 10 });

      expect(result.incidents).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('filters by module', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await IncidentService.findAll({ module: 'procedure' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ module: 'procedure' }),
        })
      );
    });
  });

  describe('findById', () => {
    it('returns a single incident with events', async () => {
      const mockIncident = {
        id: 'test-id',
        title: 'Test',
        events: [],
      };

      mockFindUnique.mockResolvedValue(mockIncident);

      const result = await IncidentService.findById('test-id');

      expect(result).toEqual(mockIncident);
      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-id' },
        })
      );
    });
  });

  describe('getMetrics', () => {
    it('returns aggregated metrics', async () => {
      mockCount.mockImplementation(({ where }: { where?: Record<string, unknown> } = {}) => {
        if (!where) return 10;
        if (where.status === 'OPEN') return 3;
        if (where.status === 'INVESTIGATING') return 2;
        if (where.status === 'RESOLVED') return 5;
        if (where.module === 'procedure') return 4;
        if (where.module === 'embed') return 3;
        if (where.severity === 'CRITICAL') return 1;
        return 0;
      });

      mockFindFirst.mockResolvedValue({
        createdAt: new Date('2024-01-01'),
      });

      const metrics = await IncidentService.getMetrics();

      expect(metrics.total).toBeDefined();
      expect(typeof metrics.errorRate).toBe('string');
    });
  });
});

import { createIncidentSchema, updateIncidentSchema } from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  it('validates a correct incident creation payload', () => {
    const result = createIncidentSchema.safeParse({
      title: 'Test Error',
      message: 'Something went wrong',
      module: 'procedure',
      route: '/procedures/test',
      severity: 'HIGH',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid module values', () => {
    const result = createIncidentSchema.safeParse({
      title: 'Test',
      message: 'Error',
      module: 'invalid',
      route: '/test',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = createIncidentSchema.safeParse({
      title: 'Test',
    });

    expect(result.success).toBe(false);
  });

  it('validates update schema', () => {
    const result = updateIncidentSchema.safeParse({
      status: 'RESOLVED',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid status in update', () => {
    const result = updateIncidentSchema.safeParse({
      status: 'INVALID',
    });

    expect(result.success).toBe(false);
  });
});
