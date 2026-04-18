"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { wsClient } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import { SendIcon, MessageCircleIcon } from "lucide-react";
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

interface ChatGameProps {
  players?: GamePlayer[];
  messages?: ChatMessage[];
  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentUserId?: string;
  listenWS?: boolean;
}

export default function ChatGame({ messages: propMessages, setMessages: propSetMessages, currentUserId: propUserId, listenWS = true }: ChatGameProps) {
  const { user } = useUser();
  const userId = propUserId || user?.id;
  const messages = propMessages || [];
  const setMessages = propSetMessages;
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(true);

  const setMessagesRef = useRef(propSetMessages);
  setMessagesRef.current = propSetMessages;

  useEffect(() => {
    if (!listenWS) return;
    
    const handleNewMessage = (data: unknown) => {
      const msg = data as ChatMessage;
      if (setMessagesRef.current) {
        setMessagesRef.current((prev: ChatMessage[]) => {
          return [...prev, msg];
        });
      }
    };

    wsClient.on("new_chat_message", handleNewMessage as any);

    return () => {
      wsClient.off("new_chat_message", handleNewMessage as any);
    };
  }, [listenWS]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(() => {
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
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-3xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white z-10 shadow-sm rounded-t-3xl">
        <div className="bg-[#99184e]/10 p-2 text-[#99184e] rounded-full">
          <MessageCircleIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 leading-tight">Game Chat</h3>
          <p className="text-xs text-green-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
            Live
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 opacity-60">
            <MessageCircleIcon className="w-10 h-10" />
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user.id === userId;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[11px] text-gray-500 font-medium mb-1 ml-1">
                    {msg.user.full_name}
                  </span>
                )}
                <div 
                  className={`
                    px-4 py-2.5 rounded-2xl max-w-[85%] text-sm
                    ${isMe 
                      ? 'bg-[#99184e] text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'}
                  `}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2 bg-gray-100 w-full rounded-full pr-2 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-[#99184e]/20 focus-within:bg-gray-50"
        >
          <input
            type="text"
            className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-sm px-2 py-2 placeholder:text-gray-500 text-gray-800"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            type="submit" 
            size="icon"
            className="rounded-full bg-[#99184e] hover:bg-[#871444] h-9 w-9 flex-shrink-0"
            disabled={!newMessage.trim()}
          >
            <SendIcon className="w-4 h-4 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}