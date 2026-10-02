import Link from 'next/link';
import {
  XCircle,
  CheckCircle,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

export default function HardeningPage() {
  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="page-title">Error Boundary Hardening</h1>
        <p className="page-subtitle">Making route-level failures observable.</p>
      </div>

      {/* Problem Statement */}
      <section style={{ marginBottom: '48px' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Two Next.js error boundary files —{' '}
          <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--cyan)' }}>
            procedures/[slug]/error.tsx
          </code>{' '}
          and{' '}
          <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--cyan)' }}>
            embed/error.tsx
          </code>{' '}
          — handled errors but <strong style={{ color: 'var(--red)' }}>silently dropped them</strong> because they did not call{' '}
          <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--yellow)' }}>
            Sentry.captureException()
          </code>.
          Crashes in these routes were invisible to monitoring.
        </p>
      </section>

      {/* Before vs After */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* BEFORE */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '20px' }}>
              <XCircle size={16} style={{ color: 'var(--red)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--red)' }}>Before</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { text: 'Error occurs', ok: true },
                { text: 'Boundary catches error', ok: true },
                { text: 'Fallback UI displayed', ok: true },
                { text: 'No captureException()', ok: false },
                { text: 'Error silently dropped', ok: false },
                { text: 'Invisible to monitoring', ok: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.ok ? (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                  ) : (
                    <XCircle size={12} style={{ color: 'var(--red)' }} />
                  )}
                  <span
                    className="text-sm"
                    style={{ color: item.ok ? 'var(--text-muted)' : 'var(--red)' }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ color: 'var(--green)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--green)' }}>After</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Error occurs',
                'Boundary catches error',
                'Fallback UI displayed',
                'Sentry.captureException()',
                'Structured context attached',
                'Sentry event received',
                'Incident created',
                'Developer investigates',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={12} style={{ color: 'var(--green)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Implementation */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Implementation</h2>
        <pre
          className="text-xs font-mono"
          style={{
            padding: '16px 20px',
            background: 'var(--bg-inset)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            overflow: 'auto',
            border: '1px solid var(--border-default)',
          }}
        >{`Sentry.withScope((scope) => {
  scope.setTag('error_boundary', 'procedure');
  scope.setTag('route_type', 'procedure');
  scope.setTag('module', 'procedure-processing');
  scope.setLevel('error');
  Sentry.captureException(error);
});`}</pre>
      </section>

      <hr className="divider" />

      {/* Verification */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Verification</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Procedure boundary tested',
            'Embed boundary tested',
            'Sentry events verified',
            'Automated tests passing',
            'Production build passing',
          ].map((text) => (
            <div key={text} className="flex items-center gap-3">
              <CheckCircle size={14} style={{ color: 'var(--green)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Link href="/demo" className="btn btn-primary btn-sm">
          Try the Demo
          <ArrowRight size={13} />
        </Link>
        <Link href="/observability" className="btn btn-secondary btn-sm">
          View Pipeline
        </Link>
      </div>
    </div>
  );
}
