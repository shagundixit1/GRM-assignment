import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Campaign, ICampaign } from '../models/Campaign';
import { Communication } from '../models/Communication';
import { Event } from '../models/Event';
import { generateAIMessage } from './aiService';
import { sendViaChannel } from './channelClient';

const COOLDOWN_MS = 2 * 60 * 1000;

async function hasRecentCommunication(userId: any, campaignType: string) {
  const since = new Date(Date.now() - COOLDOWN_MS);

  const recent = await Communication.findOne({
    userId,
    createdAt: { $gte: since },
  }).populate({
    path: 'campaignId',
    match: { type: campaignType },
  });

  return !!recent;
}

function getUserSegment(user: any) {
  if (user.totalSpend > 1000 || user.totalOrders >= 5) return 'high_value';
  if (new Date(user.lastActiveAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) return 'inactive';
  return 'regular';
}

// Abandoned Cart Campaign
export async function runAbandonedCartCampaign(): Promise<ICampaign> {
  console.log('Running Abandoned Cart Campaign...');

  const cutoff = new Date(Date.now());
  const abandonedOrders = await Order.find({
    status: 'cart',
    createdAt: { $lte: cutoff },
  }).populate('userId');

  console.log(`Target Orders: ${abandonedOrders.length}`);

  const campaign = await Campaign.create({
    name: `Abandoned Cart — ${new Date().toLocaleDateString()}`,
    type: 'abandoned_cart',
    status: 'running',
    targetCount: abandonedOrders.length,
    triggeredAt: new Date(),
  });

  for (const order of abandonedOrders) {
    const user = await User.findById(order.userId);
    if (!user) continue;

    const alreadySent = await hasRecentCommunication(user._id, 'abandoned_cart');
    if (alreadySent) continue;

    const segment = getUserSegment(user);
    console.log(`Processing user: ${user.email} | Segment: ${segment}`);

    const cartItems = order.items.map((i) => i.productName);

    const message = await generateAIMessage({
      type: 'abandoned_cart',
      userName: user.name,
      cartItems,
      cartTotal: order.totalAmount,
      segment,
    });

    const messageId = uuidv4();

    await Communication.create({
      campaignId: campaign._id,
      userId: user._id,
      messageId,
      channel: 'email',
      message,
      status: 'queued',
    });

    await Campaign.findByIdAndUpdate(campaign._id, { $inc: { sentCount: 1 } });

    try {
      console.log(`Sending message to ${user.email}`);

      await sendViaChannel({
        messageId,
        userId: String(user._id),
        channel: 'email',
        to: user.email,
        message,
      });

      await Communication.findOneAndUpdate(
        { messageId },
        { status: 'sent', sentAt: new Date() }
      );
    } catch (err) {
      console.error(`Failed for ${user.email}`);

      await Communication.findOneAndUpdate(
        { messageId },
        { status: 'failed', failureReason: String(err) }
      );

      await Campaign.findByIdAndUpdate(campaign._id, { $inc: { failedCount: 1 } });
    }
  }

  console.log('Abandoned Cart Campaign Completed');

  const updated = await Campaign.findByIdAndUpdate(
    campaign._id,
    { status: 'completed', completedAt: new Date() },
    { new: true }
  );

  return updated!;
}

// Inactive User Campaign
export async function runInactiveUserCampaign(inactiveDays = 30): Promise<ICampaign> {
  console.log('Running Inactive User Campaign...');

  const cutoff = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);
  const inactiveUsers = await User.find({ lastActiveAt: { $lte: cutoff } });

  console.log(`Target Users: ${inactiveUsers.length}`);

  const campaign = await Campaign.create({
    name: `Inactive Users (${inactiveDays}d)`,
    type: 'inactive_user',
    status: 'running',
    targetCount: inactiveUsers.length,
    triggeredAt: new Date(),
  });

  for (const user of inactiveUsers) {
    const alreadySent = await hasRecentCommunication(user._id, 'inactive_user');
    if (alreadySent) continue;

    const segment = getUserSegment(user);
    console.log(`Processing user: ${user.email} | Segment: ${segment}`);

    const lastOrder = await Order.findOne({
      userId: user._id,
      status: 'completed',
    }).sort({ createdAt: -1 });

    const message = await generateAIMessage({
      type: 'inactive_user',
      userName: user.name,
      inactiveDays,
      lastPurchase: lastOrder?.items[0]?.productName,
      segment,
    });

    const messageId = uuidv4();

    await Communication.create({
      campaignId: campaign._id,
      userId: user._id,
      messageId,
      channel: 'email',
      message,
      status: 'queued',
    });

    await Campaign.findByIdAndUpdate(campaign._id, { $inc: { sentCount: 1 } });

    try {
      console.log(`Sending message to ${user.email}`);

      await sendViaChannel({
        messageId,
        userId: String(user._id),
        channel: 'email',
        to: user.email,
        message,
      });

      await Communication.findOneAndUpdate(
        { messageId },
        { status: 'sent', sentAt: new Date() }
      );
    } catch (err) {
      console.error(`Failed for ${user.email}`);

      await Communication.findOneAndUpdate(
        { messageId },
        { status: 'failed', failureReason: String(err) }
      );

      await Campaign.findByIdAndUpdate(campaign._id, { $inc: { failedCount: 1 } });
    }

    await Event.create({
      userId: user._id,
      type: 'user_inactive',
      payload: { inactiveDays },
    });
  }

  console.log('Inactive Campaign Completed');

  return campaign;
}

// Recommendation Campaign
export async function runRecommendationCampaign(): Promise<ICampaign> {
  console.log('Running Recommendation Campaign...');

  const users = await User.find({ totalOrders: { $gte: 1 } });

  console.log(`Target Users: ${users.length}`);

  const campaign = await Campaign.create({
    name: `Recommendations`,
    type: 'recommendation',
    status: 'running',
    targetCount: users.length,
    triggeredAt: new Date(),
  });

  for (const user of users) {
    const alreadySent = await hasRecentCommunication(user._id, 'recommendation');
    if (alreadySent) continue;

    const segment = getUserSegment(user);
    console.log(`Processing user: ${user.email} | Segment: ${segment}`);

    const message = await generateAIMessage({
      type: 'recommendation',
      userName: user.name,
      pastCategories: ['Electronics'],
      recommendedProducts: ['Smart Watch', 'Headphones'],
      segment,
    });

    const messageId = uuidv4();

    await Communication.create({
      campaignId: campaign._id,
      userId: user._id,
      messageId,
      channel: 'email',
      message,
      status: 'queued',
    });

    await Campaign.findByIdAndUpdate(campaign._id, { $inc: { sentCount: 1 } });

    try {
      console.log(`Sending message to ${user.email}`);

      await sendViaChannel({
        messageId,
        userId: String(user._id),
        channel: 'email',
        to: user.email,
        message,
      });

      await Communication.findOneAndUpdate(
        { messageId },
        { status: 'sent', sentAt: new Date() }
      );
    } catch (err) {
      console.error(`Failed for ${user.email}`);

      await Communication.findOneAndUpdate(
        { messageId },
        { status: 'failed', failureReason: String(err) }
      );

      await Campaign.findByIdAndUpdate(campaign._id, { $inc: { failedCount: 1 } });
    }
  }

  console.log('Recommendation Campaign Completed');

  return campaign;
}