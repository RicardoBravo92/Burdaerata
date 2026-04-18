'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import ChatGame from './ChatGame';
import { useEffect, useState, useRef } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  user: {
    id: string;
    full_name: string;
  };
}

interface ChatModalProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setUnread?: React.Dispatch<React.SetStateAction<number>>;
  currentUserId?: string;
}

export default function ChatModal({ messages, setMessages, setUnread, currentUserId }: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMsgCountRef = useRef(messages.length);

  useEffect(() => {
    if (!isOpen && messages.length > prevMsgCountRef.current) {
      setUnreadCount((prev) => prev + 1);
      if (setUnread) setUnread((p) => p + 1);
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, isOpen, setUnread]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      if (setUnread) setUnread(0);
    }
  }, [isOpen, setUnread]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='mr-2 my-2 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-600 lg:hidden shadow-md relative'>
          <MessageCircle className="w-5 h-5"/>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md p-0 h-[70vh] w-[95vw] sm:w-[90vw] rounded-3xl overflow-hidden flex flex-col border-none'>
        <ChatGame messages={messages} setMessages={setMessages} currentUserId={currentUserId} listenWS={false} />
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="absolute top-3.5 right-4 z-[60] rounded-full w-8 h-8 bg-slate-100 hover:bg-slate-200 shadow-sm border border-slate-200">
            <X className="w-4 h-4 text-slate-500" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}