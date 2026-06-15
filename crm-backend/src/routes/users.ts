import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';

const router = Router();

// GET all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching all users...');

    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });

    console.log(`Users fetched: ${users.length}`);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET user orders
router.get('/:id/orders', async (req: Request, res: Response) => {
  try {
    console.log(`Fetching orders for user: ${req.params.id}`);

    const orders = await Order.find({ userId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });

    console.log(`Orders fetched: ${orders.length}`);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;