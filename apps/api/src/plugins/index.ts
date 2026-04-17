// ============================================
// FEDGE 2.O — Fastify Plugins
// apps/api/src/plugins/
// ============================================

// ---- redis.ts ----
import fp from 'fastify-plugin';
import { createClient, type RedisClientType } from 'redis';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    redis: RedisClientType;
  }
}

export const redisPlugin = fp(async (fastify: FastifyInstance) => {
  const client = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });

  client.on('error', (err) => fastify.log.error(`[Redis] ${err.message}`));
  client.on('connect', () => fastify.log.info('[Redis] Connected'));

  await client.connect();

  fastify.decorate('redis', client as any);
  fastify.addHook('onClose', async () => { await client.quit(); });
});

// ---- db.ts ----
import { Pool } from 'pg';

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
  }
}

export const dbPlugin = fp(async (fastify: FastifyInstance) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => fastify.log.error(`[DB] ${err.message}`));

  // Test connection
  const client = await pool.connect();
  client.release();
  fastify.log.info('[DB] PostgreSQL connected');

  fastify.decorate('db', pool);
  fastify.addHook('onClose', async () => { await pool.end(); });
});

// ---- alpaca.ts ----
import { AlpacaService } from '../services/alpaca';

declare module 'fastify' {
  interface FastifyInstance {
    alpaca: AlpacaService;
  }
}

export const alpacaPlugin = fp(async (fastify: FastifyInstance) => {
  const alpaca = new AlpacaService(
    process.env.ALPACA_API_KEY!,
    process.env.ALPACA_API_SECRET!
  );
  fastify.decorate('alpaca', alpaca);
  fastify.log.info('[Alpaca] Service ready');
});

// ---- fedgeBrain.ts ----
import { FedgeBrainService } from '../services/fedgeBrain';

declare module 'fastify' {
  interface FastifyInstance {
    fedgeBrain: FedgeBrainService;
  }
}

export const fedgeBrainPlugin = fp(async (fastify: FastifyInstance) => {
  const brain = new FedgeBrainService();
  fastify.decorate('fedgeBrain', brain);
  fastify.log.info('[FEDGE Brain] Online — claude-sonnet-4');
});
