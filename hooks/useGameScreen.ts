"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  fetchGameAction,
  fetchLastRoundAction,
  fetchRoundAnswersAction,
  fetchMyCardsAction,
  fetchGamePlayersAction,
  leaveGameAction,
  connectToGameWS,
  disconnectFromGameWS,
  onGameEvent,
  offGameEvent,
} from "@/lib/actions/game.actions";
import { useGame } from "@/providers/GameProvider";
import { logError, getErrorMessage } from "@/lib/errorHandler";
import type { Game, GamePlayer, Round, RoundAnswer } from "@/lib/types";

export interface UseGameScreenReturn {
  gameData: Game | null;
  players: GamePlayer[] | null;
  currentRound: Round | null;
  answers: RoundAnswer[];
  loading: boolean;
  isTransitioning: boolean;
  handleLeaveGame: () => Promise<void>;
}

export function useGameScreen(
  gameId: string,
  userId: string,
  getToken: () => Promise<string | null>
): UseGameScreenReturn {
  const router = useRouter();
  const { setMyCards, setGame, setRound } = useGame();

  const [players, setPlayers] = useState<GamePlayer[] | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [game, rounds, playerList] = await Promise.all([
        fetchGameAction(gameId),
        fetchLastRoundAction(gameId),
        fetchGamePlayersAction(gameId),
      ]);

      setGameData(game);
      setGame(game);
      setPlayers(playerList);

      if (game?.status === "playing" && rounds) {
        setCurrentRound(rounds);
        setRound(rounds);
        const roundAnswers = await fetchRoundAnswersAction(rounds.id);
        setAnswers(roundAnswers);
        const cards = await fetchMyCardsAction(gameId);
        setMyCards(cards.cards);
      }

      setLoading(false);
    } catch (error) {
      logError(error, "fetchData");
      setLoading(false);
    }
  }, [gameId, setGame, setRound, setMyCards]);

  useEffect(() => {
    if (!gameId || !userId) return;
    fetchInitialData();
  }, [gameId, userId, fetchInitialData]);

  useEffect(() => {
    if (!gameId || !userId || !gameData) return;

    let isMounted = true;

    async function initWebSocket() {
      try {
        const token = await getToken();
        if (!token || !isMounted) return;

        connectToGameWS(gameId, token);

        const handlePlayerJoined = () => {
          if (!isMounted) return;
          fetchGamePlayersAction(gameId).then(setPlayers);
          toast.info("A player joined", { richColors: true });
        };

        const handlePlayerLeft = () => {
          if (!isMounted) return;
          fetchGamePlayersAction(gameId).then(setPlayers);
          toast.info("A player left", { richColors: true });
        };

        const handleGameStarted = async () => {
          if (!isMounted) return;
          const [newGame, newRound, playersData] = await Promise.all([
            fetchGameAction(gameId),
            fetchLastRoundAction(gameId),
            fetchGamePlayersAction(gameId),
          ]);
          setGameData(newGame);
          setGame(newGame);
          setCurrentRound(newRound);
          if (newRound) setRound?.(newRound);
          setPlayers(playersData);
          if (newRound) {
            const roundAnswers = await fetchRoundAnswersAction(newRound.id);
            setAnswers(roundAnswers);
          }
          const cards = await fetchMyCardsAction(gameId);
          setMyCards(cards.cards);
        };

        const handleNewRound = async (data: unknown) => {
          if (!isMounted) return;
          const round = data as Round;
          setCurrentRound(round);
          if (round) setRound?.(round);
          const roundAnswers = await fetchRoundAnswersAction(round.id);
          setAnswers(roundAnswers);
          setIsTransitioning(true);
          setTimeout(() => {
            if (isMounted) setIsTransitioning(false);
          }, 3500);
        };

        const handleAnswerSubmitted = async () => {
          if (!isMounted || !currentRound) return;
          const roundAnswers = await fetchRoundAnswersAction(currentRound.id);
          setAnswers(roundAnswers);
        };

        const handleRoundFinished = async () => {
          if (!isMounted || !currentRound) return;
          const roundAnswers = await fetchRoundAnswersAction(currentRound.id);
          setAnswers(roundAnswers);
          toast.success("Round ended", { richColors: true });
        };

        const handleGameFinished = () => {
          if (!isMounted) return;
          toast.info("Game finished!", { richColors: true });
          setGameData((prev) => (prev ? { ...prev, status: "finished" } : null));
          setTimeout(() => {
            if (isMounted) router.replace("/game");
          }, 3000);
        };

        const handleGameDeleted = () => {
          if (!isMounted) return;
          toast.error("Game was deleted", { richColors: true });
          router.replace("/game");
        };

        onGameEvent("player_joined", handlePlayerJoined);
        onGameEvent("player_left", handlePlayerLeft);
        onGameEvent("game_started", handleGameStarted);
        onGameEvent("new_round", handleNewRound);
        onGameEvent("answer_submitted", handleAnswerSubmitted);
        onGameEvent("round_finished", handleRoundFinished);
        onGameEvent("game_finished", handleGameFinished);
        onGameEvent("game_deleted", handleGameDeleted);

        return () => {
          disconnectFromGameWS();
          offGameEvent("player_joined", handlePlayerJoined);
          offGameEvent("player_left", handlePlayerLeft);
          offGameEvent("game_started", handleGameStarted);
          offGameEvent("new_round", handleNewRound);
          offGameEvent("answer_submitted", handleAnswerSubmitted);
          offGameEvent("round_finished", handleRoundFinished);
          offGameEvent("game_finished", handleGameFinished);
          offGameEvent("game_deleted", handleGameDeleted);
        };
      } catch (error) {
        logError(error, "initWebSocket");
      }
    }

    const cleanup = initWebSocket();

    return () => {
      isMounted = false;
      cleanup?.then((fn) => fn?.());
    };
  }, [gameId, userId, gameData?.status, getToken, router, currentRound, setGame, setRound, setMyCards]);

  const handleLeaveGame = useCallback(async () => {
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Are you sure you want to leave the game?")
        : false;
    if (!confirmed) return;

    try {
      await leaveGameAction(gameId);
      toast.info("You left the game", { richColors: true });
      router.replace("/game");
    } catch (error) {
      logError(error, "handleLeaveGame");
      toast.error(getErrorMessage(error), { richColors: true });
    }
  }, [gameId, router]);

  return {
    gameData,
    players,
    currentRound,
    answers,
    loading,
    isTransitioning,
    handleLeaveGame,
  };
}