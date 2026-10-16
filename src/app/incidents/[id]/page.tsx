'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Clock,
  RefreshCw,
  Radio,
  AlertTriangle,
  Eye,
  XCircle,
  Search,
  MessageSquare,
  Plus,
  User,
  Ticket,
  FileText,
  Activity,
  ChevronRight,
  MoreVertical,
  Shield,
  Zap,
  Server,
  Code,
  Settings,
  Database,
  Globe,
  Hash,
  Copy,
  Terminal,
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from '@/components/ui/badges';
import { showToast } from '@/components/ui/toast';
import type { Incident, MetricsResponse } from '@/lib/types';

// ── Helper: human-readable duration ──
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// ── Helper: relative time ──
function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Helper: copy to clipboard ──
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  });
}

// ── Severity color map ──
const severityColor: Record<string, string> = {
  LOW: '#3b82f6',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

// ── Status color map ──
const statusColor: Record<string, string> = {
  OPEN: '#ef4444',
  INVESTIGATING: '#eab308',
  RESOLVED: '#22c55e',
};

// ── Module icon map ──
const moduleIcons: Record<string, React.ReactNode> = {
  procedure: <Settings size={14} />,
  embed: <Code size={14} />,
  api: <Server size={14} />,
  system: <Database size={14} />,
};

// ── Event type icon map ──
const eventTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  CREATED: { icon: <AlertTriangle size={14} />, color: '#ef4444' },
  STATUS_CHANGE: { icon: <RefreshCw size={14} />, color: '#eab308' },
  RESOLVED: { icon: <CheckCircle size={14} />, color: '#22c55e' },
  SENTRY_LINKED: { icon: <Radio size={14} />, color: '#06b6d4' },
  NOTE: { icon: <Eye size={14} />, color: '#71717a' },
};

