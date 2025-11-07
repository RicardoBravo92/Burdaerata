"use client";
import { createGame, joinGame } from "@/services/gameService";
import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import JoinGameModal from "@/components/modals/joinGameModal";
import { toast } from "sonner";
import clsx from "clsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
  ItemGroup,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { GAME_CONSTANTS } from "@/constants/gamesettings";

// Types
interface GameSettings {
  maxPlayers: number;
  scoreToWin: number;
}

// Loading Skeleton Component
const GameLoadingSkeleton = memo(() => (
  <div className="flex flex-col space-y-3 items-center justify-center p-6">
    <Skeleton className="h-[276px] w-[340px] md:w-[720px] rounded-xl" />
    <Skeleton className="h-[216px] w-[340px] md:w-[720px] rounded-xl" />
  </div>
));

GameLoadingSkeleton.displayName = "GameLoadingSkeleton";

// Game Settings Component
const GameSettingsSection = memo(
  ({
    settings,
    updateSetting,
  }: {
    settings: GameSettings;
    updateSetting: (key: keyof GameSettings, value: number) => void;
  }) => (
    <ItemFooter className="mb-6  p-4 bg-gray-50 rounded-2xl ">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Max Players: {settings.maxPlayers}
        </Label>
        <input
          type="range"
          min={GAME_CONSTANTS.MIN_PLAYERS}
          max={GAME_CONSTANTS.MAX_PLAYERS}
          value={settings.maxPlayers}
          onChange={(e) =>
            updateSetting("maxPlayers", parseInt(e.target.value))
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          aria-label="Maximum players"
          aria-valuemin={GAME_CONSTANTS.MIN_PLAYERS}
          aria-valuemax={GAME_CONSTANTS.MAX_PLAYERS}
          aria-valuenow={settings.maxPlayers}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{GAME_CONSTANTS.MIN_PLAYERS}</span>
          <span>{GAME_CONSTANTS.MAX_PLAYERS}</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Score to Win: {settings.scoreToWin}
        </label>
        <input
          type="range"
          min={GAME_CONSTANTS.MIN_SCORE}
          max={GAME_CONSTANTS.MAX_SCORE}
          value={settings.scoreToWin}
          onChange={(e) =>
            updateSetting("scoreToWin", parseInt(e.target.value))
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          aria-label="Score to win"
          aria-valuemin={GAME_CONSTANTS.MIN_SCORE}
          aria-valuemax={GAME_CONSTANTS.MAX_SCORE}
          aria-valuenow={settings.scoreToWin}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{GAME_CONSTANTS.MIN_SCORE}</span>
          <span>{GAME_CONSTANTS.MAX_SCORE}</span>
        </div>
      </div>
    </ItemFooter>
  ),
);

GameSettingsSection.displayName = "GameSettingsSection";

export default function HomeTab() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    maxPlayers: GAME_CONSTANTS.DEFAULT_PLAYERS,
    scoreToWin: GAME_CONSTANTS.DEFAULT_SCORE,
  });
  const [showSettings, setShowSettings] = useState(false);

  const updateSetting = useCallback(
    (key: keyof GameSettings, value: number) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
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
      toast.error("Usuario no encontrado. Por favor, inicia sesión.", {
        richColors: true,
      });
      return;
    }

    // Validate settings before API call
    const validationError = validateGameSettings();
    if (validationError) {
      toast.error(validationError, { richColors: true });
      return;
    }

    setCreateLoading(true);
    try {
      const newGame = await createGame(
        user.id,
        settings.maxPlayers,
        settings.scoreToWin,
      );

      if (!newGame?.id) {
        throw new Error("Failed to create game: No game ID returned");
      }

      toast.success("¡Juego creado exitosamente!", { richColors: true });
      router.push(`/game/${newGame.id}`);
    } catch (error) {
      logError(error, "handleCreateGame");
      toast.error("Error al crear el juego. Por favor, intenta de nuevo.", {
        richColors: true,
      });
    } finally {
      setCreateLoading(false);
    }
  }, [user, settings, router, validateGameSettings]);

  const handleJoinGame = useCallback(async () => {
    setJoinLoading(true);
    try {
      if (!user) {
        toast.error("Usuario no encontrado. Por favor, inicia sesión.", {
          richColors: true,
        });
        return;
      }

      const joinedGame = await joinGame(user.id, code);
      if (joinedGame?.id) {
        toast.success("¡Te uniste al juego exitosamente!", {
          richColors: true,
        });
        router.push(`/game/${joinedGame.id}`);
      } else {
        toast.error("No se pudo unir al juego. Verifica el código.", {
          richColors: true,
        });
        setCode("");
      }
    } catch (error) {
      logError(error, "handleJoinGame");

      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setJoinLoading(false);
    }
  }, [code, user, router]);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  if (createLoading || joinLoading) {
    return <GameLoadingSkeleton />;
  }

  const createButtonClasses = clsx(
    "block mx-auto rounded-2xl text-white font-semibold text-lg md:text-sm transition-all duration-200",
    {
      "bg-green-400 cursor-not-allowed": createLoading,
      "bg-green-500 hover:bg-green-600 hover:scale-105": !createLoading,
    },
  );

  return (
    <div className=" items-center justify-center p-6">
      <ItemGroup className="w-full max-w-md md:max-w-2xl lg:max-w-2xl mx-auto flex flex-col gap-6">
        <Item
          variant="outline"
          className="bg-white rounded-3xl p-8 md:p-4 shadow-lg"
        >
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
              className="text-gray-600 hover:text-gray-800 "
              size="lg"
              aria-expanded={showSettings}
            >
              {showSettings ? "Hide Settings" : "Game Settings"}
            </Button>
            <Button
              size="lg"
              className={createButtonClasses}
              onClick={handleCreateGame}
              disabled={createLoading}
              aria-label={
                createLoading ? "Creating game..." : "Create new game"
              }
            >
              {createLoading ? (
                <div className="flex items-center" role="status">
                  <div
                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
                    aria-hidden="true"
                  />
                  Creating Game...
                </div>
              ) : (
                "Create Game"
              )}
            </Button>
          </ItemActions>

          {showSettings && (
            <GameSettingsSection
              settings={settings}
              updateSetting={updateSetting}
            />
          )}
        </Item>
        <Item
          variant="outline"
          className="bg-white rounded-3xl p-8 md:p-4 shadow-lg"
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
      </ItemGroup>
    </div>
  );
}
