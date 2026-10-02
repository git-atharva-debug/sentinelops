// ===========================================
// SentinelOps - API Response Utilities
// ===========================================

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data } as ApiResponse<T>, { status });
}

export function errorResponse(
  message: string,
  code: string,
  status = 500,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: { message, code, ...(details ? { details } : {}) },
    } as ApiResponse<never>,
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof ZodError) {
    return errorResponse(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      error.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  if (error instanceof Error) {
    console.error('[SentinelOps API Error]', error.message);
    return errorResponse(error.message, 'INTERNAL_ERROR', 500);
  }

  console.error('[SentinelOps API Error] Unknown error', error);
  return errorResponse('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}
