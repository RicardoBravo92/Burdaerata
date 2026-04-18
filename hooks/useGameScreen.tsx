"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  fetchGameAction,
  fetchLastRoundAction,
  fetchRoundAnswersAction,
  fetchMyCardsAction,
  fetchGamePlayersAction,
  leaveGameAction,
} from "@/lib/actions/game.actions";
import {
  connectToGame as connectToGameWS,
  disconnectFromGame as disconnectFromGameWS,
  onGameEvent,
  offGameEvent,
} from "@/services/gameService";
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
  const { setMyCards, setGame, setRound, setChatMessages } = useGame();

  const [players, setPlayers] = useState<GamePlayer[] | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentRoundRef = useRef<Round | null>(null);

  // Update ref whenever currentRound changes
  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);


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
    if (!gameId || !userId) return;

    let isMounted = true;

    async function initWebSocket() {
      try {
        const token = await getToken();
        if (!token || !isMounted) return;

        connectToGameWS(gameId, token);

        const handlePlayerJoined = () => {
          if (!isMounted) return;
          fetchGamePlayersAction(gameId).then(setPlayers);
          if (players?.some((player) => player.user_id !== userId)) {
            toast.info("A player joined", { richColors: true });
          }
        };

        const handlePlayerLeft = () => {
          if (!isMounted) return;
          fetchGamePlayersAction(gameId).then(setPlayers);
          if (players?.some((player) => player.user_id !== userId)) {
            toast.info("A player left", { richColors: true });
          }
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
          
          setIsTransitioning(true);
          
          const round = data as Round;
          setCurrentRound(round);
          if (round) setRound?.(round);
          setAnswers([]);
          
          const [cards, playerList] = await Promise.all([
            fetchMyCardsAction(gameId),
            fetchGamePlayersAction(gameId)
          ]);
          
          setMyCards(cards.cards);
          setPlayers(playerList);
          
          setTimeout(() => {
            if (isMounted) setIsTransitioning(false);
          }, 3500);
        };

        const handleAnswerSubmitted = (data: any) => {
          if (!isMounted) return;
          const newAnswer = data as RoundAnswer;
          setAnswers((prev) => {
            const exists = prev.some((a) => a.id === newAnswer.id);
            if (exists) return prev;
            return [...prev, newAnswer];
          });
        };

        const handleRoundFinished = async (data: unknown) => {
          if (!isMounted) return;
          const payload = data as { round_id: string; winning_answer_id: string };
          const [roundAnswers, playerList, lastRound] = await Promise.all([
            fetchRoundAnswersAction(payload.round_id),
            fetchGamePlayersAction(gameId),
            fetchLastRoundAction(gameId)
          ]);
          if (lastRound) {
            setCurrentRound(lastRound);
            setRound?.(lastRound);
          }
          setAnswers(roundAnswers);
          setPlayers(playerList);
          toast.success("Round ended", { richColors: true });
        };


        const handleGameFinished = async () => {
          if (!isMounted) return;
          
          const playerList = await fetchGamePlayersAction(gameId);
          setPlayers(playerList);
          
          toast.info("Game finished!", { richColors: true });
          setGameData((prev) => (prev ? { ...prev, status: "finished" } : null));
          if (setChatMessages) setChatMessages([]);
        };

        const handleGameDeleted = () => {
          if (!isMounted) return;
          toast.error("Game was deleted not enough players", { richColors: true });
          if (setChatMessages) setChatMessages([]);
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

    const cleanupPromise = initWebSocket();

    return () => {
      isMounted = false;
      cleanupPromise?.then((cleanup) => cleanup?.());
    };
  }, [gameId, userId, getToken, router]);

  const handleLeaveGame = useCallback(async () => {
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Are you sure you want to leave the game?")
        : false;
    if (!confirmed) return;

    try {
      await leaveGameAction(gameId);
      toast.info("You left the game", { richColors: true });
      if (setChatMessages) setChatMessages([]);
      router.replace("/game");
    } catch (error) {
      logError(error, "handleLeaveGame");
      toast.error(getErrorMessage(error), { richColors: true });
    }
  }, [gameId, router, setChatMessages]);

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