// ── Service Dependency Node ──
function ServiceNode({
  name,
  x,
  y,
  size,
  status,
  isCenter,
}: {
  name: string;
  x: string;
  y: string;
  size: number;
  status: 'healthy' | 'warning' | 'error';
  isCenter?: boolean;
}) {
  const borderColor = status === 'error' ? '#ef4444' : status === 'warning' ? '#eab308' : '#3f3f46';
  const bgColor = isCenter && status === 'error' ? '#ef4444' : '#27272a';
  const shadow = isCenter && status === 'error' ? '0 0 24px rgba(239,68,68,0.4)' : 'none';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: bgColor,
          borderRadius: isCenter ? '50%' : '8px',
          border: `2px solid ${borderColor}`,
          margin: '0 auto 6px',
          boxShadow: shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {isCenter && status === 'error' && <Zap size={size * 0.4} color="#fff" />}
      </div>
      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>{name}</span>
    </div>
  );
}

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [relatedIncidents, setRelatedIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchIncident = useCallback(async () => {
    try {
      const [incRes, metricsRes, relatedRes] = await Promise.all([
        fetch(`/api/incidents/${id}`),
        fetch('/api/metrics'),
        fetch('/api/incidents?limit=50'),
      ]);

      const incData = await incRes.json();
      const metricsData = await metricsRes.json();
      const relatedData = await relatedRes.json();

      if (incData.success) setIncident(incData.data);
      else showToast('Incident not found', 'error');

      if (metricsData.success) setMetrics(metricsData.data);
      if (relatedData.success) {
        setRelatedIncidents(
          relatedData.data.incidents.filter((i: Incident) => i.id !== id)
        );
      }
    } catch {
      showToast('Failed to fetch incident', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated to ${status}`, 'success');
        fetchIncident();
      }
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // ── Derived data ──
  const metadata = useMemo(
    () => (incident?.metadata ? JSON.parse(incident.metadata) : {}),
    [incident]
  );

  const activeDuration = useMemo(() => {
    if (!incident) return '—';
    const start = new Date(incident.createdAt).getTime();
    const end = incident.resolvedAt
      ? new Date(incident.resolvedAt).getTime()
      : Date.now();
    return formatDuration(end - start);
  }, [incident]);

  // Build service status from real data
  const serviceStatuses = useMemo(() => {
    if (!incident) return {};
    const statuses: Record<string, 'healthy' | 'warning' | 'error'> = {
      'Error Boundary': 'healthy',
      'API Gateway': 'healthy',
      'Sentry': incident.sentryEventId ? 'healthy' : 'warning',
      'Database': 'healthy',
    };
    // The incident's module is the impacted service
    const moduleLabel = incident.module.charAt(0).toUpperCase() + incident.module.slice(1) + ' Service';
    statuses[moduleLabel] = 'error';
    if (incident.errorBoundary) {
      statuses['Error Boundary'] = 'warning';
    }
    return statuses;
  }, [incident]);

  // Related incidents for the same module
  const sameModuleIncidents = useMemo(
    () =>
      relatedIncidents.filter(
        (i) => incident && i.module === incident.module
      ),
    [relatedIncidents, incident]
  );

  // Event counts for alert summary
  const alertSummary = useMemo(() => {
    if (!incident?.events) return [];
    const counts: Record<string, number> = {};
    for (const e of incident.events) {
      counts[e.eventType] = (counts[e.eventType] || 0) + 1;
    }
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [incident]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #27272a',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '13px', color: '#71717a' }}>Loading incident...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <Search size={32} style={{ color: '#71717a' }} />
        <h2 style={{ fontSize: '16px', fontWeight: '500', marginTop: '16px', color: '#fafafa' }}>
          Incident Not Found
        </h2>
        <Link href="/incidents" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Incidents
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'alerts', label: `Alerts (${incident.events?.length || 0})` },
    { key: 'related', label: `Related (${sameModuleIncidents.length})` },
    { key: 'timeline', label: 'Timeline' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Top Header ── */}
      <div style={{ padding: '20px 0 16px', borderBottom: '1px solid #27272a' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: '#71717a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Link href="/incidents" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={12} /> Incidents
          </Link>
          <ChevronRight size={12} />
          <span>Incident #{id.substring(0, 8)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: title + badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '12px', background: '#27272a', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {moduleIcons[incident.module]} {incident.module}
              </span>
              <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '12px', background: `${statusColor[incident.status]}20`, color: statusColor[incident.status] }}>
                {incident.status}
              </span>
              <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '12px', background: `${severityColor[incident.severity]}20`, color: severityColor[incident.severity], display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={10} /> {incident.severity}
              </span>
              {incident.errorBoundary && (
                <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={10} /> {incident.errorBoundary} boundary
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: '#fafafa', lineHeight: '1.3' }}>{incident.title}</h1>
          </div>

          {/* Right: duration box */}
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '24px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: incident.status === 'RESOLVED' ? '#22c55e' : '#fafafa' }}>
              {incident.status === 'RESOLVED' ? 'Resolved' : `Active for ${activeDuration}`}
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
              Triggered {new Date(incident.createdAt).toLocaleDateString()} at {new Date(incident.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left Sidebar ── */}
        <div style={{ width: '260px', borderRight: '1px solid #27272a', padding: '20px 20px 20px 0', overflowY: 'auto', flexShrink: 0 }}>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {incident.status === 'OPEN' && (
              <button
                onClick={() => updateStatus('INVESTIGATING')}
                disabled={updating}
                style={{
                  flex: 1,
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Eye size={14} /> Acknowledge
              </button>
            )}
            {incident.status === 'INVESTIGATING' && (
              <button
                onClick={() => updateStatus('RESOLVED')}
                disabled={updating}
                style={{
                  flex: 1,
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle size={14} /> Resolve
              </button>
            )}
            {incident.status === 'RESOLVED' && (
              <button
                onClick={() => updateStatus('OPEN')}
                disabled={updating}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <XCircle size={14} /> Reopen
              </button>
            )}
          </div>

          {/* Quick Info */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#71717a' }}>Module</div>
                <div style={{ fontSize: '13px', color: '#fafafa', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {moduleIcons[incident.module]} {incident.module}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#71717a' }}>Route</div>
                <div style={{ fontSize: '13px', color: '#fafafa', fontFamily: 'monospace', marginTop: '2px' }}>{incident.route}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#71717a' }}>Error Boundary</div>
                <div style={{ fontSize: '13px', color: '#a855f7', fontFamily: 'monospace', marginTop: '2px' }}>{incident.errorBoundary || '—'}</div>
              </div>
              {metadata.correlationId && (
                <div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>Correlation ID</div>
                  <div
                    style={{ fontSize: '12px', color: '#06b6d4', fontFamily: 'monospace', marginTop: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => copyToClipboard(metadata.correlationId)}
                  >
                    <Hash size={12} /> {metadata.correlationId.substring(0, 16)}...
                    <Copy size={10} style={{ color: '#71717a' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sentry Integration */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Sentry Integration</h3>
            {incident.sentryEventId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#22c55e' }}>
                  <CheckCircle size={14} /> Exception captured
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>Event ID</div>
                  <div
                    style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'monospace', marginTop: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => copyToClipboard(incident.sentryEventId!)}
                  >
                    {incident.sentryEventId.substring(0, 16)}...
                    <Copy size={10} style={{ color: '#71717a' }} />
                  </div>
                </div>
                {process.env.NEXT_PUBLIC_SENTRY_ORG && process.env.NEXT_PUBLIC_SENTRY_PROJECT && (
                  <a
                    href={`https://sentry.io/organizations/${process.env.NEXT_PUBLIC_SENTRY_ORG}/issues/?query=${incident.sentryEventId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={12} /> Open in Sentry
                  </a>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#eab308' }}>
                <Clock size={14} /> Not linked
              </div>
            )}
          </div>

          {/* Resources */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Resources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3b82f6', cursor: 'pointer' }}>
                <Ticket size={14} /> Create Jira Ticket
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3b82f6', cursor: 'pointer' }}>
                <FileText size={14} /> Export Report
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Content Panel ── */}
        <div style={{ flex: 1, padding: '0 0 0 24px', overflowY: 'auto', minWidth: 0 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #27272a', marginBottom: '24px', paddingTop: '4px' }}>
            {tabs.map((tab) => (
              <div
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  paddingBottom: '12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  color: activeTab === tab.key ? '#fafafa' : '#71717a',
                  borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* ── TAB: Overview ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>

              {/* Error Message */}
              <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Error Message</div>
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                  }}
                >
                  {incident.message}
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Events', value: incident.events?.length || 0, color: '#3b82f6' },
                  { label: 'Active Duration', value: activeDuration, color: statusColor[incident.status] },
                  { label: 'Same Module Incidents', value: sameModuleIncidents.length, color: '#a855f7' },
                  { label: 'System Error Rate', value: metrics ? `${metrics.errorRate}%` : '—', color: '#f97316' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>{stat.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Bottom Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Impacted Services */}
                <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa' }}>Impacted Services</h3>
                    <span style={{ fontSize: '12px', color: '#71717a' }}>{Object.keys(serviceStatuses).length} services</span>
                  </div>

                  {/* Node graph */}
                  <div style={{ flex: 1, position: 'relative', minHeight: '240px' }}>
                    {/* SVG connections */}
                    <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                      <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="4 4" />
                      <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="4 4" />
                      <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="4 4" />
                      <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="4 4" />
                    </svg>

                    {/* Center: the impacted module */}
                    <ServiceNode
                      name={incident.module.charAt(0).toUpperCase() + incident.module.slice(1)}
                      x="50%"
                      y="50%"
                      size={56}
                      status="error"
                      isCenter
                    />

                    {/* Surrounding services */}
                    <ServiceNode name="Error Boundary" x="20%" y="25%" size={36} status={serviceStatuses['Error Boundary'] || 'healthy'} />
                    <ServiceNode name="API Gateway" x="80%" y="25%" size={36} status={serviceStatuses['API Gateway'] || 'healthy'} />
                    <ServiceNode name="Sentry" x="20%" y="80%" size={36} status={serviceStatuses['Sentry'] || 'healthy'} />
                    <ServiceNode name="Database" x="80%" y="80%" size={36} status={serviceStatuses['Database'] || 'healthy'} />
                  </div>
                </div>

                {/* Recent Timeline */}
                <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa' }}>Activity Timeline</h3>
                    <span
                      onClick={() => setActiveTab('timeline')}
                      style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer' }}
                    >
                      View All
                    </span>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {incident.events && incident.events.length > 0 ? (
                      incident.events.slice(0, 6).map((event, idx) => {
                        const config = eventTypeConfig[event.eventType] || { icon: <Activity size={14} />, color: '#71717a' };
                        return (
                          <div
                            key={event.id}
                            style={{
                              display: 'flex',
                              gap: '12px',
                              padding: '10px 0',
                              borderBottom: idx < Math.min((incident.events?.length || 0), 6) - 1 ? '1px solid #1f1f23' : 'none',
                            }}
                          >
                            <div style={{ flexShrink: 0, marginTop: '2px', color: config.color }}>{config.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.4' }}>{event.message}</div>
                              <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
                                {timeAgo(event.createdAt)} • {new Date(event.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#71717a', fontSize: '13px' }}>
                        <Clock size={24} style={{ marginBottom: '8px' }} />
                        No events recorded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata (if any) */}
              {Object.keys(metadata).length > 0 && (
                <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa', marginBottom: '12px' }}>Metadata</h3>
                  <pre
                    style={{
                      padding: '12px 16px',
                      background: '#0c0c0e',
                      borderRadius: '6px',
                      color: '#a1a1aa',
                      overflow: 'auto',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      lineHeight: '1.6',
                    }}
                  >
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Alerts ── */}
          {activeTab === 'alerts' && (
            <div style={{ paddingBottom: '32px' }}>
              <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#fafafa' }}>{incident.events?.length || 0} Events</span>
                  <span style={{ fontSize: '12px', color: '#71717a' }}>across {alertSummary.length} event types</span>
                </div>

                {/* Summary badges */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {alertSummary.map(({ type, count }) => {
                    const config = eventTypeConfig[type] || { icon: <Activity size={12} />, color: '#71717a' };
                    return (
                      <span
                        key={type}
                        style={{
                          fontSize: '12px',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          background: `${config.color}20`,
                          color: config.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {config.icon} {type.replace('_', ' ')} ({count})
                      </span>
                    );
                  })}
                </div>

                {/* Events table */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px', gap: '16px', padding: '8px 12px', fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #27272a' }}>
                    <div>Type</div>
                    <div>Message</div>
                    <div>Time</div>
                  </div>
                  {incident.events?.map((event) => {
                    const config = eventTypeConfig[event.eventType] || { icon: <Activity size={14} />, color: '#71717a' };
                    return (
                      <div
                        key={event.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr 120px',
                          gap: '16px',
                          padding: '12px',
                          fontSize: '13px',
                          borderBottom: '1px solid #1f1f23',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ color: config.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {config.icon} {event.eventType.replace('_', ' ')}
                        </div>
                        <div style={{ color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.message}
                        </div>
                        <div style={{ color: '#71717a', fontSize: '12px' }}>
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Related ── */}
          {activeTab === 'related' && (
            <div style={{ paddingBottom: '32px' }}>
              <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fafafa', marginBottom: '16px' }}>
                  Related Incidents in <span style={{ color: '#a855f7' }}>{incident.module}</span>
                </h3>

                {sameModuleIncidents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717a' }}>
                    <CheckCircle size={24} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px' }}>No related incidents found</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {sameModuleIncidents.slice(0, 10).map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/incidents/${rel.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 0',
                          borderBottom: '1px solid #1f1f23',
                          textDecoration: 'none',
                          color: '#fafafa',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rel.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
                            {rel.route} • {timeAgo(rel.createdAt)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: `${severityColor[rel.severity]}20`, color: severityColor[rel.severity] }}>
                            {rel.severity}
                          </span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: `${statusColor[rel.status]}20`, color: statusColor[rel.status] }}>
                            {rel.status}
                          </span>
                          <ChevronRight size={14} style={{ color: '#71717a' }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: Timeline ── */}
          {activeTab === 'timeline' && (
            <div style={{ paddingBottom: '32px' }}>
              <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fafafa', marginBottom: '20px' }}>Full Timeline</h3>

                {incident.events && incident.events.length > 0 ? (
                  <div style={{ position: 'relative', paddingLeft: '28px' }}>
                    {/* Vertical line */}
                    <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: '#27272a' }} />

                    {incident.events.map((event, idx) => {
                      const config = eventTypeConfig[event.eventType] || { icon: <Activity size={14} />, color: '#71717a' };
                      let eventMeta: Record<string, unknown> = {};
                      if (event.metadata) {
                        try { eventMeta = JSON.parse(event.metadata); } catch {}
                      }

                      return (
                        <div key={event.id} style={{ position: 'relative', marginBottom: idx < (incident.events?.length || 0) - 1 ? '24px' : 0 }}>
                          {/* Dot */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '-24px',
                              top: '4px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: config.color,
                              border: '2px solid #18181b',
                              zIndex: 2,
                            }}
                          />

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: config.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {config.icon} {event.eventType.replace('_', ' ')}
                              </span>
                              <span style={{ fontSize: '11px', color: '#71717a' }}>
                                {new Date(event.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.5' }}>{event.message}</div>

                            {/* Show metadata if present */}
                            {Object.keys(eventMeta).length > 0 && (
                              <pre style={{ marginTop: '8px', padding: '8px 12px', background: '#0c0c0e', borderRadius: '4px', fontSize: '11px', color: '#71717a', fontFamily: 'monospace', overflow: 'auto' }}>
                                {JSON.stringify(eventMeta, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717a' }}>
                    <Clock size={24} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px' }}>No timeline events</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Quick-Access Bar ── */}
      <div style={{ borderTop: '1px solid #27272a', padding: '10px 0', display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
        <div
          onClick={() => copyToClipboard(incident.id)}
          style={{ background: '#18181b', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', cursor: 'pointer', border: '1px solid #27272a', whiteSpace: 'nowrap' }}
        >
          <Hash size={12} /> ID: {incident.id.substring(0, 12)}...
        </div>
        <div style={{ background: '#18181b', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', border: '1px solid #27272a', whiteSpace: 'nowrap' }}>
          <Globe size={12} /> Route: {incident.route}
        </div>
        {incident.sentryEventId && (
          <div
            onClick={() => copyToClipboard(incident.sentryEventId!)}
            style={{ background: '#18181b', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', cursor: 'pointer', border: '1px solid #27272a', whiteSpace: 'nowrap' }}
          >
            <Radio size={12} /> Sentry: {incident.sentryEventId.substring(0, 16)}...
          </div>
        )}
        {metadata.correlationId && (
          <div
            onClick={() => copyToClipboard(metadata.correlationId)}
            style={{ background: '#18181b', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', cursor: 'pointer', border: '1px solid #27272a', whiteSpace: 'nowrap' }}
          >
            <Terminal size={12} /> Trace: {metadata.correlationId.substring(0, 16)}...
          </div>
        )}
        <div style={{ background: '#18181b', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', border: '1px solid #27272a', whiteSpace: 'nowrap' }}>
          <Clock size={12} /> Created: {new Date(incident.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
