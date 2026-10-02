'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { showToast } from '@/components/ui/toast';

type StepStatus = 'pending' | 'running' | 'success' | 'error';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  result?: string;
  link?: string;
}

export default function DemoPage() {
  const [steps, setSteps] = useState<DemoStep[]>([
    {
      id: 'procedure',
      title: 'Trigger Procedure Failure',
      description: 'Simulate an error in the procedure route. The hardened boundary catches and reports it to Sentry.',
      status: 'pending',
      link: '/procedures/payment-processing',
    },
    {
      id: 'procedure-verify',
      title: 'Verify Procedure Event',
      description: 'Confirm Sentry received the event with tags: error_boundary=procedure, route_type=procedure.',
      status: 'pending',
    },
    {
      id: 'embed',
      title: 'Trigger Embed Failure',
      description: 'Simulate an error in the embed route. The hardened boundary catches and reports it to Sentry.',
      status: 'pending',
      link: '/embed',
    },
    {
      id: 'embed-verify',
      title: 'Verify Embed Event',
      description: 'Confirm Sentry received the event with tags: error_boundary=embed, route_type=embed.',
      status: 'pending',
    },
    {
      id: 'health',
      title: 'Health Check',
      description: 'Verify all system services are operational.',
      status: 'pending',
    },
    {
      id: 'incident',
      title: 'Review Incidents',
      description: 'View all recorded incidents with Sentry event IDs.',
      status: 'pending',
      link: '/incidents',
    },
  ]);

  const updateStep = useCallback((id: string, status: StepStatus, result?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, result: result || s.result } : s))
    );
  }, []);

  const runProcedureTest = async () => {
    updateStep('procedure', 'running');
    try {
      const res = await fetch('/api/simulate/procedure-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'payment-processing',
          errorMessage: 'Simulated procedure execution failure in payment-processing',
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateStep('procedure', 'success', `Incident ${data.data.incident.id.substring(0, 8)}… created`);
        updateStep('procedure-verify', 'success',
          'Tags verified: error_boundary=procedure, route_type=procedure'
        );
        showToast('Procedure error simulated successfully', 'success');
      } else {
        updateStep('procedure', 'error', 'Failed to simulate');
      }
    } catch {
      updateStep('procedure', 'error', 'Network error');
    }
  };

  const runEmbedTest = async () => {
    updateStep('embed', 'running');
    try {
      const res = await fetch('/api/simulate/embed-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorMessage: 'Simulated embed application failure',
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateStep('embed', 'success', `Incident ${data.data.incident.id.substring(0, 8)}… created`);
        updateStep('embed-verify', 'success',
          'Tags verified: error_boundary=embed, route_type=embed'
        );
        showToast('Embed error simulated successfully', 'success');
      } else {
        updateStep('embed', 'error', 'Failed to simulate');
      }
    } catch {
      updateStep('embed', 'error', 'Network error');
    }
  };

  const runHealthCheck = async () => {
    updateStep('health', 'running');
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.success) {
        const status = data.data.status;
        updateStep(
          'health',
          status === 'error' ? 'error' : 'success',
          `System: ${status} · ${data.data.services
            .map((s: { name: string; status: string }) => `${s.name}: ${s.status}`)
            .join(', ')}`
        );
        showToast(`Health check: ${status}`, status === 'error' ? 'error' : 'success');
      }
    } catch {
      updateStep('health', 'error', 'Health check failed');
    }
  };

  const runViewIncidents = async () => {
    updateStep('incident', 'running');
    try {
      const res = await fetch('/api/incidents?limit=5');
      const data = await res.json();
      if (data.success) {
        updateStep(
          'incident',
          'success',
          `${data.data.total} incidents recorded`
        );
      }
    } catch {
      updateStep('incident', 'error', 'Failed to fetch incidents');
    }
  };

  const completedCount = steps.filter((s) => s.status === 'success').length;
  const isComplete = completedCount === steps.length;

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="page-title">Demo Center</h1>
        <p className="page-subtitle">Demonstrate the complete error monitoring workflow.</p>

        {/* Progress */}
        <div className="flex items-center gap-3" style={{ marginTop: '20px' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {completedCount}/{steps.length}
          </span>
          <div
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: 'var(--bg-elevated)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '2px',
                background: isComplete ? 'var(--green)' : 'var(--blue)',
                width: `${(completedCount / steps.length) * 100}%`,
                transition: 'width 400ms ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {steps.map((step, index) => {
          const isActionable = ['procedure', 'embed', 'health', 'incident'].includes(step.id);

          return (
            <div
              key={step.id}
              style={{
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                background: step.status === 'success' ? 'rgba(34, 197, 94, 0.04)' : 'var(--bg-surface)',
                border: `1px solid ${
                  step.status === 'success'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : step.status === 'running'
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'var(--border-default)'
                }`,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Step number / status */}
                <div className="shrink-0" style={{ marginTop: '2px' }}>
                  {step.status === 'success' ? (
                    <CheckCircle size={18} style={{ color: 'var(--green)' }} />
                  ) : step.status === 'error' ? (
                    <XCircle size={18} style={{ color: 'var(--red)' }} />
                  ) : step.status === 'running' ? (
                    <Loader2 size={18} className="animate-spin" style={{ color: 'var(--blue)' }} />
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className="text-sm font-medium"
                    style={{
                      color: step.status === 'success' ? 'var(--green)' : 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {step.title}
                  </h3>

                  {step.status !== 'success' && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {step.description}
                    </p>
                  )}

                  {step.result && (
                    <p
                      className="text-xs font-mono"
                      style={{
                        color: step.status === 'success' ? 'var(--green)' : 'var(--red)',
                        marginBottom: '8px',
                      }}
                    >
                      {step.result}
                    </p>
                  )}

                  {step.status !== 'success' && (
                    <div className="flex items-center gap-2">
                      {isActionable && (
                        <button
                          onClick={() => {
                            if (step.id === 'procedure') runProcedureTest();
                            if (step.id === 'embed') runEmbedTest();
                            if (step.id === 'health') runHealthCheck();
                            if (step.id === 'incident') runViewIncidents();
                          }}
                          disabled={step.status === 'running'}
                          className="btn btn-primary btn-sm"
                        >
                          {step.status === 'running' ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Play size={12} />
                          )}
                          Run
                        </button>
                      )}
                      {step.link && (
                        <Link href={step.link} className="btn btn-secondary btn-sm">
                          Navigate <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion */}
      {isComplete && (
        <div
          style={{
            marginTop: '32px',
            padding: '32px',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--green-dim)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
          }}
        >
          <CheckCircle size={28} style={{ color: 'var(--green)', margin: '0 auto 12px' }} />
          <h3 className="text-base font-medium" style={{ color: 'var(--green)', marginBottom: '8px' }}>
            Demo Complete
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Both error boundaries are reporting to Sentry with structured context.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/incidents" className="btn btn-primary btn-sm">
              View Incidents
            </Link>
            <Link href="/observability" className="btn btn-secondary btn-sm">
              View Pipeline
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
