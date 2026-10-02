'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  AlertTriangle,
  CheckCircle,
  Shield,
  Settings,
} from 'lucide-react';
import { getProcedureBySlug } from '@/lib/data/procedures';

export default function ProcedureDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const procedure = getProcedureBySlug(slug);
  const [shouldError, setShouldError] = useState(false);

  // When shouldError is true, throw to trigger the error boundary
  if (shouldError) {
    throw new Error(`Simulated procedure execution failure in ${slug}`);
  }

  if (!procedure) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Settings size={32} style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-base font-medium mt-4" style={{ color: 'var(--text-primary)' }}>
          Procedure Not Found
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          No procedure found with slug: {slug}
        </p>
        <Link href="/procedures" className="btn btn-primary btn-sm mt-4">
          Back to Procedures
        </Link>
      </div>
    );
  }

  const executionHistory = [
    { id: 1, status: 'success', duration: '2.3s', timestamp: new Date(Date.now() - 3600000).toLocaleString() },
    { id: 2, status: 'success', duration: '1.8s', timestamp: new Date(Date.now() - 7200000).toLocaleString() },
    { id: 3, status: 'success', duration: '3.1s', timestamp: new Date(Date.now() - 10800000).toLocaleString() },
    { id: 4, status: 'failed', duration: '0.5s', timestamp: new Date(Date.now() - 14400000).toLocaleString() },
    { id: 5, status: 'success', duration: '2.0s', timestamp: new Date(Date.now() - 18000000).toLocaleString() },
  ];

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Back */}
      <Link
        href="/procedures"
        className="inline-flex items-center gap-2 text-xs font-medium"
        style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', display: 'inline-flex' }}
      >
        <ArrowLeft size={14} />
        Procedures
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '4px' }}>
          <h1 className="page-title">{procedure.name}</h1>
          <span
            className="text-xs font-medium"
            style={{ color: procedure.status === 'active' ? 'var(--green)' : 'var(--yellow)' }}
          >
            {procedure.status === 'active' ? 'Operational' : procedure.status}
          </span>
        </div>
        <p className="page-subtitle" style={{ marginTop: '4px' }}>{procedure.description}</p>
      </div>

      {/* Details */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <span className="label">Executions</span>
            <p className="text-sm font-medium" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
              {procedure.executionCount.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="label">Success Rate</span>
            <p className="text-sm font-medium" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
              {procedure.successRate}%
            </p>
          </div>
          <div>
            <span className="label">Last Run</span>
            <p className="text-sm font-medium" style={{ marginTop: '4px', color: 'var(--text-primary)' }}>
              {new Date(procedure.lastExecution).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Actions */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Actions</h2>
        <button className="btn btn-primary">
          <Play size={14} />
          Run Procedure
        </button>
      </section>

      <hr className="divider" />

      {/* Error Boundary Testing */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="section-title" style={{ marginBottom: '8px' }}>Error Boundary Testing</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          This intentionally triggers the procedure error boundary and reports the exception to Sentry.
        </p>
        <div className="flex items-center gap-4" style={{ marginBottom: '16px' }}>
          <div className="flex items-center gap-2">
            <Shield size={14} style={{ color: 'var(--green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Boundary: procedure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} style={{ color: 'var(--green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sentry: Hardened</span>
          </div>
        </div>
        <button
          onClick={() => setShouldError(true)}
          className="btn btn-danger btn-sm"
        >
          <AlertTriangle size={13} />
          Simulate Failure
        </button>
      </section>

      <hr className="divider" />

      {/* Recent Executions */}
      <section>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Recent Executions</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {executionHistory.map((exec) => (
                <tr key={exec.id}>
                  <td className="font-mono text-xs">{exec.id}</td>
                  <td>
                    <span
                      className="text-xs font-medium"
                      style={{ color: exec.status === 'success' ? 'var(--green)' : 'var(--red)' }}
                    >
                      {exec.status}
                    </span>
                  </td>
                  <td className="text-sm">{exec.duration}</td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{exec.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
