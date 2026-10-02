// ===========================================
// GET /api/incidents - List incidents
// POST /api/incidents - Create incident
// ===========================================

import { NextRequest } from 'next/server';
import { IncidentService } from '@/lib/services/incident-service';
import { createIncidentSchema } from '@/lib/validation/schemas';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || undefined;
    const status = searchParams.get('status') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const result = await IncidentService.findAll({ module, status, severity, limit, offset });
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createIncidentSchema.parse(body);
    const incident = await IncidentService.create(validated);
    return successResponse(incident, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
