'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Campaign } from '@/types';
import Sidebar from '@/components/Sidebar';
import CampaignTable from '@/components/CampaignTable';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const data = await api.getCampaigns();
    setCampaigns(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 6000);
    return () => clearInterval(iv);
  }, [fetchData]);

  return (
    <div className="layout">
      <Sidebar active="campaigns" />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">All Campaigns</h1>
          <p className="page-subtitle">Track every campaign and its performance metrics</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Campaigns ({campaigns.length})</span>
            <button className="refresh-btn" onClick={fetchData}>↻ Refresh</button>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}><div className="spinner" /></div>
          ) : (
            <CampaignTable campaigns={campaigns} onRefresh={fetchData} />
          )}
        </div>
      </main>
    </div>
  );
}
