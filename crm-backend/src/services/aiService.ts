import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// simple in-memory cache
const messageCache = new Map<string, string>();

// cooldown tracker to avoid frequent API hits
let lastAPICallTime = 0;
const COOLDOWN_MS = 5000;

export type AIMessageContext =
  | {
      type: 'abandoned_cart';
      userName: string;
      cartItems: string[];
      cartTotal: number;
      segment?: string;
    }
  | {
      type: 'inactive_user';
      userName: string;
      inactiveDays: number;
      lastPurchase?: string;
      segment?: string;
    }
  | {
      type: 'recommendation';
      userName: string;
      pastCategories: string[];
      recommendedProducts: string[];
      segment?: string;
    };

function getTone(segment?: string): string {
  if (segment === 'high_value') return 'premium, exclusive and appreciative';
  if (segment === 'inactive') return 'urgent but friendly and re-engaging';
  return 'friendly and casual';
}

function buildPrompt(ctx: AIMessageContext): string {
  const tone = getTone(ctx.segment);

  switch (ctx.type) {
    case 'abandoned_cart':
      return `You are a ${tone} e-commerce assistant. Write a short message (2-3 sentences) to ${ctx.userName} who left ${ctx.cartItems.join(', ')} in their cart worth $${ctx.cartTotal}. Be natural and engaging. No subject line.`;

    case 'inactive_user':
      return `You are a ${tone} e-commerce assistant. Write a short win-back message (2-3 sentences) to ${ctx.userName} who hasn't visited in ${ctx.inactiveDays} days. ${ctx.lastPurchase ? `Their last purchase was ${ctx.lastPurchase}.` : ''} Keep it inviting. No subject line.`;

    case 'recommendation':
      return `You are a ${tone} product advisor. Write a short personalized recommendation message (2-3 sentences) to ${ctx.userName}. Based on their interest in ${ctx.pastCategories.join(', ')}, suggest: ${ctx.recommendedProducts.join(', ')}. Make it engaging. No subject line.`;
  }
}

function getFallbackMessage(ctx: AIMessageContext): string {
  switch (ctx.type) {
    case 'abandoned_cart':
      return `Hi ${ctx.userName}! You left ${ctx.cartItems.slice(0, 2).join(' and ')} in your cart. Complete your purchase before they’re gone!`;
    case 'inactive_user':
      return `Hey ${ctx.userName}, it's been a while! Come back and explore what's new — we’ve got something for you.`;
    case 'recommendation':
      return `Hi ${ctx.userName}! We think you'll love ${ctx.recommendedProducts.slice(0, 2).join(' and ')}. Check them out today!`;
  }
}

function getCacheKey(ctx: AIMessageContext): string {
  return JSON.stringify(ctx);
}

export async function generateAIMessage(ctx: AIMessageContext): Promise<string> {
  const cacheKey = getCacheKey(ctx);

  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey)!;
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    return getFallbackMessage(ctx);
  }

  const now = Date.now();
  if (now - lastAPICallTime < COOLDOWN_MS) {
    return getFallbackMessage(ctx);
  }

  try {
    lastAPICallTime = now;

    const prompt = buildPrompt(ctx);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    const message =
      response.choices[0]?.message?.content?.trim() ?? getFallbackMessage(ctx);

    messageCache.set(cacheKey, message);

    return message;
  } catch (err: any) {
    if (err?.code !== 'insufficient_quota') {
      console.error('OpenAI error:', err);
    }
    return getFallbackMessage(ctx);
  }
}