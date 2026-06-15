import { Router, Request, Response } from 'express';
import { Campaign } from '../models/Campaign';
import { Communication } from '../models/Communication';
import { User } from '../models/User';
import { Order } from '../models/Order';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching system stats...');

    const [totalCampaigns, totalUsers, totalOrders, totalComms] = await Promise.all([
      Campaign.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Communication.countDocuments(),
    ]);

    const [deliveredCount, openedCount, clickedCount, failedCount] = await Promise.all([
      Communication.countDocuments({ status: 'delivered' }),
      Communication.countDocuments({ status: 'opened' }),
      Communication.countDocuments({ status: 'clicked' }),
      Communication.countDocuments({ status: 'failed' }),
    ]);

    const abandonedCarts = await Order.countDocuments({ status: 'cart' });

    const recentCampaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // calculate rates (numeric)
    const deliveryRate = totalComms > 0 ? (deliveredCount / totalComms) * 100 : 0;
    const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
    const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCampaigns,
          totalUsers,
          totalOrders,
          totalComms,
          abandonedCarts,
        },
        engagement: {
          deliveredCount,
          openedCount,
          clickedCount,
          failedCount,
        },
        rates: {
          deliveryRate: Number(deliveryRate.toFixed(2)),
          openRate: Number(openRate.toFixed(2)),
          clickRate: Number(clickRate.toFixed(2)),
        },
        recentCampaigns,
      },
    });

    console.log('Stats fetched successfully');
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;