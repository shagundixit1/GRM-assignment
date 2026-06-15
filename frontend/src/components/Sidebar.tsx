'use client';

import { useRouter } from 'next/navigation';

interface SidebarProps {
  active: 'dashboard' | 'campaigns';
}

const CRM_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
const CHANNEL_URL = process.env.NEXT_PUBLIC_CHANNEL_URL || '';

export default function Sidebar({ active }: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="sidebar-logo-icon">✦</div>
          <div>
            <div className="sidebar-logo-text">Mini CRM</div>
            <div className="sidebar-logo-sub">AI Marketing</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>

        <button
          className={`sidebar-link ${active === 'dashboard' ? 'active' : ''}`}
          onClick={() => router.push('/')}
        >
          <span className="sidebar-link-icon">⊞</span>
          Dashboard
        </button>

        <button
          className={`sidebar-link ${active === 'campaigns' ? 'active' : ''}`}
          onClick={() => router.push('/campaigns')}
        >
          <span className="sidebar-link-icon">📡</span>
          Campaigns
        </button>

        <div className="sidebar-section-label">Services</div>

        {CRM_URL && (
          <a
            href={`${CRM_URL}/health`}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <span className="sidebar-link-icon" style={{ color: 'var(--green)' }}>
              ●
            </span>
            CRM Backend
          </a>
        )}

        {CHANNEL_URL && (
          <a
            href={`${CHANNEL_URL}/health`}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <span className="sidebar-link-icon" style={{ color: 'var(--blue)' }}>
              ●
            </span>
            Channel Service
          </a>
        )}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 2 }}>Event-driven architecture</div>
          <div>AI message generation</div>
        </div>
      </div>
    </aside>
  );
}