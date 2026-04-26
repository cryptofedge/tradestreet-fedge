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
