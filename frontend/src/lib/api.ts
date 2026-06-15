import { Campaign, Communication, Stats } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || 'API error');
    }

    return json.data;
  } catch (err: any) {
    console.error(`API Error [${path}]:`, err?.message || err);
    throw err;
  }
}

export const api = {
  getStats: () => request<Stats>('/stats'),

  getCampaigns: () => request<Campaign[]>('/campaigns'),

  getCampaign: (id: string) =>
    request<{ campaign: Campaign; communications: Communication[] }>(
      `/campaigns/${id}`
    ),

  triggerAbandonedCart: () =>
    request<Campaign>('/campaigns/trigger/abandoned-cart', {
      method: 'POST',
    }),

  triggerInactiveUsers: (days = 30) =>
    request<Campaign>('/campaigns/trigger/inactive-users', {
      method: 'POST',
      body: JSON.stringify({ days }),
    }),

  triggerRecommendations: () =>
    request<Campaign>('/campaigns/trigger/recommendations', {
      method: 'POST',
    }),
};