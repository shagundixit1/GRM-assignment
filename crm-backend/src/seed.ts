import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Order } from './models/Order';
import { Campaign } from './models/Campaign';
import { Communication } from './models/Communication';
import { Event } from './models/Event';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-crm';

const users = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101', lastActiveAt: new Date(Date.now() - 45 * 86400000), totalOrders: 3, totalSpend: 289.97, tags: ['loyal', 'electronics'] },
  { name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-0102', lastActiveAt: new Date(Date.now() - 60 * 86400000), totalOrders: 1, totalSpend: 59.99, tags: ['at-risk'] },
  { name: 'Carol White', email: 'carol@example.com', phone: '+1-555-0103', lastActiveAt: new Date(Date.now() - 2 * 86400000), totalOrders: 5, totalSpend: 542.50, tags: ['vip', 'clothing'] },
  { name: 'David Lee', email: 'david@example.com', phone: '+1-555-0104', lastActiveAt: new Date(Date.now() - 90 * 86400000), totalOrders: 0, totalSpend: 0, tags: ['inactive'] },
  { name: 'Emma Davis', email: 'emma@example.com', phone: '+1-555-0105', lastActiveAt: new Date(Date.now() - 35 * 86400000), totalOrders: 2, totalSpend: 178.00, tags: ['books', 'electronics'] },
  { name: 'Frank Miller', email: 'frank@example.com', phone: '+1-555-0106', lastActiveAt: new Date(), totalOrders: 7, totalSpend: 934.25, tags: ['vip', 'sports'] },
  { name: 'Grace Wilson', email: 'grace@example.com', phone: '+1-555-0107', lastActiveAt: new Date(Date.now() - 120 * 86400000), totalOrders: 1, totalSpend: 49.99, tags: ['inactive', 'kitchen'] },
  { name: 'Henry Brown', email: 'henry@example.com', phone: '+1-555-0108', lastActiveAt: new Date(Date.now() - 15 * 86400000), totalOrders: 4, totalSpend: 412.00, tags: ['electronics'] },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Order.deleteMany({}),
    Campaign.deleteMany({}),
    Communication.deleteMany({}),
    Event.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create users
  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);

  // Create orders
  const orders = [
    {
      userId: createdUsers[0]._id,
      items: [{ productId: 'p1', productName: 'Wireless Earbuds Pro', category: 'Electronics', price: 89.99, quantity: 1 }],
      totalAmount: 89.99,
      status: 'completed',
      createdAt: new Date(Date.now() - 50 * 86400000),
    },
    {
      userId: createdUsers[0]._id,
      items: [
        { productId: 'p2', productName: 'Smart Watch X2', category: 'Electronics', price: 149.99, quantity: 1 },
        { productId: 'p3', productName: 'Summer Linen Shirt', category: 'Clothing', price: 49.99, quantity: 1 },
      ],
      totalAmount: 199.98,
      status: 'cart',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      userId: createdUsers[1]._id,
      items: [{ productId: 'p4', productName: 'TypeScript Mastery', category: 'Books', price: 59.99, quantity: 1 }],
      totalAmount: 59.99,
      status: 'completed',
      createdAt: new Date(Date.now() - 65 * 86400000),
    },
    {
      userId: createdUsers[2]._id,
      items: [
        { productId: 'p5', productName: 'Athletic Joggers V2', category: 'Clothing', price: 79.99, quantity: 2 },
        { productId: 'p6', productName: 'Merino Wool Sweater', category: 'Clothing', price: 129.99, quantity: 1 },
      ],
      totalAmount: 289.97,
      status: 'cart',
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      userId: createdUsers[4]._id,
      items: [{ productId: 'p7', productName: 'System Design Primer', category: 'Books', price: 49.99, quantity: 1 }],
      totalAmount: 49.99,
      status: 'completed',
      createdAt: new Date(Date.now() - 40 * 86400000),
    },
    {
      userId: createdUsers[4]._id,
      items: [{ productId: 'p8', productName: '4K Webcam Ultra', category: 'Electronics', price: 128.01, quantity: 1 }],
      totalAmount: 128.01,
      status: 'cart',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      userId: createdUsers[5]._id,
      items: [
        { productId: 'p9', productName: 'Resistance Band Kit', category: 'Sports', price: 39.99, quantity: 1 },
        { productId: 'p10', productName: 'Yoga Mat Premium', category: 'Sports', price: 59.99, quantity: 1 },
        { productId: 'p11', productName: 'Adjustable Dumbbells', category: 'Sports', price: 199.99, quantity: 1 },
      ],
      totalAmount: 299.97,
      status: 'completed',
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
    {
      userId: createdUsers[7]._id,
      items: [{ productId: 'p12', productName: 'French Press Deluxe', category: 'Kitchen', price: 54.99, quantity: 1 }],
      totalAmount: 54.99,
      status: 'cart',
      createdAt: new Date(Date.now() - 4 * 86400000),
    },
  ];

  const createdOrders = await Order.insertMany(orders);
  console.log(`🛒 Created ${createdOrders.length} orders`);

  // Create some events
  const events = createdUsers.slice(0, 4).map((u) => ({
    userId: u._id,
    type: 'cart_abandoned' as const,
    payload: { source: 'seed' },
  }));
  await Event.insertMany(events);

  console.log('Seed complete!');
  console.log(`\nSummary:`);
  console.log(`  Users: ${createdUsers.length}`);
  console.log(`  Orders: ${createdOrders.length}`);
  console.log(`  Abandoned carts: ${orders.filter((o) => o.status === 'cart').length}`);
  console.log(`  Inactive users (30d+): ${users.filter((u) => u.lastActiveAt < new Date(Date.now() - 30 * 86400000)).length}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
