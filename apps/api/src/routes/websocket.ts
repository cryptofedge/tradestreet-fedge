// ============================================
// FEDGE 2.O — WebSocket Routes
// apps/api/src/routes/websocket.ts
// ============================================

import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';

interface WsClient {
  userId: string;
  socket: WebSocket;
  subscriptions: Set<string>;
}

const clients = new Map<string, WsClient>();

export async function wsRoutes(fastify: FastifyInstance) {

  fastify.get('/connect', { websocket: true }, async (socket, request) => {
    // Auth via query param token (WebSocket can't set headers easily)
    const token = (request.query as any).token;
    if (!token) {
      socket.close(4001, 'Missing token');
      return;
    }

    let userId: string;
    try {
      const decoded = fastify.jwt.verify(token) as { id: string };
      userId = decoded.id;
    } catch {
      socket.close(4001, 'Invalid token');
      return;
    }

    const client: WsClient = { userId, socket, subscriptions: new Set() };
    clients.set(userId, client);

    fastify.log.info(`[WS] User ${userId} connected`);

    // Send welcome
    socket.send(JSON.stringify({
      type: 'connected',
      payload: { message: `FEDGE online. Watching markets for you.`, userId },
      timestamp: new Date().toISOString(),
    }));

    // Auto-subscribe to personal channels
    client.subscriptions.add(`signals.${userId}`);
    client.subscriptions.add(`portfolio.${userId}`);
    client.subscriptions.add(`orders.${userId}`);
    client.subscriptions.add(`missions.${userId}`);
    client.subscriptions.add('leaderboard.global');

    // Handle incoming messages (subscribe/unsubscribe)
    socket.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === 'subscribe' && msg.channel) {
          client.subscriptions.add(msg.channel);
          socket.send(JSON.stringify({
            type: 'subscribed',
            payload: { channel: msg.channel },
            timestamp: new Date().toISOString(),
          }));
        }

        if (msg.type === 'unsubscribe' && msg.channel) {
          client.subscriptions.delete(msg.channel);
        }

        if (msg.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    socket.on('close', () => {
      clients.delete(userId);
      fastify.log.info(`[WS] User ${userId} disconnected`);
    });

    socket.on('error', (err) => {
      fastify.log.error(`[WS] Error for ${userId}: ${err.message}`);
      clients.delete(userId);
    });

    // Subscribe to Redis pub/sub for this user
    const subscriber = fastify.redis.duplicate();
    await subscriber.subscribe(`ws:${userId}`, (message) => {
      if (socket.readyState === 1) { // OPEN
        socket.send(message);
      }
    });

    // Subscribe to global leaderboard channel
    await subscriber.subscribe('ws:leaderboard', (message) => {
      if (socket.readyState === 1 && client.subscriptions.has('leaderboard.global')) {
        socket.send(message);
      }
    });

    socket.on('close', async () => {
      await subscriber.unsubscribe();
      await subscriber.quit();
    });
  });
}

// Utility: broadcast to a specific user
export function pushToUser(userId: string, event: object): void {
  const client = clients.get(userId);
  if (client && client.socket.readyState === 1) {
    client.socket.send(JSON.stringify(event));
  }
}

// Utility: broadcast to all connected users
export function broadcast(event: object): void {
  const message = JSON.stringify(event);
  for (const client of clients.values()) {
    if (client.socket.readyState === 1) {
      client.socket.send(message);
    }
  }
}
