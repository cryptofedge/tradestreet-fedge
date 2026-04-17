// ============================================
// FEDGE 2.O — Advisor Chat Routes
// apps/api/src/routes/advisor.ts
// ============================================

import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

const PRO_DAILY_LIMIT = Number(process.env.RATE_LIMIT_PRO_ADVISOR_PER_DAY ?? 100);

export async function advisorRoutes(fastify: FastifyInstance) {

  fastify.addHook('onRequest', async (request, reply) => {
    try { await request.jwtVerify(); }
    catch { reply.status(401).send({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Auth required.' }); }
  });

  // ---- POST /advisor/message ----
  fastify.post('/message', async (request, reply) => {
    const user = request.user as { id: string; tier: string };

    // Free tier: no advisor access
    if (user.tier !== 'pro') {
      return reply.status(403).send({
        statusCode: 403,
        code: 'TIER_REQUIRED',
        message: 'FEDGE Advisor requires FEDGE Pro. Upgrade to talk to your AI trading coach.',
      });
    }

    // Daily limit check
    const usageKey = `advisor:usage:${user.id}:${new Date().toDateString()}`;
    const usedToday = Number(await fastify.redis.get(usageKey) ?? 0);
    if (usedToday >= PRO_DAILY_LIMIT) {
      return reply.status(429).send({
        statusCode: 429, code: 'RATE_LIMIT',
        message: `Daily advisor limit (${PRO_DAILY_LIMIT} messages) reached. Resets at midnight ET.`,
      });
    }

    const {
      message,
      session_id,
      stream = false,
      include_portfolio = true,
    } = request.body as {
      message: string;
      session_id?: string;
      stream?: boolean;
      include_portfolio?: boolean;
    };

    if (!message || message.length > 2000) {
      return reply.status(400).send({
        statusCode: 400, code: 'INVALID_REQUEST',
        message: 'Message required (max 2000 chars).',
      });
    }

    // Get or create session
    let sessionId = session_id;
    if (!sessionId) {
      sessionId = `sess_${nanoid(12)}`;
      await fastify.db.query(
        'INSERT INTO advisor_sessions (id, user_id) VALUES ($1, $2)',
        [sessionId, user.id]
      );
    }

    // Load conversation history
    const { rows: historyRows } = await fastify.db.query(
      `SELECT role, content FROM advisor_messages
       WHERE session_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [sessionId]
    );
    const history = historyRows.reverse().map(r => ({
      id: nanoid(),
      role: r.role as 'user' | 'assistant',
      content: r.content,
      timestamp: new Date().toISOString(),
    }));

    // Build portfolio context
    let context: any = {
      portfolio: { totalValue: 0, cash: 0, buyingPower: 0, dayPnl: { amount: 0, percent: 0 }, totalPnl: { amount: 0, percent: 0 }, positionsCount: 0, platform: 'alpaca', lastSynced: new Date().toISOString() },
      positions: [],
      recentSignals: [],
      userProfile: { xp: 0, level: 1, streakDays: 0, badges: [] },
    };

    if (include_portfolio) {
      const portfolioRaw = await fastify.redis.get(`portfolio:${user.id}`);
      if (portfolioRaw) {
        const p = JSON.parse(portfolioRaw);
        context.portfolio = p.summary;
        context.positions = p.positions ?? [];
      }
      const { rows: userRows } = await fastify.db.query(
        'SELECT xp, level, streak_days FROM users WHERE id = $1', [user.id]
      );
      if (userRows.length > 0) {
        context.userProfile = {
          xp: userRows[0].xp,
          level: userRows[0].level,
          streakDays: userRows[0].streak_days,
          badges: [],
        };
      }
    }

    // Call FEDGE Brain
    const result = await fastify.fedgeBrain.chat(message, history, context);

    // Save messages
    await fastify.db.query(
      `INSERT INTO advisor_messages (session_id, user_id, role, content) VALUES ($1,$2,'user',$3)`,
      [sessionId, user.id, message]
    );
    await fastify.db.query(
      `INSERT INTO advisor_messages (session_id, user_id, role, content, tokens_used) VALUES ($1,$2,'assistant',$3,$4)`,
      [sessionId, user.id, result.response, result.tokensUsed]
    );

    // Increment usage counter
    await fastify.redis.incr(usageKey);
    await fastify.redis.expire(usageKey, 86400);

    return {
      data: {
        session_id: sessionId,
        response: result.response,
        tokens_used: result.tokensUsed,
        context_injected: result.contextInjected,
        messages_remaining_today: PRO_DAILY_LIMIT - usedToday - 1,
      },
    };
  });

  // ---- GET /advisor/sessions ----
  fastify.get('/sessions', async (request) => {
    const user = request.user as { id: string; tier: string };
    if (user.tier !== 'pro') {
      return { data: { sessions: [] } };
    }

    const { rows } = await fastify.db.query(
      `SELECT id, created_at, updated_at FROM advisor_sessions
       WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 20`,
      [user.id]
    );

    return { data: { sessions: rows } };
  });

  // ---- DELETE /advisor/sessions/:id ----
  fastify.delete('/sessions/:id', async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    await fastify.db.query(
      'DELETE FROM advisor_sessions WHERE id = $1 AND user_id = $2', [id, user.id]
    );

    return { data: { deleted: true } };
  });
}
