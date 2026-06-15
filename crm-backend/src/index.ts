import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import campaignRoutes from './routes/campaigns';
import callbackRoutes from './routes/callback';
import userRoutes from './routes/users';
import statsRoutes from './routes/stats';
import {
  runAbandonedCartCampaign,
  runInactiveUserCampaign,
  runRecommendationCampaign
} from './services/campaignService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/callback', callbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.get("/", (_req, res) => {
  res.send("CRM Backend is running");
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'crm-backend',
    timestamp: new Date().toISOString()
  });
});

const start = async () => {
  try {
    await connectDB();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`CRM Backend running on port ${PORT}`);
    });

    // Only run auto campaigns in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Running background campaign jobs (dev only)');

      setInterval(async () => {
        try {
          await runAbandonedCartCampaign();
        } catch (err) {
          console.error("Abandoned cart campaign error:", err);
        }
      }, 30000);

      setInterval(async () => {
        try {
          await runInactiveUserCampaign();
        } catch (err) {
          console.error("Inactive user campaign error:", err);
        }
      }, 60000);

      setInterval(async () => {
        try {
          await runRecommendationCampaign();
        } catch (err) {
          console.error("Recommendation campaign error:", err);
        }
      }, 90000);
    }

  } catch (err) {
    console.error('Server start error:', err);
    process.exit(1);
  }
};

start();