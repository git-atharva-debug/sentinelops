// ===========================================
// POST /api/simulate/embed-error
// Simulate an embed error and create incident
// ===========================================

import { NextRequest } from 'next/server';
import { IncidentService } from '@/lib/services/incident-service';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const errorMessage = body.errorMessage || 'Simulated embed application failure';
    const sentryEventId = body.sentryEventId || undefined;
    const correlationId = body.correlationId || undefined;

    const incident = await IncidentService.create({
      title: 'Embed Application Failure',
      message: errorMessage,
      module: 'embed',
      route: '/embed',
      severity: 'HIGH',
      status: 'OPEN',
      errorBoundary: 'embed',
      sentryEventId,
      metadata: {
        simulatedAt: new Date().toISOString(),
        boundaryType: 'embed',
        isSimulated: true,
        widgetVersion: '2.4.1',
        correlationId,
      },
    });

    return successResponse({
      incident,
      message: 'Embed error simulated and incident created',
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
