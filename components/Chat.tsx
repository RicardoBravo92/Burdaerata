"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { wsClient } from "@/lib/websocket";
import { SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import type { GamePlayer } from "@/lib/types";

interface ChatMessage {
  id: string;
  text: string;
  user: {
    id: string;
    full_name: string;
  };
  created_at?: string;
}

interface ChatProps {
  players: GamePlayer[];
}

export default function Chat({ players }: ChatProps) {
  const { user } = useUser();
  const userId = user?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewMessage = (data: unknown) => {
      const msg = data as ChatMessage;
      setMessages((prev) => [...prev, msg]);
    };

    wsClient.on("new_chat_message", handleNewMessage as any);

    return () => {
      wsClient.off("new_chat_message", handleNewMessage as any);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    wsClient.send({
      event: "send_chat_message",
      data: { text: newMessage.trim() },
    });
    setNewMessage("");
  }, [newMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-3xl shadow-lg">
      <div className="p-4 border-b rounded-t-3xl">
        <h3 className="font-semibold text-gray-800">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">
            No messages yet. Say hi!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.user.id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.user.id === userId
                    ? "bg-[#99184e] text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.user.id !== userId && (
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {msg.user.full_name}
                  </p>
                )}
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#99184e] text-sm"
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="rounded-full"
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}