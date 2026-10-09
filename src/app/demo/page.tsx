'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowRight,
} from 'lucide-react';


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
      id: 'step1-trigger',
      title: '1. Trigger Failure',
      description: 'Simulate an error in the procedure route.',
      status: 'pending',
      link: '/procedures/payment-processing',
    },
    {
      id: 'step2-boundary',
      title: '2. Error Boundary',
      description: 'The Next.js error boundary catches the unhandled exception.',
      status: 'pending',
    },
    {
      id: 'step3-capture',
      title: '3. captureException()',
      description: 'The centralized utility calls Sentry.captureException().',
      status: 'pending',
    },
    {
      id: 'step4-context',
      title: '4. Context & Correlation',
      description: 'Tags, Environment, Release, and Correlation ID are attached.',
      status: 'pending',
    },
    {
      id: 'step5-open',
      title: '5. Open Incident',
      description: 'View the created incident in the application dashboard.',
      status: 'pending',
      link: '/incidents',
    },
    {
      id: 'step6-stacktrace',
      title: '6. Sentry Stack Trace',
      description: 'Open the event in Sentry and verify source-mapped stack traces.',
      status: 'pending',
    },
    {
      id: 'step7-embed',
      title: '7. Embed Widget',
      description: 'Simulate an error in the Embed Widget boundary for parity.',
      status: 'pending',
      link: '/embed',
    },
  ]);

  const toggleStep = useCallback((id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'success' ? 'pending' : 'success' } : s))
    );
  }, []);

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
                    : 'var(--border-default)'
                }`,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Step number / status */}
                <div className="shrink-0 cursor-pointer" style={{ marginTop: '2px' }} onClick={() => toggleStep(step.id)}>
                  {step.status === 'success' ? (
                    <CheckCircle size={18} style={{ color: 'var(--green)' }} />
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium hover:bg-opacity-80 transition-colors"
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

                  <p className="text-xs" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {step.description}
                  </p>

                  <div className="flex items-center gap-3">
                    {step.status !== 'success' && (
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                    {step.link && (
                      <Link href={step.link} target="_blank" className="btn btn-secondary btn-sm">
                        Navigate <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
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
