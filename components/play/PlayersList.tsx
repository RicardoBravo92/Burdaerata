'use client';

import { GamePlayer, Round } from '@/lib/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Users } from 'lucide-react';

interface PlayersListProps {
  players: GamePlayer[];
  currentRound: Round;
  currentUserId: string | undefined;
}

const StarIcon = () => <span className='text-2xl'>⭐</span>;

export default function PlayersListModal({
  players,
  currentRound,
  currentUserId,
}: PlayersListProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='mx-auto my-2 bg-blue-400'>
          <Users />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle> Players ({players.length})</DialogTitle>
          <DialogDescription>Current scores</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col space-y-3 pb-4'>
          {players.map((item) => (
            <div
              key={item.id}
              className={`
                flex items-center px-4 py-3 rounded-2xl
                ${
                  item.user_id === currentRound?.judge_user_id
                    ? 'bg-yellow-100 border border-yellow-400'
                    : item.user_id === currentUserId
                    ? 'bg-blue-100 border border-blue-400'
                    : 'bg-gray-100 border border-gray-300'
                }
                flex-shrink-0 transition-all hover:shadow-md
              `}
            >
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-gray-800'>
                  {item.user?.full_name || item.profile?.full_name || 'Unknown'}
                </span>
                {item.user_id === currentUserId && (
                  <span className='text-blue-600 font-bold'>(You)</span>
                )}
                {item.user_id === currentRound?.judge_user_id && <StarIcon />}
                <div className='bg-white px-2 py-1 rounded-full ml-2'>
                  <span className='text-gray-700 font-bold text-xs'>
                    {item.score || 0} Pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
