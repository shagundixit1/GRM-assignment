'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Stats, Campaign } from '@/types';
import CampaignTriggerCard from '@/components/CampaignTriggerCard';
import CampaignTable from '@/components/CampaignTable';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastItem } from '@/components/Toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [triggering, setTriggering] = useState<string | null>(null);

  const addToast = (t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4500);
  };

  const fetchData = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        api.getStats(),
        api.getCampaigns(),
      ]);
      setStats(s);
      setCampaigns(c);
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to load',
        body: 'Backend not reachable. Check deployment or API URL.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 8000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const trigger = async (name: string, fn: () => Promise<Campaign>) => {
    setTriggering(name);
    try {
      const campaign = await fn();
      addToast({
        type: 'success',
        title: 'Campaign launched',
        body: `"${campaign.name}" targeting ${campaign.targetCount} users`,
      });
      await fetchData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Campaign failed',
        body: String(err),
      });
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="layout">
      <Sidebar active="dashboard" />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            AI-powered campaign automation · auto-refreshes every 8s
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard
            label="Total Users"
            value={stats?.overview?.totalUsers ?? '—'}
            meta="in database"
          />
          <StatCard
            label="Campaigns Run"
            value={stats?.overview?.totalCampaigns ?? '—'}
            meta="all time"
          />
          <StatCard
            label="Messages Sent"
            value={stats?.overview?.totalComms ?? '—'}
            meta={`${stats?.rates?.deliveryRate ?? 0}% delivered`}
            pill={{
              label: `${stats?.rates?.deliveryRate ?? 0}%`,
              type: 'green',
            }}
          />
          <StatCard
            label="Abandoned Carts"
            value={stats?.overview?.abandonedCarts ?? '—'}
            meta="pending recovery"
            pill={{ label: 'recoverable', type: 'yellow' }}
          />
        </div>

        {/* Engagement */}
        {stats && (
          <div
            className="stats-grid"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}
          >
            <StatCard
              label="Delivery Rate"
              value={`${stats.rates.deliveryRate}%`}
              meta={`${stats.engagement.deliveredCount} delivered`}
            />
            <StatCard
              label="Open Rate"
              value={`${stats.rates.openRate}%`}
              meta={`${stats.engagement.openedCount} opened`}
            />
            <StatCard
              label="Click Rate"
              value={`${stats.rates.clickRate}%`}
              meta={`${stats.engagement.clickedCount} clicked`}
            />
          </div>
        )}

        {/* Campaign triggers */}
        <div className="card-header" style={{ padding: '0 0 14px', border: 'none' }}>
          <span className="card-title">Launch Campaign</span>
        </div>

        <div className="campaigns-grid">
          <CampaignTriggerCard
            icon="🛒"
            name="Abandoned Cart"
            description="Re-engage users who left items in cart."
            loading={triggering === 'cart'}
            onTrigger={() => trigger('cart', api.triggerAbandonedCart)}
          />
          <CampaignTriggerCard
            icon="😴"
            name="Inactive Users"
            description="Win back users inactive for 30+ days."
            loading={triggering === 'inactive'}
            onTrigger={() =>
              trigger('inactive', () => api.triggerInactiveUsers(30))
            }
          />
          <CampaignTriggerCard
            icon="🎯"
            name="Recommendations"
            description="Send personalized product suggestions."
            loading={triggering === 'rec'}
            onTrigger={() => trigger('rec', api.triggerRecommendations)}
          />
        </div>

        {/* Campaign table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Campaign History</span>
            <button className="refresh-btn" onClick={fetchData}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div className="spinner" />
            </div>
          ) : (
            <CampaignTable campaigns={campaigns} onRefresh={fetchData} />
          )}
        </div>
      </main>

      <Toast toasts={toasts} />
    </div>
  );
}

function StatCard({
  label,
  value,
  meta,
  pill,
}: {
  label: string;
  value: string | number;
  meta: string;
  pill?: { label: string; type: 'green' | 'yellow' | 'red' };
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div
        className="stat-meta"
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {pill && <span className={`stat-pill ${pill.type}`}>{pill.label}</span>}
        {meta}
      </div>
    </div>
  );
}