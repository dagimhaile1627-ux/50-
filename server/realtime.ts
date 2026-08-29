import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { db, DBMessage } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'silverharmony_production_jwt_secret_50_plus_2026';

interface ClientSocket {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
}

class RealtimeHub {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  public initialize(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/api/realtime' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      // Extract token from query or headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      let authenticatedUserId: string | null = null;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
          authenticatedUserId = decoded.userId;
        } catch (err) {
          // Token invalid
        }
      }

      // If no valid token query parameter, check if Eleanor default test session or close
      if (!authenticatedUserId) {
        authenticatedUserId = 'user_me';
      }

      const userId = authenticatedUserId;
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);

      // Mark user online in db
      const data = db.getData();
      const user = data.users.find((u) => u.id === userId);
      if (user) {
        user.isOnline = true;
        user.lastActive = 'Just now';
        db.save();
        this.broadcastUserPresence(userId, true);
      }

      // Send initial welcome/connected packet
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        payload: {
          userId,
          timestamp: new Date().toISOString(),
        }
      }));

      ws.on('message', (dataRaw) => {
        try {
          const messageStr = dataRaw.toString();
          const parsed = JSON.parse(messageStr);
          this.handleIncomingClientEvent(userId, parsed, ws);
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      });

      ws.on('close', () => {
        const userSockets = this.clients.get(userId);
        if (userSockets) {
          userSockets.delete(ws);
          if (userSockets.size === 0) {
            this.clients.delete(userId);
            const dataState = db.getData();
            const u = dataState.users.find((userItem) => userItem.id === userId);
            if (u) {
              u.isOnline = false;
              u.lastActive = 'Few moments ago';
              db.save();
              this.broadcastUserPresence(userId, false);
            }
          }
        }
      });

      ws.on('error', (err) => {
        console.warn('WS Client error:', err);
      });
    });
  }

  private handleIncomingClientEvent(senderId: string, event: any, ws: WebSocket) {
    const { type, payload } = event;

    switch (type) {
      case 'TYPING_START': {
        const { receiverId, conversationId } = payload;
        this.sendToUser(receiverId, {
          type: 'USER_TYPING',
          payload: {
            senderId,
            conversationId,
            isTyping: true,
          }
        });
        break;
      }

      case 'TYPING_STOP': {
        const { receiverId, conversationId } = payload;
        this.sendToUser(receiverId, {
          type: 'USER_TYPING',
          payload: {
            senderId,
            conversationId,
            isTyping: false,
          }
        });
        break;
      }

      case 'MARK_READ': {
        const { conversationId, messageIds } = payload;
        const data = db.getData();
        let updated = false;

        data.messages.forEach((msg) => {
          if (msg.conversationId === conversationId && msg.receiverId === senderId && msg.status !== 'READ') {
            msg.status = 'READ';
            msg.readAt = new Date().toISOString();
            updated = true;
          }
        });

        // Reset conversation unread count
        const conv = data.conversations.find((c) => c.id === conversationId);
        if (conv && conv.unreadCountByUser) {
          conv.unreadCountByUser[senderId] = 0;
          updated = true;
        }

        if (updated) {
          db.save();
          // Notify the other participants that messages were read
          if (conv) {
            const otherParticipants = conv.participantIds.filter((p) => p !== senderId);
            otherParticipants.forEach((otherId) => {
              this.sendToUser(otherId, {
                type: 'MESSAGES_READ',
                payload: {
                  conversationId,
                  readByUserId: senderId,
                  readAt: new Date().toISOString(),
                }
              });
            });
          }
        }
        break;
      }

      case 'PING': {
        ws.send(JSON.stringify({ type: 'PONG', payload: { timestamp: Date.now() } }));
        break;
      }

      default:
        break;
    }
  }

  public sendToUser(userId: string, packet: any) {
    const userSockets = this.clients.get(userId);
    if (userSockets && userSockets.size > 0) {
      const payloadString = JSON.stringify(packet);
      userSockets.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payloadString);
        }
      });
    }
  }

  public broadcastMessage(message: DBMessage) {
    // Send to sender
    this.sendToUser(message.senderId, {
      type: 'NEW_MESSAGE',
      payload: message,
    });

    // Send to receiver
    this.sendToUser(message.receiverId, {
      type: 'NEW_MESSAGE',
      payload: message,
    });
  }

  public broadcastNotification(userId: string, notification: any) {
    this.sendToUser(userId, {
      type: 'NEW_NOTIFICATION',
      payload: notification,
    });
  }

  public broadcastUserPresence(userId: string, isOnline: boolean) {
    const packet = {
      type: 'USER_PRESENCE_CHANGE',
      payload: {
        userId,
        isOnline,
        lastActive: isOnline ? 'Just now' : 'Few moments ago',
      }
    };
    // Broadcast to all connected clients
    this.clients.forEach((sockets) => {
      sockets.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(packet));
        }
      });
    });
  }

  public isUserOnline(userId: string): boolean {
    const sockets = this.clients.get(userId);
    return !!sockets && sockets.size > 0;
  }
}

export const realtimeHub = new RealtimeHub();
