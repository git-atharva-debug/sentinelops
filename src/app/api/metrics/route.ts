// ===========================================
// GET /api/metrics - Incident metrics
// ===========================================

import { IncidentService } from '@/lib/services/incident-service';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET() {
  try {
    const metrics = await IncidentService.getMetrics();
    return successResponse(metrics);
  } catch (error) {
    return handleApiError(error);
  }
}
