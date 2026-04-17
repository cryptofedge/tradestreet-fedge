// ============================================
// FEDGE 2.O — Portfolio Routes
// apps/api/src/routes/portfolio.ts
// ============================================

import type { FastifyInstance } from 'fastify';

export async function portfolioRoutes(fastify: FastifyInstance) {

  fastify.addHook('onRequest', async (request, reply) => {
    try { await request.jwtVerify(); }
    catch { reply.status(401).send({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Auth required.' }); }
  });

  // Auth + platform connected check
  async function requirePlatform(request: any, reply: any) {
    const user = request.user as { id: string };
    const { rows } = await fastify.db.query(
      'SELECT platform_connected, platform FROM users WHERE id = $1', [user.id]
    );
    if (!rows[0]?.platform_connected) {
      return reply.status(403).send({
        statusCode: 403, code: 'PLATFORM_NOT_CONNECTED',
        message: 'Connect your brokerage first via /auth/platform/connect.',
      });
    }
    request.platform = rows[0].platform;
  }

  // ---- GET /portfolio/summary ----
  fastify.get('/summary', { preHandler: requirePlatform }, async (request) => {
    const user = request.user as { id: string };

    const cached = await fastify.redis.get(`portfolio:summary:${user.id}`);
    if (cached) return { data: JSON.parse(cached) };

    const summary = await fastify.alpaca.getAccount();
    const positions = await fastify.alpaca.getPositions();
    summary.positionsCount = positions.length;

    await fastify.redis.set(`portfolio:summary:${user.id}`, JSON.stringify(summary), { EX: 15 });

    // Cache full portfolio for FEDGE Brain context
    await fastify.redis.set(`portfolio:${user.id}`, JSON.stringify({ summary, positions }), { EX: 30 });

    return { data: summary };
  });

  // ---- GET /portfolio/positions ----
  fastify.get('/positions', { preHandler: requirePlatform }, async (request) => {
    const user = request.user as { id: string };

    const rawPositions = await fastify.alpaca.getPositions();

    // Enrich with FEDGE risk scores and commentary
    const enriched = await Promise.all(
      rawPositions.map(async (pos) => {
        const riskScore = Math.min(100, Math.round(
          (pos.marketValue / 25000) * 100 // simple concentration score
        ));
        return {
          ...pos,
          fedgeRiskScore: riskScore,
          fedgeCommentary: '', // populated on demand to save API calls
        };
      })
    );

    return { data: enriched };
  });

  // ---- GET /portfolio/orders ----
  fastify.get('/orders', { preHandler: requirePlatform }, async (request) => {
    const user = request.user as { id: string };
    const { status, limit } = request.query as { status?: string; limit?: string };

    const orders = await fastify.alpaca.getOrders(
      status as any ?? 'all',
      Math.min(Number(limit ?? 20), 50)
    );

    return { data: orders };
  });

  // ---- POST /portfolio/orders ----
  fastify.post('/orders', { preHandler: requirePlatform }, async (request, reply) => {
    const user = request.user as { id: string; tier: string };

    if (user.tier !== 'pro') {
      return reply.status(403).send({
        statusCode: 403, code: 'TIER_REQUIRED',
        message: 'Trade execution requires FEDGE Pro.',
      });
    }

    const body = request.body as {
      symbol: string;
      side: 'buy' | 'sell';
      qty: number;
      type: string;
      time_in_force?: string;
      limit_price?: number;
    };

    if (!body.symbol || !body.side || !body.qty || !body.type) {
      return reply.status(400).send({
        statusCode: 400, code: 'INVALID_REQUEST',
        message: 'symbol, side, qty, and type are required.',
      });
    }

    // Risk Guard check
    const portfolioRaw = await fastify.redis.get(`portfolio:${user.id}`);
    if (portfolioRaw) {
      const portfolio = JSON.parse(portfolioRaw);
      const orderValue = body.qty * (await fastify.alpaca.getLatestPrice(body.symbol));
      const riskCheck = await fastify.fedgeBrain.checkRisk(
        body.symbol, body.side, orderValue,
        { portfolio: portfolio.summary, positions: portfolio.positions ?? [], recentSignals: [], userProfile: { xp: 0, level: 1, streakDays: 0, badges: [] } }
      );

      if (!riskCheck.approved) {
        return reply.status(409).send({
          statusCode: 409, code: 'ORDER_CONFLICT', message: riskCheck.reason,
        });
      }
    }

    const order = await fastify.alpaca.placeOrder({
      symbol: body.symbol.toUpperCase(),
      side: body.side,
      qty: body.qty,
      type: body.type as any,
      limitPrice: body.limit_price,
    });

    // Save to local audit log
    await fastify.db.query(
      `INSERT INTO orders (id, user_id, symbol, side, qty, status, platform, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
      [order.id, user.id, order.symbol, order.side, order.qty, order.status, 'alpaca']
    );

    // Invalidate portfolio cache
    await fastify.redis.del(`portfolio:summary:${user.id}`);
    await fastify.redis.del(`portfolio:${user.id}`);

    // Award XP for trading
    await fastify.db.query('UPDATE users SET xp = xp + 10 WHERE id = $1', [user.id]);

    // Push WS event
    await fastify.redis.publish(`ws:${user.id}`, JSON.stringify({
      type: 'order.update',
      payload: order,
      timestamp: new Date().toISOString(),
    }));

    return reply.status(201).send({ data: order });
  });

  // ---- DELETE /portfolio/orders/:id ----
  fastify.delete('/orders/:id', { preHandler: requirePlatform }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await fastify.alpaca.cancelOrder(id);
    return { data: { cancelled: true, orderId: id } };
  });
}
