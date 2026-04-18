import { Game, GamePlayer, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { SendIcon, MessageCircleIcon } from "lucide-react";

interface Message {
  id: string;
  text: string;
  user: User;
}

interface ChatGameProps {
  messages: Message[];
  currentUserId: string;
}

export default function ChatGame({messages, currentUserId}: ChatGameProps) {    
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (message.trim()) {
      // Add your logic to send the message here
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white z-10 shadow-sm relative">
        <div className="bg-indigo-100 p-2 text-indigo-600 rounded-full">
          <MessageCircleIcon className="w-5 h-5 fill-current opacity-20" />
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
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative custom-scrollbar"
      >
        {messages && messages.length > 0 ? (
          messages.map((msg: Message) => {
            const isMe = msg.user.id === currentUserId;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {!isMe && (
                  <span className="text-[11px] text-gray-500 font-medium mb-1 ml-1 px-1">
                    {msg.user.full_name || "Unknown"}
                  </span>
                )}
                <div 
                  className={`
                    px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm
                    ${isMe 
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-200' 
                      : 'bg-white text-gray-800 rounded-tl-sm border border-slate-200 shadow-slate-200'}
                  `}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 opacity-60">
            <MessageCircleIcon className="w-10 h-10" />
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form 
          onSubmit={sendMessage}
          className="flex items-center gap-2 bg-slate-100 w-full rounded-full pr-2 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-indigo-50 transition-all shadow-inner overflow-hidden"
        >
          <input
            type="text"
            className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-sm px-2 py-2 placeholder:text-slate-500 text-slate-800"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            type="submit" 
            size="icon"
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-9 w-9 flex-shrink-0 shadow-md shadow-indigo-200 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            disabled={!message.trim()}
          >
            <SendIcon className="w-4 h-4 text-white ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}