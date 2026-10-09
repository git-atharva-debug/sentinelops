// ===========================================
// Test: Embed Error Boundary
// ===========================================
// Verifies that the embed error boundary:
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
    mockReportApplicationError: vi.fn().mockReturnValue('mock-event-id-456'),
    mockGenerateCorrelationId: vi.fn().mockReturnValue('INC-2026-MOCK-456'),
  };
});

vi.mock('@/lib/error-reporting', () => ({
  reportApplicationError: mockReportApplicationError,
  generateCorrelationId: mockGenerateCorrelationId,
}));

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ success: true }),
});

import EmbedError from '@/app/embed/error';

describe('Embed Error Boundary', () => {
  const testError = new Error('Simulated embed application failure');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fallback UI with error message', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(screen.getByText('Embedded Application Crashed')).toBeInTheDocument();
    expect(
      screen.getByText(/Simulated embed application failure/)
    ).toBeInTheDocument();
  });

  it('displays the embed boundary type badge', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(screen.getByText('Embed Boundary')).toBeInTheDocument();
  });

  it('calls centralized reportApplicationError with correct context and error object', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(mockReportApplicationError).toHaveBeenCalledWith(
      testError,
      expect.objectContaining({
        boundary: 'embed',
        route: 'embed',
        module: 'embed-application',
        correlationId: 'INC-2026-MOCK-456',
        severity: 'error'
      })
    );
  });

  it('shows reload and back buttons', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(screen.getByText('Reload Widget')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('shows hardening badge', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(screen.getByText(/HARDENED/)).toBeInTheDocument();
  });

  it('prevents duplicate Sentry reports on re-render', () => {
    const { rerender } = render(
      <EmbedError error={testError} reset={() => {}} />
    );

    rerender(<EmbedError error={testError} reset={() => {}} />);

    expect(mockReportApplicationError).toHaveBeenCalledTimes(1);
  });

  it('shows Sentry status indicator', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(screen.getByText('Reported to Sentry')).toBeInTheDocument();
  });
});
