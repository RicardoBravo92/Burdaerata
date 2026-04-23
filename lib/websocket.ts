export type WebSocketEvent =
  | "player_joined"
  | "player_left"
  | "game_started"
  | "new_round"
  | "answer_submitted"
  | "round_finished"
  | "game_finished"
  | "game_deleted"
  | "new_chat_message"
  | "send_chat_message";

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: unknown;
}

type EventHandler = (data: unknown) => void;

const WS_BASE_URL =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws")) ||
  "ws://localhost:8000";

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<WebSocketEvent, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private gameId: string | null = null;
  private token: string | null = null;
  private visibilityHandler: (() => void) | null = null;

  connect(gameId: string, token: string) {
    this.gameId = gameId;
    this.token = token;
    this.createConnection();
    
    if (typeof window !== "undefined" && !this.visibilityHandler) {
      this.visibilityHandler = () => {
        if (document.visibilityState === "visible" && this.ws?.readyState !== WebSocket.OPEN) {
          this.reconnectAttempts = 0;
          this.createConnection();
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  private createConnection() {
    if (!this.gameId || !this.token) return;

    const url = `${WS_BASE_URL}/api/v1/ws/${this.gameId}?token=${this.token}`;
    console.log('Creating WebSocket connection to:', url.split('?')[0]);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected!');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      console.log('WS Message received:', event.data);
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(message.event, message.data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed, attempting reconnect...');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.createConnection(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private emit(event: WebSocketEvent, data: unknown) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  on(event: WebSocketEvent, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: WebSocketEvent, handler: EventHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
    this.gameId = null;
    this.token = null;
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
