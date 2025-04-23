import { FastifyPluginAsync } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyWebsocket);

  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const userId = (req.user as { id: number })?.id;
    if (!userId) {
      connection.socket.close();
      return;
    }

    // Store the connection in a map for the user
    if (!fastify.websocketClients) {
      fastify.decorate('websocketClients', new Map<number, Set<WebSocket>>());
    }

    if (!fastify.websocketClients.has(userId)) {
      fastify.websocketClients.set(userId, new Set());
    }
    fastify.websocketClients.get(userId)!.add(connection.socket);

    connection.socket.on('close', () => {
      fastify.websocketClients.get(userId)!.delete(connection.socket);
      if (fastify.websocketClients.get(userId)!.size === 0) {
        fastify.websocketClients.delete(userId);
      }
    });
  });
};

// Extend Fastify instance types
declare module 'fastify' {
  interface FastifyInstance {
    websocketClients: Map<number, Set<WebSocket>>;
  }
}

export default websocketPlugin;