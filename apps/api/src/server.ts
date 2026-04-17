// ============================================
// FEDGE 2.O API — Main Server
// apps/api/src/server.ts
// ============================================

import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyWebsocket from '@fastify/websocket';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

import { authRoutes } from './routes/auth';
import { signalRoutes } from './routes/signals';
import { portfolioRoutes } from './routes/portfolio';
import { missionRoutes } from './routes/missions';
import { gameRoutes } from './routes/game';
import { advisorRoutes } from './routes/advisor';
import { wsRoutes } from './routes/websocket';
import { redisPlugin } from './plugins/redis';
import { dbPlugin } from './plugins/db';
import { alpacaPlugin } from './plugins/alpaca';
import { fedgeBrainPlugin } from './plugins/fedgeBrain';

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

async function buildServer() {
  // ---- PLUGINS ----
  await server.register(fastifyCors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:8081'],
    credentials: true,
  });

  await server.register(fastifyJwt, {
    secret: {
      private: readFileSync(resolve(process.env.JWT_PRIVATE_KEY_PATH!)),
      public: readFileSync(resolve(process.env.JWT_PUBLIC_KEY_PATH!)),
    },
    sign: { algorithm: 'RS256', expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '900' },
  });

  await server.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.user?.id ?? request.ip,
    errorResponseBuilder: () => ({
      statusCode: 429,
      code: 'RATE_LIMIT',
      message: 'Too many requests. Check X-RateLimit-Reset header.',
    }),
  });

  await server.register(fastifyWebsocket);

  // ---- INTERNAL PLUGINS ----
  await server.register(dbPlugin);
  await server.register(redisPlugin);
  await server.register(alpacaPlugin);
  await server.register(fedgeBrainPlugin);

  // ---- ROUTES ----
  await server.register(authRoutes, { prefix: '/v2/auth' });
  await server.register(signalRoutes, { prefix: '/v2/signals' });
  await server.register(portfolioRoutes, { prefix: '/v2/portfolio' });
  await server.register(missionRoutes, { prefix: '/v2/missions' });
  await server.register(gameRoutes, { prefix: '/v2/game' });
  await server.register(advisorRoutes, { prefix: '/v2/advisor' });
  await server.register(wsRoutes, { prefix: '/v2/stream' });

  // ---- HEALTH ----
  server.get('/health', async () => ({
    status: 'ok',
    version: process.env.APP_VERSION ?? '2.0.1',
    brain: 'FEDGE 2.O',
    author: 'Rafael Fellito Rodriguez Jr.',
    company: 'Eclat Universe',
  }));

  // ---- ERROR HANDLER ----
  server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);
    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      statusCode,
      code: error.code ?? 'INTERNAL_ERROR',
      message: error.message ?? 'An unexpected error occurred',
    });
  });

  return server;
}

async function start() {
  const app = await buildServer();
  try {
    await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
    console.log(`
╔═══════════════════════════════════════════════╗
║          FEDGE 2.O API — ONLINE               ║
║  Port: ${process.env.PORT ?? 3000}                                   ║
║  Brain: claude-sonnet-4                       ║
║  Author: Rafael Fellito Rodriguez Jr.         ║
║  Brand: Eclat Universe                        ║
╚═══════════════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildServer };
