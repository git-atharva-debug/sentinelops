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

// Mock Sentry
const { mockCaptureException, mockWithScope, mockSetTag, mockSetContext, mockSetLevel } = vi.hoisted(() => {
  const setTag = vi.fn();
  const setContext = vi.fn();
  const setLevel = vi.fn();
  return {
    mockCaptureException: vi.fn().mockReturnValue('mock-event-id-456'),
    mockWithScope: vi.fn((callback: (scope: unknown) => void) => {
      callback({
        setTag: setTag,
        setContext: setContext,
        setLevel: setLevel,
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

  it('calls Sentry.captureException with the error object', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(mockWithScope).toHaveBeenCalled();
    expect(mockCaptureException).toHaveBeenCalledWith(testError);
  });

  it('sets error_boundary tag to "embed"', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(mockSetTag).toHaveBeenCalledWith('error_boundary', 'embed');
  });

  it('sets route_type tag to "embed"', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(mockSetTag).toHaveBeenCalledWith('route_type', 'embed');
  });

  it('sets module tag to "embed-application"', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(mockSetTag).toHaveBeenCalledWith('module', 'embed-application');
  });

  it('sets error level to "error"', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(mockSetLevel).toHaveBeenCalledWith('error');
  });

  it('sets application context', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(mockSetContext).toHaveBeenCalledWith(
      'application',
      expect.objectContaining({
        name: 'SentinelOps',
        module: 'embed-application',
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

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });

  it('shows Sentry status indicator', () => {
    render(<EmbedError error={testError} reset={() => {}} />);

    expect(screen.getByText('Reported to Sentry')).toBeInTheDocument();
  });
});
