"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { startGameAction } from "@/lib/actions/game.actions";
import { logError } from "@/lib/errorHandler";
import type { Game, GamePlayer } from "@/lib/types";

export interface UseLobbyReturn {
  isHost: boolean;
  copied: boolean;
  loading: boolean;
  handleCopyCode: () => Promise<void>;
  handleShareGame: () => Promise<void>;
  handleStartGame: () => Promise<void>;
}

export function useLobby(game: Game, players: GamePlayer[]): UseLobbyReturn {
  const router = useRouter();
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const isHost = game?.host_player_id === user?.id;

  const handleCopyCode = useCallback(async () => {
    if (game?.code) {
      await navigator.clipboard.writeText(game.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [game?.code]);

  const handleShareGame = useCallback(async () => {
    if (!game?.code) return;

    try {
      await navigator.share({
        title: "Join my game!",
        text: `Join my game using this code: ${game.code}`,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        logError(error, "handleShareGame");
      }
    }
  }, [game?.code]);

  const handleStartGame = useCallback(async () => {
    if (players && players.length < 2) {
      toast.warning("You need at least 2 players to start the game", {
        richColors: true,
      });
      return;
    }

    if (!game?.id) {
      toast.error("Game not found", { richColors: true });
      return;
    }

    setLoading(true);
    try {
      await startGameAction(game.id);
      toast.success("Game started!", { richColors: true });
    } catch (error) {
      logError(error, "handleStartGame");
      toast.error("Failed to start game", { richColors: true });
    } finally {
      setLoading(false);
    }
  }, [game?.id, players]);

  return {
    isHost,
    copied,
    loading,
    handleCopyCode,
    handleShareGame,
    handleStartGame,
  };
}

export function useLobbyValidation(players: GamePlayer[] | null): {
  canStart: boolean;
  missingPlayers: number;
} {
  return useMemo(() => {
    const count = players?.length ?? 0;
    return {
      canStart: count >= 3,
      missingPlayers: Math.max(0, 3 - count),
    };
  }, [players]);
}