import { Router, Request, Response } from 'express';
import { Campaign } from '../models/Campaign';
import { Communication } from '../models/Communication';
import {
  runAbandonedCartCampaign,
  runInactiveUserCampaign,
  runRecommendationCampaign,
} from '../services/campaignService';

const router = Router();

// GET all campaigns
router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching all campaigns...');
    const campaigns = await Campaign.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET single campaign with communications
router.get('/:id', async (req: Request, res: Response) => {
  try {
    console.log(`Fetching campaign details: ${req.params.id}`);

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const communications = await Communication.find({ campaignId: req.params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        campaign,
        communications,
        totalMessages: communications.length,
      },
    });
  } catch (err) {
    console.error('Error fetching campaign:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST trigger abandoned cart campaign
router.post('/trigger/abandoned-cart', async (_req: Request, res: Response) => {
  try {
    console.log('Triggering Abandoned Cart Campaign...');
    const campaign = await runAbandonedCartCampaign();

    res.json({
      success: true,
      message: 'Abandoned cart campaign triggered successfully',
      data: campaign,
    });
  } catch (err) {
    console.error('Error triggering abandoned cart campaign:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST trigger inactive user campaign
router.post('/trigger/inactive-users', async (req: Request, res: Response) => {
  try {
    const days = Number(req.body.days) || 30;

    console.log(`Triggering Inactive User Campaign for ${days} days...`);

    const campaign = await runInactiveUserCampaign(days);

    res.json({
      success: true,
      message: `Inactive user campaign triggered (${days} days)`,
      data: campaign,
    });
  } catch (err) {
    console.error('Error triggering inactive user campaign:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST trigger recommendation campaign
router.post('/trigger/recommendations', async (_req: Request, res: Response) => {
  try {
    console.log('Triggering Recommendation Campaign...');
    const campaign = await runRecommendationCampaign();

    res.json({
      success: true,
      message: 'Recommendation campaign triggered successfully',
      data: campaign,
    });
  } catch (err) {
    console.error('Error triggering recommendation campaign:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;