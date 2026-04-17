// ============================================
// FEDGE 2.O — Mission Routes
// apps/api/src/routes/missions.ts
// ============================================

import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

export async function missionRoutes(fastify: FastifyInstance) {

  fastify.addHook('onRequest', async (request, reply) => {
    try { await request.jwtVerify(); }
    catch { reply.status(401).send({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Auth required.' }); }
  });

  // ---- GET /missions/daily ----
  fastify.get('/daily', async (request) => {
    const user = request.user as { id: string };
    const today = new Date().toISOString().split('T')[0];

    // Check if missions already generated today
    const { rows: existing } = await fastify.db.query(
      `SELECT * FROM missions
       WHERE user_id = $1
       AND created_at::DATE = $2::DATE
       AND status = 'ACTIVE'
       ORDER BY xp_reward ASC`,
      [user.id, today]
    );

    if (existing.length >= 3) {
      return {
        data: {
          date: today,
          missions: existing.map(formatMission),
          generated_by: 'FEDGE Brain v2',
        },
      };
    }

    // Get portfolio context for FEDGE Brain
    const portfolioRaw = await fastify.redis.get(`portfolio:${user.id}`);
    const portfolio = portfolioRaw ? JSON.parse(portfolioRaw) : null;

    if (!portfolio) {
      // No portfolio yet — return generic starter missions
      const starterMissions = [
        { type: 'RESEARCH', title: 'Research 2 stocks', description: 'Open and read 2 stock pages in your feed today', xpReward: 50 },
        { type: 'TRADE', title: 'Place your first trade', description: 'Execute any trade using a FEDGE signal', xpReward: 100 },
        { type: 'LEARN', title: 'Complete onboarding', description: 'Finish connecting your brokerage account', xpReward: 200 },
      ];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(5, 59, 59, 0);

      const missions = [];
      for (const m of starterMissions) {
        const id = `msn_${nanoid(12)}`;
        const { rows } = await fastify.db.query(
          `INSERT INTO missions (id, user_id, type, title, description, xp_reward, expires_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [id, user.id, m.type, m.title, m.description, m.xpReward, tomorrow.toISOString()]
        );
        missions.push(rows[0]);
      }

      return { data: { date: today, missions: missions.map(formatMission), generated_by: 'FEDGE Brain v2' } };
    }

    // Generate AI missions
    const context = {
      portfolio: portfolio.summary,
      positions: portfolio.positions ?? [],
      recentSignals: [],
      userProfile: { xp: 0, level: 1, streakDays: 0, badges: [] },
    };

    const generated = await fastify.fedgeBrain.generateDailyMissions(context);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(5, 59, 59, 0);

    const saved = [];
    for (const m of generated) {
      const id = `msn_${nanoid(12)}`;
      const { rows } = await fastify.db.query(
        `INSERT INTO missions (id, user_id, type, title, description, xp_reward, expires_at, generated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [id, user.id, m.type, m.title, m.description, m.xpReward, m.expiresAt, m.generatedBy]
      );
      saved.push(rows[0]);
    }

    return {
      data: {
        date: today,
        missions: saved.map(formatMission),
        generated_by: 'FEDGE Brain v2',
      },
    };
  });

  // ---- POST /missions/:id/complete ----
  fastify.post('/:id/complete', async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    const { rows } = await fastify.db.query(
      `SELECT * FROM missions WHERE id = $1 AND user_id = $2`, [id, user.id]
    );

    if (rows.length === 0) {
      return reply.status(404).send({ statusCode: 404, code: 'NOT_FOUND', message: 'Mission not found.' });
    }

    const mission = rows[0];
    if (mission.status === 'COMPLETED') {
      return reply.status(409).send({ statusCode: 409, code: 'ALREADY_COMPLETED', message: 'Mission already completed.' });
    }

    // Mark complete
    await fastify.db.query(
      `UPDATE missions SET status = 'COMPLETED', completed_at = NOW(), progress = 100 WHERE id = $1`,
      [id]
    );

    // Award XP
    await fastify.db.query(
      `UPDATE users SET xp = xp + $1 WHERE id = $2`, [mission.xp_reward, user.id]
    );
    await fastify.db.query(
      `INSERT INTO xp_events (user_id, amount, reason) VALUES ($1,$2,$3)`,
      [user.id, mission.xp_reward, `Mission completed: ${mission.title}`]
    );

    // Invalidate cached game profile
    await fastify.redis.del(`gameprofile:${user.id}`);

    // Push WS event
    await fastify.redis.publish(`ws:${user.id}`, JSON.stringify({
      type: 'mission.completed',
      payload: { missionId: id, xpAwarded: mission.xp_reward, title: mission.title },
      timestamp: new Date().toISOString(),
    }));

    return {
      data: {
        mission_id: id,
        xp_awarded: mission.xp_reward,
        message: `Mission complete. +${mission.xp_reward} XP.`,
      },
    };
  });
}

function formatMission(m: any) {
  return {
    id: m.id,
    type: m.type,
    title: m.title,
    description: m.description,
    xpReward: m.xp_reward,
    status: m.status,
    progress: m.progress,
    expiresAt: m.expires_at,
    completedAt: m.completed_at ?? null,
    generatedBy: m.generated_by,
  };
}
