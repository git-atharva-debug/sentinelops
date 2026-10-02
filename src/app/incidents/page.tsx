'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, Search } from 'lucide-react';
import { StatusBadge, SeverityBadge, EmptyState } from '@/components/ui/badges';
import { showToast } from '@/components/ui/toast';
import type { Incident } from '@/lib/types';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterModule, setFilterModule] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterModule) params.set('module', filterModule);
      if (filterStatus) params.set('status', filterStatus);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setIncidents(data.data.incidents);
        setTotal(data.data.total);
      }
    } catch {
      showToast('Failed to fetch incidents', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterModule, filterStatus]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const selectStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '12px',
    outline: 'none',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Incidents</h1>
          <p className="page-subtitle">
            Track and investigate application failures.
            {total > 0 && <span> {total} total.</span>}
          </p>
        </div>
        <button onClick={fetchIncidents} className="btn btn-secondary btn-sm">
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
        <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} style={selectStyle}>
          <option value="">All Modules</option>
          <option value="procedure">Procedure</option>
          <option value="embed">Embed</option>
          <option value="api">API</option>
          <option value="system">System</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '56px' }} />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <EmptyState
          title="No incidents found"
          message="No incidents match your current filters. Use the dashboard to create demo incidents."
          icon={<Search size={20} style={{ color: 'var(--text-muted)' }} />}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Sentry</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {incident.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                        {incident.module} · {incident.route}
                      </p>
                    </div>
                  </td>
                  <td>
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td>
                    <StatusBadge status={incident.status} />
                  </td>
                  <td>
                    {incident.sentryEventId ? (
                      <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>Sent</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--yellow)' }}>Pending</span>
                    )}
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(incident.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="text-xs font-medium"
                      style={{ color: 'var(--blue)' }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
