// ============================================
// FEDGE 2.O — Auth Routes
// apps/api/src/routes/auth.ts
// ============================================

import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export async function authRoutes(fastify: FastifyInstance) {

  // ---- POST /auth/register ----
  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password || password.length < 8) {
      return reply.status(400).send({
        statusCode: 400, code: 'INVALID_REQUEST',
        message: 'Email and password (min 8 chars) required.',
      });
    }

    const existing = await fastify.db.query(
      'SELECT id FROM users WHERE email = $1', [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return reply.status(409).send({
        statusCode: 409, code: 'EMAIL_EXISTS',
        message: 'Account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await fastify.db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, tier, platform_connected, xp, level, streak_days, created_at`,
      [email.toLowerCase(), passwordHash]
    );
    const user = rows[0];

    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email, tier: user.tier },
      { expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '900' }
    );
    const refreshToken = `rt_${nanoid(48)}`;

    // Store refresh token in Redis (30 days TTL)
    await fastify.redis.set(`refresh:${refreshToken}`, user.id, { EX: 2592000 });

    return reply.status(201).send({
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900,
        user: {
          id: user.id,
          email: user.email,
          tier: user.tier,
          platformConnected: user.platform_connected,
          xp: user.xp,
          level: user.level,
          streakDays: user.streak_days,
        },
      },
    });
  });

  // ---- POST /auth/login ----
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    const { rows } = await fastify.db.query(
      `SELECT id, email, password_hash, tier, platform, platform_connected,
              xp, level, streak_days, last_active_date
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return reply.status(401).send({
        statusCode: 401, code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return reply.status(401).send({
        statusCode: 401, code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // Update streak
    const today = new Date().toDateString();
    const lastActive = user.last_active_date ? new Date(user.last_active_date).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = user.streak_days;

    if (lastActive === yesterday) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1;
    }

    await fastify.db.query(
      'UPDATE users SET streak_days = $1, last_active_date = NOW() WHERE id = $2',
      [newStreak, user.id]
    );

    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email, tier: user.tier },
    );
    const refreshToken = `rt_${nanoid(48)}`;
    await fastify.redis.set(`refresh:${refreshToken}`, user.id, { EX: 2592000 });

    return {
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900,
        user: {
          id: user.id,
          email: user.email,
          tier: user.tier,
          platform: user.platform,
          platformConnected: user.platform_connected,
          xp: user.xp,
          level: user.level,
          streakDays: newStreak,
        },
      },
    };
  });

  // ---- POST /auth/refresh ----
  fastify.post('/refresh', async (request, reply) => {
    const { refresh_token } = request.body as { refresh_token: string };

    const userId = await fastify.redis.get(`refresh:${refresh_token}`);
    if (!userId) {
      return reply.status(401).send({
        statusCode: 401, code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token expired or invalid.',
      });
    }

    const { rows } = await fastify.db.query(
      'SELECT id, email, tier FROM users WHERE id = $1', [userId]
    );
    if (rows.length === 0) {
      return reply.status(401).send({ statusCode: 401, code: 'USER_NOT_FOUND', message: 'User not found.' });
    }

    const user = rows[0];
    const accessToken = fastify.jwt.sign({ id: user.id, email: user.email, tier: user.tier });
    const newRefreshToken = `rt_${nanoid(48)}`;

    // Rotate refresh token
    await fastify.redis.del(`refresh:${refresh_token}`);
    await fastify.redis.set(`refresh:${newRefreshToken}`, user.id, { EX: 2592000 });

    return { data: { access_token: accessToken, refresh_token: newRefreshToken, expires_in: 900 } };
  });

  // ---- POST /auth/platform/connect ----
  fastify.post('/platform/connect', {
    onRequest: [async (request, reply) => {
      try { await request.jwtVerify(); }
      catch { reply.status(401).send({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Auth required.' }); }
    }]
  }, async (request, reply) => {
    const user = request.user as { id: string };
    const { platform, oauth_code, redirect_uri } = request.body as {
      platform: string; oauth_code: string; redirect_uri: string;
    };

    // In production: exchange oauth_code for brokerage token via platform's OAuth endpoint
    // For Alpaca: POST https://api.alpaca.markets/oauth/token
    // Store encrypted token in users.platform_token_enc

    // Mock successful connection for dev
    await fastify.db.query(
      'UPDATE users SET platform = $1, platform_connected = true WHERE id = $2',
      [platform, user.id]
    );

    return {
      data: {
        platform_connected: true,
        platform,
        scope: ['read', 'trade'],
        message: `FEDGE connected to ${platform}. I'm watching your portfolio now.`,
      },
    };
  });

  // ---- POST /auth/logout ----
  fastify.post('/logout', {
    onRequest: [async (request, reply) => {
      try { await request.jwtVerify(); }
      catch { return; }
    }]
  }, async (request, reply) => {
    const { refresh_token } = request.body as { refresh_token?: string };
    if (refresh_token) {
      await fastify.redis.del(`refresh:${refresh_token}`);
    }
    return { data: { message: 'Logged out.' } };
  });
}
