export function StatusBadge({ status }: { status: string }) {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`badge badge-${statusClass}`}>{status.toLowerCase()}</span>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const severityClass = severity.toLowerCase();
  return <span className={`badge badge-${severityClass}`}>{severity.toLowerCase()}</span>;
}

export function ModuleBadge({ module }: { module: string }) {
  const colorMap: Record<string, string> = {
    procedure: 'badge-purple',
    embed: 'badge-info',
    api: 'badge-low',
    system: 'badge-medium',
  };
  return <span className={`badge ${colorMap[module] || 'badge-low'}`}>{module}</span>;
}

export function HealthDot({ status }: { status: 'healthy' | 'warning' | 'error' }) {
  const colorMap = {
    healthy: 'var(--green)',
    warning: 'var(--yellow)',
    error: 'var(--red)',
  };

  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: colorMap[status] }}
    />
  );
}

export function SkeletonLine({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <div className="skeleton" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <SkeletonLine width="40%" height="0.75rem" />
      <SkeletonLine width="60%" height="1.25rem" />
      <SkeletonLine width="80%" height="0.75rem" />
    </div>
  );
}

export function EmptyState({ title, message, icon }: { title: string; message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: '360px' }}>
        {message}
      </p>
    </div>
  );
}
