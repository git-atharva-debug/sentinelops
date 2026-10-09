// ===========================================
// Test: Procedure Error Boundary
// ===========================================
// Verifies that the procedure error boundary:
// 1. Renders fallback UI on error
// 2. Calls Sentry.captureException with the error
// 3. Sends correct tags (error_boundary, route_type)
// ===========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import React from 'react';

// Mock centralized error reporting
const { mockReportApplicationError, mockGenerateCorrelationId } = vi.hoisted(() => {
  return {
    mockReportApplicationError: vi.fn().mockReturnValue('mock-event-id-123'),
    mockGenerateCorrelationId: vi.fn().mockReturnValue('INC-2026-MOCK-123'),
  };
});

vi.mock('@/lib/error-reporting', () => ({
  reportApplicationError: mockReportApplicationError,
  generateCorrelationId: mockGenerateCorrelationId,
}));

// Mock fetch for incident creation
global.fetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ success: true }),
});

// Import after mocks
import ProcedureError from '@/app/procedures/[slug]/error';

describe('Procedure Error Boundary', () => {
  const testError = new Error('Simulated procedure execution failure in payment-processing');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fallback UI with error message', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(screen.getByText('Procedure Execution Failed')).toBeInTheDocument();
    expect(
      screen.getByText(/Simulated procedure execution failure/)
    ).toBeInTheDocument();
  });

  it('displays the error boundary type badge', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(screen.getByText('Procedure Boundary')).toBeInTheDocument();
  });

  it('calls centralized reportApplicationError with correct context and error object', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(mockReportApplicationError).toHaveBeenCalledWith(
      testError,
      expect.objectContaining({
        boundary: 'procedure',
        route: 'procedure',
        module: 'procedure-processing',
        correlationId: 'INC-2026-MOCK-123',
        severity: 'error'
      })
    );
  });

  it('shows retry and back buttons', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(screen.getByText('Retry Procedure')).toBeInTheDocument();
    expect(screen.getByText('Back to Procedures')).toBeInTheDocument();
  });

  it('shows hardening badge', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(
      screen.getByText(/HARDENED/)
    ).toBeInTheDocument();
  });

  it('prevents duplicate Sentry reports on re-render', () => {
    const { rerender } = render(
      <ProcedureError error={testError} reset={() => {}} />
    );

    // Re-render should not cause another report call
    rerender(<ProcedureError error={testError} reset={() => {}} />);

    // reportApplicationError should have been called exactly once
    expect(mockReportApplicationError).toHaveBeenCalledTimes(1);
  });

  it('shows Sentry status indicator', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(screen.getByText('Reported to Sentry')).toBeInTheDocument();
  });
});
