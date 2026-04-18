"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { logError, getErrorMessage } from "@/lib/errorHandler";
import type { GamePlayer } from "@/lib/types";

export interface ChatMessage {
  id: string;
  text: string;
  user: {
    id: string;
    full_name: string;
  };
  created_at?: string;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (text: string) => void;
}

export function useChat(gameId: string, currentUserId: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!gameId || !currentUserId) return;

    async function connectWebSocket() {
      try {
        const token = await fetch("/api/v1/auth/token").then(r => r.json());
        if (!token.access_token) return;

        const ws = new WebSocket(
          `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/v1/ws/${gameId}?token=${token.access_token}`
        );

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "new_chat_message") {
              setMessages((prev) => [...prev, data.data]);
            }
          } catch (e) {
            console.error("Error parsing WS message:", e);
          }
        };

        ws.onerror = (error) => {
          logError(error, "chat_ws");
        };

        wsRef.current = ws;
      } catch (error) {
        logError(error, "connect_chat_ws");
      }
    }

    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, [gameId, currentUserId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !wsRef.current) return;

      wsRef.current.send(JSON.stringify({
        event: "send_chat_message",
        data: { text: text.trim() },
      }));
    },
    []
  );

  return {
    messages,
    loading,
    sendMessage,
  };
}