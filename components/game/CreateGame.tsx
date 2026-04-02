"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { createGameAction } from '@/lib/actions/game.actions';
import { logError } from '@/lib/errorHandler';
import { GAME_CONSTANTS } from '@/constants/gamesettings';
import { GameSettingsSection, GameSettings } from './GameSettings';

export default function CreateGame() {
  const router = useRouter();
  const { user } = useUser();
  const [createLoading, setCreateLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    maxPlayers: GAME_CONSTANTS.DEFAULT_PLAYERS,
    scoreToWin: GAME_CONSTANTS.DEFAULT_SCORE,
  });

  const updateSetting = useCallback(
    (key: keyof GameSettings, value: number) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validateGameSettings = useCallback((): string | null => {
    if (
      settings.maxPlayers < GAME_CONSTANTS.MIN_PLAYERS ||
      settings.maxPlayers > GAME_CONSTANTS.MAX_PLAYERS
    ) {
      return `Player count must be between ${GAME_CONSTANTS.MIN_PLAYERS} and ${GAME_CONSTANTS.MAX_PLAYERS}`;
    }
    if (
      settings.scoreToWin < GAME_CONSTANTS.MIN_SCORE ||
      settings.scoreToWin > GAME_CONSTANTS.MAX_SCORE
    ) {
      return `Score to win must be between ${GAME_CONSTANTS.MIN_SCORE} and ${GAME_CONSTANTS.MAX_SCORE}`;
    }
    return null;
  }, [settings]);

  const handleCreateGame = useCallback(async () => {
    if (!user) {
      toast.error('Usuario no encontrado. Por favor, inicia sesión.', {
        richColors: true,
      });
      return;
    }

    const validationError = validateGameSettings();
    if (validationError) {
      toast.error(validationError, { richColors: true });
      return;
    }

    setCreateLoading(true);
    try {
      const newGame = await createGameAction(
        user.id,
        settings.maxPlayers,
        settings.scoreToWin,
      );

      if (!newGame?.id) {
        throw new Error('Failed to create game: No game ID returned');
      }

      toast.success('¡Juego creado exitosamente!', { richColors: true });
      router.push(`/game/${newGame.id}`);
    } catch (error) {
      logError(error, 'handleCreateGame');
      toast.error('Error al crear el juego. Por favor, intenta de nuevo.', {
        richColors: true,
      });
    } finally {
      setCreateLoading(false);
    }
  }, [user, settings, router, validateGameSettings]);

  return (
    <Item variant='outline' className='rounded-3xl p-8 md:p-4 shadow-lg'>
      <ItemContent>
        <ItemTitle>Create New Game</ItemTitle>
        <ItemDescription>
          Start a new game session and invite your friends to join the fun!
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <Button
          variant='outline'
          onClick={() => setShowSettings((prev) => !prev)}
          size='lg'
          aria-expanded={showSettings}
        >
          {showSettings ? 'Hide Settings' : 'Game Settings'}
        </Button>
        <Button
          size='lg'
          onClick={handleCreateGame}
          disabled={createLoading}
        >
          {createLoading ? 'Creating Game...' : 'Create Game'}
        </Button>
      </ItemActions>

      {showSettings && (
        <GameSettingsSection
          settings={settings}
          updateSetting={updateSetting}
        />
      )}
    </Item>
  );
}
