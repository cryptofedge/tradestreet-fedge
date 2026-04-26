// ============================================
// FEDGE 2.O — Signal Routes
// apps/api/src/routes/signals.ts
// ============================================

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { nanoid } from 'nanoid';

export async function signalRoutes(fastify: FastifyInstance) {

  // Auth hook for all signal routes
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired token.' });
    }
  });

  // ---- GET /signals/feed ----
  fastify.get('/feed', async (request, reply) => {
    const user = request.user as { id: string; tier: string };
    const query = request.query as {
      limit?: string;
      asset_class?: string;
      min_confidence?: string;
    };

    const limit = Math.min(Number(query.limit ?? 20), user.tier === 'pro' ? 50 : 5);
    const minConfidence = Number(query.min_confidence ?? 0);

    // Fetch cached signals from Redis
    const cached = await fastify.redis.get(`signals:${user.id}`);
    let signals = cached ? JSON.parse(cached) : [];

    // Filter by query params
    if (query.asset_class && query.asset_class !== 'all') {
      signals = signals.filter((s: any) => s.assetClass === query.asset_class);
    }
    if (minConfidence > 0) {
      signals = signals.filter((s: any) => s.confidence >= minConfidence);
    }

    // Free tier: 1 signal per day
    if (user.tier === 'free') {
      const usedToday = await fastify.redis.get(`signals:used:${user.id}:${new Date().toDateString()}`);
      if (usedToday && Number(usedToday) >= 1) {
        return reply.status(403).send({
          statusCode: 403,
          code: 'TIER_REQUIRED',
          message: 'Free tier: 1 signal per day. Upgrade to FEDGE Pro for unlimited signals.',
        });
      }
    }

    // Increment free tier daily counter
    if (user.tier === 'free') {
      const usageKey = `signals:used:${user.id}:${new Date().toDateString()}`;
      await fastify.redis.incr(usageKey);
      await fastify.redis.expire(usageKey, 86400);
    }

    return {
      data: {
        signals: signals.slice(0, limit),
        meta: {
          total: signals.length,
          returned: Math.min(signals.length, limit),
          tier: user.tier,
          generatedAt: new Date().toISOString(),
        },
      },
    };
  });

  // ---- GET /signals/:id ----
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string };

    const signal = await fastify.redis.get(`signal:${id}`);
    if (!signal) {
      return reply.status(404).send({ statusCode: 404, code: 'NOT_FOUND', message: 'Signal not found.' });
    }

    return { data: JSON.parse(signal) };
  });

  // ---- POST /signals/:id/execute ----
  fastify.post('/:id/execute', async (request, reply) => {
    const user = request.user as { id: string; tier: string };

    if (user.tier !== 'pro') {
      return reply.status(403).send({
        statusCode: 403,
        code: 'TIER_REQUIRED',
        message: 'Signal execution requires FEDGE Pro.',
      });
    }

    const { id } = request.params as { id: string };
    const body = request.body as { qty: number; order_type?: string; limit_price?: number; confirm: boolean };

    if (!body.confirm) {
      return reply.status(400).send({
        statusCode: 400,
        code: 'INVALID_REQUEST',
        message: 'confirm: true is required to execute a trade.',
      });
    }

    const signalRaw = await fastify.redis.get(`signal:${id}`);
    if (!signalRaw) {
      return reply.status(404).send({ statusCode: 404, code: 'NOT_FOUND', message: 'Signal not found or expired.' });
    }

    const signal = JSON.parse(signalRaw);

    // Get portfolio context for Risk Guard
    const portfolioRaw = await fastify.redis.get(`portfolio:${user.id}`);
    const portfolio = portfolioRaw ? JSON.parse(portfolioRaw) : null;

    if (portfolio) {
      const orderValue = body.qty * signal.entryRange.low;
      const riskCheck = await fastify.fedgeBrain.checkRisk(
        signal.ticker,
        signal.action === 'BUY' ? 'buy' : 'sell',
        orderValue,
        { portfolio: portfolio.summary, positions: portfolio.positions ?? [], recentSignals: [], userProfile: { xp: 0, level: 1, streakDays: 0, badges: [] } }
      );

      if (!riskCheck.approved) {
        return reply.status(409).send({
          statusCode: 409,
          code: 'ORDER_CONFLICT',
          message: riskCheck.reason,
        });
      }
    }

    // Place the order
    const order = await fastify.alpaca.placeOrder({
      symbol: signal.ticker,
      side: signal.action === 'BUY' ? 'buy' : 'sell',
      qty: body.qty,
      type: (body.order_type as any) ?? 'market',
      limitPrice: body.limit_price,
    });

    // Mark signal as used
    await fastify.redis.set(`signal:used:${user.id}:${id}`, '1', { EX: 86400 });

    // Increment XP for following a signal
    await fastify.redis.incrBy(`xp:${user.id}`, 25);

    return {
      data: {
        order,
        xp_awarded: 25,
        message: 'Order placed. FEDGE is watching.',
      },
    };
  });
}
