"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { createGameAction } from "@/lib/actions/game.actions";
import { logError } from "@/lib/errorHandler";
import { GAME_CONSTANTS } from "@/constants/gamesettings";
import { GameSettingsSection, GameSettings } from "@/components/game/GameSettings";
import { useAuth } from "@clerk/nextjs";
import { useGame } from "@/providers/GameProvider";

export interface UseCreateGameReturn {
  settings: GameSettings;
  createLoading: boolean;
  showSettings: boolean;
  updateSetting: (key: keyof GameSettings, value: number) => void;
  handleCreateGame: () => Promise<void>;
  toggleSettings: () => void;
  ButtonComponent: React.ReactNode;
  SettingsComponent: React.ReactNode;
}

export function useCreateGame(): UseCreateGameReturn {
  const router = useRouter();
  useAuth();
  const { setGame, setPlayers } = useGame();
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

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

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
    const validationError = validateGameSettings();
    if (validationError) {
      toast.error(validationError, { richColors: true });
      return;
    }

    setCreateLoading(true);
    try {
      const newGame = await createGameAction(
        settings.maxPlayers,
        settings.scoreToWin
      );

      if (!newGame?.id) {
        throw new Error("Failed to create game: No game ID returned");
      }

      setGame(newGame);
      setPlayers([]);
      router.push(`/game/${newGame.id}`);
    } catch (error) {
      logError(error, "handleCreateGame");
      toast.error("Failed to create game. Please try again.", {
        richColors: true,
      });
    } finally {
      setCreateLoading(false);
    }
  }, [settings, router, validateGameSettings, setGame, setPlayers]);

  const ButtonComponent = (
    <Button size="lg" onClick={handleCreateGame} disabled={createLoading}>
      {createLoading ? <Loader2 className="animate-spin" /> : null}
      {createLoading ? "Creating..." : "Create Game"}
    </Button>
  );

  const SettingsComponent = showSettings ? (
    <GameSettingsSection
      settings={settings}
      updateSetting={updateSetting}
    />
  ) : null;

  return {
    settings,
    createLoading,
    showSettings,
    updateSetting,
    handleCreateGame,
    toggleSettings,
    ButtonComponent,
    SettingsComponent,
  };
}

export default function CreateGame() {
  const {
    showSettings,
    toggleSettings,
    ButtonComponent,
    SettingsComponent,
  } = useCreateGame();

  return (
    <Item variant="outline" className="rounded-3xl p-8 md:p-4 shadow-lg">
      <ItemContent>
        <ItemTitle>Create New Game</ItemTitle>
        <ItemDescription>
          Start a new game session and invite your friends to join the fun!
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <Button
          variant="outline"
          onClick={toggleSettings}
          size="lg"
          aria-expanded={showSettings}
        >
          {showSettings ? "Hide Settings" : "Game Settings"}
        </Button>
        {ButtonComponent}
      </ItemActions>

      {SettingsComponent}
    </Item>
  );
}