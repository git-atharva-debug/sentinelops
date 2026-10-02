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

// Mock Sentry
const { mockCaptureException, mockWithScope, mockSetTag, mockSetContext, mockSetLevel } = vi.hoisted(() => {
  const setTag = vi.fn();
  const setContext = vi.fn();
  const setLevel = vi.fn();
  return {
    mockCaptureException: vi.fn().mockReturnValue('mock-event-id-123'),
    mockWithScope: vi.fn((callback: (scope: unknown) => void) => {
      callback({
        setTag,
        setContext,
        setLevel,
      });
    }),
    mockSetTag: setTag,
    mockSetContext: setContext,
    mockSetLevel: setLevel,
  };
});

vi.mock('@sentry/nextjs', () => ({
  captureException: mockCaptureException,
  withScope: mockWithScope,
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

  it('calls Sentry.captureException with the error object', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(mockWithScope).toHaveBeenCalled();
    expect(mockCaptureException).toHaveBeenCalledWith(testError);
  });

  it('sets error_boundary tag to "procedure"', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(mockSetTag).toHaveBeenCalledWith('error_boundary', 'procedure');
  });

  it('sets route_type tag to "procedure"', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(mockSetTag).toHaveBeenCalledWith('route_type', 'procedure');
  });

  it('sets module tag to "procedure-processing"', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(mockSetTag).toHaveBeenCalledWith('module', 'procedure-processing');
  });

  it('sets error level to "error"', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(mockSetLevel).toHaveBeenCalledWith('error');
  });

  it('sets application context', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(mockSetContext).toHaveBeenCalledWith(
      'application',
      expect.objectContaining({
        name: 'SentinelOps',
        module: 'procedure-processing',
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

    // Re-render should not cause another captureException call
    rerender(<ProcedureError error={testError} reset={() => {}} />);

    // captureException should have been called exactly once
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });

  it('shows Sentry status indicator', () => {
    render(<ProcedureError error={testError} reset={() => {}} />);

    expect(screen.getByText('Reported to Sentry')).toBeInTheDocument();
  });
});
