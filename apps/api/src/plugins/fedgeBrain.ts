import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { FedgeBrainService } from '../services/fedgeBrain';

declare module 'fastify' {
  interface FastifyInstance {
    fedgeBrain: FedgeBrainService;
  }
}

export const fedgeBrainPlugin = fp(async (fastify: FastifyInstance) => {
  const brain = new FedgeBrainService();
  fastify.decorate('fedgeBrain', brain);
  fastify.log.info('[FEDGE Brain] Online — claude-sonnet-4-6');
});
