'use client';

import { useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import StatusBadge from './StatusBadge';

interface Props {
  campaigns: Campaign[];
  onRefresh: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  abandoned_cart: '🛒 Abandoned Cart',
  inactive_user: '😴 Inactive Users',
  recommendation: '🎯 Recommendations',
};

function getRate(part: number, total: number) {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

export default function CampaignTable({ campaigns }: Props) {
  const router = useRouter();

  if (campaigns.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <p className="empty-state-text">No campaigns yet</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Launch your first campaign to start engaging users
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Type</th>
            <th>Status</th>
            <th>Targets</th>
            <th>Sent</th>
            <th>Delivered</th>
            <th>Opened</th>
            <th>Clicked</th>
            <th>Triggered</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c._id}>
              <td>
                <div className="td-primary">{c.name}</div>
              </td>

              <td>
                <span className="type-pill">
                  {TYPE_LABELS[c.type] || c.type}
                </span>
              </td>

              <td>
                <StatusBadge status={c.status} />
              </td>

              <td>{c.targetCount}</td>

              <td>{c.sentCount}</td>

              <td>
                <span
                  style={{
                    color:
                      c.deliveredCount > 0
                        ? 'var(--green)'
                        : 'var(--text-muted)',
                  }}
                >
                  {c.deliveredCount}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {getRate(c.deliveredCount, c.sentCount)}
                </div>
              </td>

              <td>
                <span
                  style={{
                    color:
                      c.openedCount > 0
                        ? 'var(--accent)'
                        : 'var(--text-muted)',
                  }}
                >
                  {c.openedCount}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {getRate(c.openedCount, c.deliveredCount)}
                </div>
              </td>

              <td>
                <span
                  style={{
                    color:
                      c.clickedCount > 0
                        ? 'var(--orange)'
                        : 'var(--text-muted)',
                  }}
                >
                  {c.clickedCount}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {getRate(c.clickedCount, c.openedCount)}
                </div>
              </td>

              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {c.triggeredAt
                  ? new Date(c.triggeredAt).toLocaleString()
                  : '—'}
              </td>

              <td>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => router.push(`/campaigns/${c._id}`)}
                >
                  View →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}