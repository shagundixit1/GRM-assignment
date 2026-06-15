import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const DELIVERY_RATE = parseFloat(process.env.DELIVERY_RATE || '0.8');
const OPEN_RATE = parseFloat(process.env.OPEN_RATE || '0.5');
const CLICK_RATE = parseFloat(process.env.CLICK_RATE || '0.2');
const MIN_DELAY = parseInt(process.env.MIN_DELAY_MS || '500');
const MAX_DELAY = parseInt(process.env.MAX_DELAY_MS || '3000');

app.use(cors());
app.use(express.json());

interface SendRequest {
  messageId: string;
  userId: string;
  channel: string;
  to: string;
  message: string;
  callbackUrl: string;
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fireCallback(callbackUrl: string, payload: object): Promise<void> {
  try {
    await axios.post(callbackUrl, payload, { timeout: 5000 });
    console.log(`Callback sent: ${JSON.stringify(payload)}`);
  } catch (err) {
    console.error(`Callback failed: ${err}`);
  }
}

async function simulateDelivery(req: SendRequest): Promise<void> {
  const baseDelay = randomDelay(MIN_DELAY, MAX_DELAY);

  setTimeout(async () => {
    const delivered = Math.random() < DELIVERY_RATE;
    const status = delivered ? 'delivered' : 'failed';

    await fireCallback(req.callbackUrl, {
      messageId: req.messageId,
      status,
      timestamp: new Date().toISOString(),
      ...(delivered ? {} : { reason: 'Simulated delivery failure' }),
    });

    if (!delivered) return;

    const openDelay = randomDelay(1000, 5000);
    setTimeout(async () => {
      if (Math.random() > OPEN_RATE) return;

      await fireCallback(req.callbackUrl, {
        messageId: req.messageId,
        status: 'opened',
        timestamp: new Date().toISOString(),
      });

      const clickDelay = randomDelay(500, 2000);
      setTimeout(async () => {
        if (Math.random() > CLICK_RATE) return;

        await fireCallback(req.callbackUrl, {
          messageId: req.messageId,
          status: 'clicked',
          timestamp: new Date().toISOString(),
        });
      }, clickDelay);
    }, openDelay);
  }, baseDelay);
}

// POST /send
app.post('/send', async (req, res) => {
  const body = req.body as SendRequest;

  if (!body.messageId || !body.to || !body.message || !body.callbackUrl) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: messageId, to, message, callbackUrl',
    });
  }

  console.log(`Message queued: [${body.channel}] → ${body.to} (${body.messageId})`);

  res.json({ success: true, messageId: body.messageId, queued: true });

  simulateDelivery(body);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'channel-service',
    config: { DELIVERY_RATE, OPEN_RATE, CLICK_RATE },
    timestamp: new Date().toISOString(),
  });
});

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Channel Service running on port ${PORT}`);
      console.log(`Delivery: ${DELIVERY_RATE * 100}% | Open: ${OPEN_RATE * 100}% | Click: ${CLICK_RATE * 100}%`);
    });
  } catch (err) {
    console.error('Channel service failed to start:', err);
    process.exit(1);
  }
};

start();