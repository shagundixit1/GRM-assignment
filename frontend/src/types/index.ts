export type CampaignType = 'abandoned_cart' | 'inactive_user' | 'recommendation';
export type CampaignStatus = 'draft' | 'running' | 'completed' | 'failed';
export type CommStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';

export interface Campaign {
  _id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  triggeredAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Communication {
  _id: string;
  campaignId: string;
  userId: { _id: string; name: string; email: string } | string;
  messageId: string;
  channel: string;
  message: string;
  status: CommStatus;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
}

export interface Stats {
  overview: {
    totalCampaigns: number;
    totalUsers: number;
    totalOrders: number;
    totalComms: number;
    abandonedCarts: number;
  };

  engagement: {
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    failedCount: number;
  };

  rates: {
    deliveryRate: string;
    openRate: string;
    clickRate: string;
  };

  recentCampaigns: Campaign[];
}