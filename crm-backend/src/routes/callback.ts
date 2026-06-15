import { Router, Request, Response } from 'express';
import { Communication } from '../models/Communication';
import { Campaign } from '../models/Campaign';
import { Event } from '../models/Event';
import { generateAIMessage } from '../services/aiService';
import { sendViaChannel } from '../services/channelClient';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

type CallbackStatus = 'delivered' | 'failed' | 'opened' | 'clicked';

interface CallbackPayload {
  messageId: string;
  status: CallbackStatus;
  timestamp: string;
  reason?: string;
}

const RETRY_DELAY_MS = 15000;

router.post('/', async (req: Request, res: Response) => {
  try {
    const { messageId, status, timestamp, reason }: CallbackPayload = req.body;

    const comm = await Communication.findOne({ messageId });
    if (!comm) {
      return res.status(404).json({ success: false, error: 'Communication not found' });
    }

    const now = new Date(timestamp || Date.now());
    const update: Record<string, unknown> = { status };

    console.log(`Callback received: ${messageId} → ${status}`);

    if (status === 'delivered') {
      update.deliveredAt = now;
      await Campaign.findByIdAndUpdate(comm.campaignId, { $inc: { deliveredCount: 1 } });

      // Retry logic (AI-based)
      setTimeout(async () => {
        try {
          const latest = await Communication.findOne({ messageId }).populate('campaignId');

          if (!latest || latest.openedAt) {
            console.log(`No retry needed for ${messageId}`);
            return;
          }

          const campaign = latest.campaignId as any;

          console.log(`Retry triggered for message: ${messageId}`);

          let retryContext: any;

          if (campaign.type === 'abandoned_cart') {
            retryContext = {
              type: 'abandoned_cart',
              userName: 'Customer',
              cartItems: ['your items'],
              cartTotal: 0,
              segment: 'inactive',
            };
          } else if (campaign.type === 'inactive_user') {
            retryContext = {
              type: 'inactive_user',
              userName: 'Customer',
              inactiveDays: 30,
              segment: 'inactive',
            };
          } else {
            retryContext = {
              type: 'recommendation',
              userName: 'Customer',
              pastCategories: ['Popular'],
              recommendedProducts: ['Top Picks'],
              segment: 'regular',
            };
          }

          const retryMessage = await generateAIMessage(retryContext);

          const retryMessageId = uuidv4();

          await Communication.create({
            campaignId: latest.campaignId,
            userId: latest.userId,
            messageId: retryMessageId,
            channel: latest.channel,
            message: retryMessage,
            status: 'queued',
          });

          await sendViaChannel({
            messageId: retryMessageId,
            userId: String(latest.userId),
            channel: latest.channel,
            to: '',
            message: retryMessage,
          });

          console.log(`Retry message sent: ${retryMessageId}`);

        } catch (err) {
          console.error('Retry logic error:', err);
        }
      }, RETRY_DELAY_MS);
    } else if (status === 'failed') {
      update.failureReason = reason || 'Unknown';
      await Campaign.findByIdAndUpdate(comm.campaignId, { $inc: { failedCount: 1 } });
    } else if (status === 'opened') {
      update.openedAt = now;
      await Campaign.findByIdAndUpdate(comm.campaignId, { $inc: { openedCount: 1 } });
    } else if (status === 'clicked') {
      update.clickedAt = now;
      await Campaign.findByIdAndUpdate(comm.campaignId, { $inc: { clickedCount: 1 } });
    }

    await Communication.findOneAndUpdate({ messageId }, update);

    await Event.create({
      userId: comm.userId,
      type: `message_${status}` as any,
      payload: { messageId, campaignId: comm.campaignId, status },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;