"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import JoinGameModal from '@/components/modals/joinGameModal';
import { joinGameAction } from '@/lib/actions/game.actions';
import { getErrorMessage, logError } from '@/lib/errorHandler';

export default function JoinGame() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const handleJoinGame = useCallback(async () => {
    setJoinLoading(true);
    try {
      const joinedGame = await joinGameAction(code);
      if (joinedGame?.id) {
        toast.success('Joined game successfully!', {
          richColors: true,
        });
        router.push(`/game/${joinedGame.id}`);
      } else {
        toast.error('Failed to join game. Check the code.', {
          richColors: true,
        });
        setCode('');
      }
    } catch (error) {
      logError(error, 'handleJoinGame');
      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setJoinLoading(false);
    }
  }, [code, router]);

  return (
    <Item
      variant='outline'
      className='bg-white rounded-3xl p-8 md:p-4 shadow-lg'
    >
      <ItemContent>
        <ItemTitle>Join Game</ItemTitle>
        <ItemDescription>
          Enter a game code to join an existing game
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <JoinGameModal
          code={code}
          setCode={setCode}
          handleJoinGame={handleJoinGame}
          joinLoading={joinLoading}
        />
      </ItemActions>
    </Item>
  );
}
