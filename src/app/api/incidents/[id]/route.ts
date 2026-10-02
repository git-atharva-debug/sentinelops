// ===========================================
// GET /api/incidents/[id] - Get incident
// PATCH /api/incidents/[id] - Update incident
// ===========================================

import { NextRequest } from 'next/server';
import { IncidentService } from '@/lib/services/incident-service';
import { updateIncidentSchema } from '@/lib/validation/schemas';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await IncidentService.findById(id);

    if (!incident) {
      return errorResponse('Incident not found', 'NOT_FOUND', 404);
    }

    return successResponse(incident);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateIncidentSchema.parse(body);

    const existing = await IncidentService.findById(id);
    if (!existing) {
      return errorResponse('Incident not found', 'NOT_FOUND', 404);
    }

    const incident = await IncidentService.update(id, validated);
    return successResponse(incident);
  } catch (error) {
    return handleApiError(error);
  }
}
