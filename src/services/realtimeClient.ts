type RealtimeEventHandler = (data: any) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<RealtimeEventHandler>> = new Map();
  private reconnectTimeout: any = null;
  private pingInterval: any = null;
  private isConnecting: boolean = false;

  public connect(token?: string) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const authToken = token || localStorage.getItem('silverharmony_jwt_token') || '';
    const url = `${protocol}//${host}/api/realtime?token=${encodeURIComponent(authToken)}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.emit('STATUS_CHANGE', { isConnected: true });

        // Start ping heartbeat
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type) {
            this.emit(packet.type, packet.payload);
          }
        } catch (err) {
          console.error('Error parsing WS event:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.emit('STATUS_CHANGE', { isConnected: false });
        if (this.pingInterval) clearInterval(this.pingInterval);
        
        // Auto-reconnect after 3 seconds
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('Realtime WS error:', err);
      };
    } catch (err) {
      this.isConnecting = false;
      console.error('WebSocket connection initialization error:', err);
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public send(type: string, payload: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  public sendTypingStart(receiverId: string, conversationId: string) {
    this.send('TYPING_START', { receiverId, conversationId });
  }

  public sendTypingStop(receiverId: string, conversationId: string) {
    this.send('TYPING_STOP', { receiverId, conversationId });
  }

  public sendMarkRead(conversationId: string) {
    this.send('MARK_READ', { conversationId });
  }

  public on(event: string, handler: RealtimeEventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.off(event, handler);
    };
  }

  public off(event: string, handler: RealtimeEventHandler) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  private emit(event: string, payload: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`Error in realtime listener for ${event}:`, err);
        }
      });
    }
  }
}

export const realtimeClient = new RealtimeClient();
