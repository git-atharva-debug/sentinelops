'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Settings,
  Code,
  Eye,
  Shield,
  Play,
  Activity,
} from 'lucide-react';

const navSections = [
  {
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
    ],
  },
  {
    label: 'Services',
    items: [
      { href: '/procedures', label: 'Procedures', icon: Settings },
      { href: '/embed', label: 'Embed', icon: Code },
    ],
  },
  {
    label: 'Observability',
    items: [
      { href: '/observability', label: 'Error Pipeline', icon: Eye },
      { href: '/hardening', label: 'Hardening', icon: Shield },
    ],
  },
  {
    label: 'Demo',
    items: [
      { href: '/demo', label: 'Demo Center', icon: Play },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/health', label: 'Health', icon: Activity },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="h-full flex flex-col shrink-0"
      style={{
        width: '232px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-default)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: '56px', borderBottom: '1px solid var(--border-default)' }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'var(--blue)' }}
        >
          <Shield size={14} color="white" />
        </div>
        <div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            SentinelOps
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="sidebar-section-label">{section.label}</div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Error Monitoring v1.0
        </span>
      </div>
    </aside>
  );
}
