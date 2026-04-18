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
import { User } from '@/lib/types';

interface Message {
  id: string;
  text: string;
  user: User;
}

interface ChatModalProps {
  messages: Message[];
  currentUserId: string | undefined;
}

export default function ChatModal({
  messages,
  currentUserId,
}: ChatModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='mr-2 my-2 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-600 lg:hidden shadow-md'>
          <MessageCircle className="w-5 h-5"/>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md p-0 h-[70vh] w-[95vw] sm:w-[90vw] rounded-3xl overflow-hidden flex flex-col border-none'>
        <ChatGame messages={messages} currentUserId={currentUserId || ""} />
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
