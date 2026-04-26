import fp from 'fastify-plugin';
import { Pool } from 'pg';
import type { FastifyInstance } from 'fastify';

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

  const client = await pool.connect();
  client.release();
  fastify.log.info('[DB] PostgreSQL connected');

  fastify.decorate('db', pool);
  fastify.addHook('onClose', async () => { await pool.end(); });
});
