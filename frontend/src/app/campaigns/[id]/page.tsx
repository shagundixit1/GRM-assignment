'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign, Communication } from '@/types';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [comms, setComms] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await api.getCampaign(id);
      setCampaign(data.campaign);
      setComms(data.communications);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="layout">
        <Sidebar active="campaigns" />
        <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="layout">
        <Sidebar active="campaigns" />
        <main className="main">
          <div className="empty-state">
            <div className="empty-state-icon">❓</div>
            <p className="empty-state-text">Campaign not found</p>
          </div>
        </main>
      </div>
    );
  }

  const deliveryRate = campaign.sentCount > 0
    ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(0)
    : '0';
  const openRate = campaign.deliveredCount > 0
    ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(0)
    : '0';
  const clickRate = campaign.openedCount > 0
    ? ((campaign.clickedCount / campaign.openedCount) * 100).toFixed(0)
    : '0';

  const typeLabel: Record<string, string> = {
    abandoned_cart: '🛒 Abandoned Cart',
    inactive_user: '😴 Inactive Users',
    recommendation: '🎯 Recommendations',
  };

  return (
    <div className="layout">
      <Sidebar active="campaigns" />
      <main className="main">
        <div className="detail-header">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/campaigns')}
              style={{ marginBottom: 12 }}
            >
              ← Back
            </button>
            <h1 className="page-title">{campaign.name}</h1>
            <div className="detail-meta">
              <span className="type-pill">{typeLabel[campaign.type] || campaign.type}</span>
              <StatusBadge status={campaign.status} />
              {campaign.triggeredAt && (
                <span className="detail-meta-item">
                  Triggered <strong>{new Date(campaign.triggeredAt).toLocaleString()}</strong>
                </span>
              )}
            </div>
          </div>
          <button className="refresh-btn" onClick={fetchData}>↻ Refresh</button>
        </div>

        {/* Rates */}
        <div className="rate-grid">
          <div className="rate-item">
            <div className="rate-label">Delivery Rate</div>
            <div className="rate-value" style={{ color: 'var(--green)' }}>{deliveryRate}%</div>
            <div className="rate-sub">{campaign.deliveredCount} / {campaign.sentCount} sent</div>
          </div>
          <div className="rate-item">
            <div className="rate-label">Open Rate</div>
            <div className="rate-value" style={{ color: 'var(--accent)' }}>{openRate}%</div>
            <div className="rate-sub">{campaign.openedCount} / {campaign.deliveredCount} delivered</div>
          </div>
          <div className="rate-item">
            <div className="rate-label">Click Rate</div>
            <div className="rate-value" style={{ color: 'var(--orange)' }}>{clickRate}%</div>
            <div className="rate-sub">{campaign.clickedCount} / {campaign.openedCount} opened</div>
          </div>
        </div>

        {/* Communications */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Messages ({comms.length})</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Auto-refreshes every 5s</span>
          </div>
          {comms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">No messages yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Sent</th>
                    <th>Delivered</th>
                    <th>Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {comms.map((c) => {
                    const user = typeof c.userId === 'object' ? c.userId : null;
                    return (
                      <tr key={c._id}>
                        <td>
                          <div className="td-primary">{user?.name ?? '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email ?? '—'}</div>
                        </td>
                        <td>
                          <div className="message-preview" title={c.message}>{c.message}</div>
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td>{c.sentAt ? new Date(c.sentAt).toLocaleTimeString() : '—'}</td>
                        <td>{c.deliveredAt ? new Date(c.deliveredAt).toLocaleTimeString() : '—'}</td>
                        <td>{c.openedAt ? new Date(c.openedAt).toLocaleTimeString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
