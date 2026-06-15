import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CHANNEL_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5000';
const CRM_CALLBACK_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:4000/api/callback';

export interface SendMessagePayload {
  messageId: string;
  userId: string;
  channel: string;
  to: string;
  message: string;
  callbackUrl: string;
}

export async function sendViaChannel(
  payload: Omit<SendMessagePayload, 'callbackUrl'>
): Promise<void> {
  try {
    console.log(`Sending message to channel service: ${payload.messageId}`);

    await axios.post(`${CHANNEL_URL}/send`, {
      ...payload,
      callbackUrl: CRM_CALLBACK_URL,
    });

    console.log(`Message sent successfully: ${payload.messageId}`);
  } catch (err: any) {
    console.error('Channel service error:', err?.message || err);
    throw err;
  }
}