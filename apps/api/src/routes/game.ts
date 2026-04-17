// ============================================
// FEDGE 2.O — Gamification Routes
// apps/api/src/routes/game.ts
// ============================================

import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

export async function gameRoutes(fastify: FastifyInstance) {

  fastify.addHook('onRequest', async (request, reply) => {
    try { await request.jwtVerify(); }
    catch { reply.status(401).send({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Auth required.' }); }
  });

  // ---- GET /game/profile ----
  fastify.get('/profile', async (request) => {
    const user = request.user as { id: string };

    const cached = await fastify.redis.get(`gameprofile:${user.id}`);
    if (cached) return { data: JSON.parse(cached) };

    const { rows } = await fastify.db.query(
      `SELECT u.id, u.xp, u.level, u.streak_days, u.tier,
              ARRAY_AGG(DISTINCT ub.badge_id) FILTER (WHERE ub.badge_id IS NOT NULL) as badges,
              sm.squad_id
       FROM users u
       LEFT JOIN user_badges ub ON ub.user_id = u.id
       LEFT JOIN squad_members sm ON sm.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, sm.squad_id`,
      [user.id]
    );

    const u = rows[0];

    // Get global rank from Redis leaderboard
    const rank = await fastify.redis.zRevRank('leaderboard:global:week', user.id);

    // Calculate XP to next level
    const xpNextLevel = Math.pow(u.level, 2) * 100;

    const profile = {
      userId: u.id,
      level: u.level,
      xpCurrent: u.xp,
      xpNextLevel,
      xpToday: 0, // calculated separately
      streakDays: u.streak_days,
      badges: u.badges ?? [],
      tier: u.tier,
      unlockedFeatures: getUnlockedFeatures(u.level, u.tier),
      rank: rank !== null ? rank + 1 : null,
      squadId: u.squad_id ?? null,
    };

    await fastify.redis.set(`gameprofile:${user.id}`, JSON.stringify(profile), { EX: 60 });
    return { data: profile };
  });

  // ---- GET /leaderboards/global ----
  fastify.get('/leaderboard/global', async (request) => {
    const user = request.user as { id: string };

    // Get top 100 from Redis sorted set
    const entries = await fastify.redis.zRangeWithScores('leaderboard:global:week', 0, 99, { REV: true });

    const formatted = entries.map((e, idx) => ({
      rank: idx + 1,
      displayName: `Trader #${Math.floor(Math.random() * 9999)}`, // anonymized
      weekReturnPct: parseFloat(e.score.toFixed(2)),
      badge: null,
      isCurrentUser: e.value === user.id,
    }));

    // Ensure current user is in results (even if outside top 100)
    const userInList = formatted.some(e => e.isCurrentUser);
    if (!userInList) {
      const userRank = await fastify.redis.zRevRank('leaderboard:global:week', user.id);
      const userScore = await fastify.redis.zScore('leaderboard:global:week', user.id);
      if (userRank !== null && userScore !== null) {
        formatted.push({
          rank: userRank + 1,
          displayName: 'You',
          weekReturnPct: parseFloat(userScore.toFixed(2)),
          badge: null,
          isCurrentUser: true,
        });
      }
    }

    return { data: { entries: formatted, week: getCurrentWeekLabel() } };
  });

  // ---- GET /game/squads/:id ----
  fastify.get('/squads/:id', async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    const { rows } = await fastify.db.query(
      `SELECT s.*, sm.user_id as member_id, sm.joined_at
       FROM squads s
       JOIN squad_members sm ON sm.squad_id = s.id
       WHERE s.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return reply.status(404).send({ statusCode: 404, code: 'NOT_FOUND', message: 'Squad not found.' });
    }

    const squad = rows[0];
    const members = rows.map(r => ({
      userId: r.member_id,
      displayName: r.member_id === user.id ? 'You' : `Trader #${r.member_id.slice(-4)}`,
      joinedAt: r.joined_at,
      weekReturnPct: 0, // populated from Redis
    }));

    return { data: { id: squad.id, name: squad.name, inviteCode: squad.invite_code, members, maxMembers: squad.max_members } };
  });

  // ---- POST /squads ----
  fastify.post('/squads', async (request, reply) => {
    const user = request.user as { id: string; tier: string };

    if (user.tier !== 'pro') {
      return reply.status(403).send({
        statusCode: 403, code: 'TIER_REQUIRED',
        message: 'Squad creation requires FEDGE Pro.',
      });
    }

    const { name, max_members = 5 } = request.body as { name: string; max_members?: number };

    if (!name || name.length > 50) {
      return reply.status(400).send({ statusCode: 400, code: 'INVALID_REQUEST', message: 'Name required (max 50 chars).' });
    }

    const squadId = `sqd_${nanoid(12)}`;
    const inviteCode = nanoid(6).toUpperCase();

    await fastify.db.query(
      'INSERT INTO squads (id, name, invite_code, created_by, max_members) VALUES ($1,$2,$3,$4,$5)',
      [squadId, name, inviteCode, user.id, Math.min(Math.max(max_members, 2), 6)]
    );
    await fastify.db.query(
      'INSERT INTO squad_members (squad_id, user_id) VALUES ($1,$2)',
      [squadId, user.id]
    );

    return reply.status(201).send({
      data: { id: squadId, name, inviteCode, createdBy: user.id, maxMembers: max_members },
    });
  });

  // ---- POST /squads/join ----
  fastify.post('/squads/join', async (request, reply) => {
    const user = request.user as { id: string };
    const { invite_code } = request.body as { invite_code: string };

    const { rows } = await fastify.db.query(
      'SELECT s.*, COUNT(sm.user_id) as member_count FROM squads s LEFT JOIN squad_members sm ON sm.squad_id = s.id WHERE s.invite_code = $1 GROUP BY s.id',
      [invite_code.toUpperCase()]
    );

    if (rows.length === 0) {
      return reply.status(404).send({ statusCode: 404, code: 'NOT_FOUND', message: 'Invalid invite code.' });
    }

    const squad = rows[0];
    if (Number(squad.member_count) >= squad.max_members) {
      return reply.status(409).send({ statusCode: 409, code: 'SQUAD_FULL', message: 'Squad is full.' });
    }

    await fastify.db.query(
      'INSERT INTO squad_members (squad_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [squad.id, user.id]
    );

    return { data: { joined: true, squadId: squad.id, squadName: squad.name } };
  });
}

function getUnlockedFeatures(level: number, tier: string): string[] {
  const features: string[] = ['basic_signals', 'daily_missions'];
  if (level >= 3) features.push('squad_join');
  if (level >= 5) features.push('extended_history');
  if (level >= 8) features.push('crypto_trading');
  if (tier === 'pro') features.push('unlimited_signals', 'advisor_chat', 'squad_creation', 'pro_signals', 'early_signals');
  if (level >= 12 && tier === 'pro') features.push('options_trading');
  return features;
}

function getCurrentWeekLabel(): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  return monday.toISOString().split('T')[0];
}
