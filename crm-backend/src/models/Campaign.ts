import mongoose, { Schema, Document } from 'mongoose';

export type CampaignType = 'abandoned_cart' | 'inactive_user' | 'recommendation';
export type CampaignStatus = 'draft' | 'running' | 'completed' | 'failed';

export interface ICampaign extends Document {
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  triggeredAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['abandoned_cart', 'inactive_user', 'recommendation'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'running', 'completed', 'failed'],
      default: 'draft',
    },
    targetCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    triggeredAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
