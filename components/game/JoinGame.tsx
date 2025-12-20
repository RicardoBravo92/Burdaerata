"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import JoinGameModal from '@/components/modals/joinGameModal';
import { joinGame } from '@/services/gameService';
import { getErrorMessage, logError } from '@/lib/errorHandler';

export default function JoinGame() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const handleJoinGame = useCallback(async () => {
    setJoinLoading(true);
    try {
      if (!user) {
        toast.error('Usuario no encontrado. Por favor, inicia sesión.', {
          richColors: true,
        });
        return;
      }

      const joinedGame = await joinGame(user.id, code);
      if (joinedGame?.id) {
        toast.success('¡Te uniste al juego exitosamente!', {
          richColors: true,
        });
        router.push(`/game/${joinedGame.id}`);
      } else {
        toast.error('No se pudo unir al juego. Verifica el código.', {
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
  }, [code, user, router]);

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
