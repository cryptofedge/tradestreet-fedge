import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
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
