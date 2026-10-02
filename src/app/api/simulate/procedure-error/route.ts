// ===========================================
// POST /api/simulate/procedure-error
// Simulate a procedure error and create incident
// ===========================================

import { NextRequest } from 'next/server';
import { IncidentService } from '@/lib/services/incident-service';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = body.slug || 'unknown-procedure';
    const errorMessage = body.errorMessage || `Simulated procedure execution failure in ${slug}`;
    const sentryEventId = body.sentryEventId || undefined;

    const incident = await IncidentService.create({
      title: `Procedure Failure: ${slug}`,
      message: errorMessage,
      module: 'procedure',
      route: `/procedures/${slug}`,
      severity: 'HIGH',
      status: 'OPEN',
      errorBoundary: 'procedure',
      sentryEventId,
      metadata: {
        simulatedAt: new Date().toISOString(),
        procedureSlug: slug,
        boundaryType: 'procedure',
        isSimulated: true,
      },
    });

    return successResponse({
      incident,
      message: 'Procedure error simulated and incident created',
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
