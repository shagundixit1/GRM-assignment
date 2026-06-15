import mongoose, { Schema, Document } from 'mongoose';

export type CommStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';

export interface ICommunication extends Document {
  campaignId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  messageId: string;
  channel: string;
  message: string;
  status: CommStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationSchema = new Schema<ICommunication>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageId: { type: String, required: true, unique: true },
    channel: { type: String, default: 'email' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'opened', 'clicked'],
      default: 'queued',
    },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true }
);

export const Communication = mongoose.model<ICommunication>('Communication', CommunicationSchema);
