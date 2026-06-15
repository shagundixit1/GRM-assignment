import mongoose, { Schema, Document } from 'mongoose';

export type EventType =
  | 'cart_abandoned'
  | 'user_inactive'
  | 'campaign_triggered'
  | 'message_sent'
  | 'message_delivered'
  | 'message_failed'
  | 'message_opened'
  | 'message_clicked';

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  type: EventType;
  payload: Record<string, unknown>;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'cart_abandoned',
        'user_inactive',
        'campaign_triggered',
        'message_sent',
        'message_delivered',
        'message_failed',
        'message_opened',
        'message_clicked',
      ],
      required: true,
    },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
