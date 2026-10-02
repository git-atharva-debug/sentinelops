'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { procedures } from '@/lib/data/procedures';

export default function ProceduresPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="page-title">Procedures</h1>
        <p className="page-subtitle">Monitor and test application procedures.</p>
      </div>

      {/* Procedure List */}
      <div className="card" style={{ padding: 0 }}>
        {procedures.map((proc, i) => (
          <Link
            key={proc.slug}
            href={`/procedures/${proc.slug}`}
            className="flex items-center justify-between group"
            style={{
              padding: '20px 24px',
              borderBottom: i < procedures.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              textDecoration: 'none',
              transition: 'background 120ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="shrink-0">
                {proc.status === 'active' ? (
                  <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                ) : (
                  <Clock size={16} style={{ color: 'var(--yellow)' }} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {proc.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  {proc.category} · {proc.successRate}% success · {proc.executionCount.toLocaleString()} runs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className="text-xs capitalize"
                style={{ color: proc.status === 'active' ? 'var(--green)' : 'var(--yellow)' }}
              >
                {proc.status === 'active' ? 'Operational' : proc.status}
              </span>
              <ArrowRight
                size={14}
                style={{ color: 'var(--text-muted)', opacity: 0, transition: 'opacity 120ms' }}
                className="group-hover:opacity-100"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
