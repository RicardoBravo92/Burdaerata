'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  fetchGameAction,
  fetchLastRoundAction,
  fetchRoundAnswersAction,
  fetchMyCardsAction,
  fetchGamePlayersAction,
  leaveGameAction,
} from '@/lib/actions/game.actions';
import {
  connectToGame as connectToGameWS,
  disconnectFromGame as disconnectFromGameWS,
  onGameEvent,
  offGameEvent,
} from '@/services/gameService';
import { useGame } from '@/providers/GameProvider';
import { logError, getErrorMessage } from '@/lib/errorHandler';
import type { Game, Round, RoundAnswer, GamePlayer } from '@/lib/types';

export interface UseGameScreenReturn {
  gameData: Game | null;
  players: GamePlayer[];
  currentRound: Round | null;
  answers: RoundAnswer[];
  loading: boolean;
  isTransitioning: boolean;
  handleLeaveGame: () => Promise<void>;
}

export function useGameScreen(
  gameId: string,
  userId: string,
  getToken: () => Promise<string | null>,
): UseGameScreenReturn {
  const router = useRouter();
  const {
    game,
    players,
    round,
    setGame,
    setGameState,
    setPlayers,
    setMyCards,
    setRound,
    setChatMessages,
  } = useGame();

  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [gameData, rounds, playerList] = await Promise.all([
        fetchGameAction(gameId),
        fetchLastRoundAction(gameId),
        fetchGamePlayersAction(gameId),
      ]);

      setGame(gameData);
      setPlayers(playerList || []);

      if (gameData?.status === 'playing' && rounds) {
        setRound(rounds);
        const [roundAnswers, cards] = await Promise.all([
          fetchRoundAnswersAction(rounds.id),
          fetchMyCardsAction(gameId),
        ]);
        setAnswers(roundAnswers);
        setMyCards(cards.cards);
      }
    } catch (error) {
      logError(error, 'fetchData');
    } finally {
      setLoading(false);
    }
  }, [gameId, setGame, setPlayers, setRound, setMyCards]);

  const initWithGlobalState = useCallback(async () => {
    if (game && game.id === gameId && players.length > 0) {
      setLoading(false);
      if (game.status === 'playing' && round) {
        const [roundAnswers, cards] = await Promise.all([
          fetchRoundAnswersAction(round.id),
          fetchMyCardsAction(gameId),
        ]);
        setAnswers(roundAnswers);
        setMyCards(cards.cards);
      }
      return true;
    }
    return false;
  }, [game, gameId, players, round, setMyCards]);

  const fetchPlayers = useCallback(async () => {
    const playerList = await fetchGamePlayersAction(gameId);
    setPlayers(playerList || []);
  }, [gameId, setPlayers]);

  const fetchGameData = useCallback(async () => {
    const gameData = await fetchGameAction(gameId);
    setGame(gameData);
    return gameData;
  }, [gameId, setGame]);

  const fetchRoundData = useCallback(async () => {
    const roundData = await fetchLastRoundAction(gameId);
    setRound(roundData);
    return roundData;
  }, [gameId, setRound]);

  useEffect(() => {
    if (!gameId || !userId) return;

    initWithGlobalState().then((hasData) => {
      if (!hasData) {
        fetchInitialData();
      }
    });
  }, [gameId, userId, fetchInitialData, initWithGlobalState]);

  const roundRef = useRef(round);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

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
          fetchPlayers();
          toast.info('A player joined', { richColors: true });
        };

        const handlePlayerLeft = () => {
          if (!isMounted) return;
          fetchPlayers();
          toast.info('A player left', { richColors: true });
        };

        const handleGameStarted = async () => {
          if (!isMounted) return;
          const [newGame, newRound, playersData] = await Promise.all([
            fetchGameData(),
            fetchRoundData(),
            fetchGamePlayersAction(gameId),
          ]);
          setGame(newGame);
          setPlayers(playersData || []);
          if (newRound) {
            const roundAnswers = await fetchRoundAnswersAction(newRound.id);
            setAnswers(roundAnswers);
          }
          const cards = await fetchMyCardsAction(gameId);
          setMyCards(cards.cards);
        };

        const handleNewRound = async (data: unknown) => {
          if (!isMounted) return;
          const roundData = data as Round;
          setRound(roundData);
          setAnswers([]);
          setIsTransitioning(true);

          fetchMyCardsAction(gameId).then((c) => setMyCards(c.cards));
          fetchGamePlayersAction(gameId).then((p) => setPlayers(p || []));

          setTimeout(() => {
            if (isMounted) setIsTransitioning(false);
          }, 2000);
        };

        const handleAnswerSubmitted = (data: unknown) => {
          if (!isMounted) return;
          const newAnswer = data as RoundAnswer;
          setAnswers((prev) =>
            prev.some((a) => a.id === newAnswer.id)
              ? prev
              : [...prev, newAnswer],
          );
        };

        const handleRoundFinished = async () => {
          if (!isMounted) return;
          const roundId = roundRef.current?.id;
          if (!roundId) return;
          const [roundAnswers, playerList, gameData, lastRound] =
            await Promise.all([
              fetchRoundAnswersAction(roundId),
              fetchGamePlayersAction(gameId),
              fetchGameAction(gameId),
              fetchLastRoundAction(gameId),
            ]);
          setAnswers(roundAnswers);
          setPlayers(playerList || []);
          setGame(gameData);
          setRound(lastRound);
          toast.success('Round ended', { richColors: true });
        };

        const handleGameFinished = () => {
          if (!isMounted) return;
          toast.info('Game finished!', { richColors: true });
          setGameState((prev) =>
            prev ? { ...prev, status: 'finished' } : null,
          );
          setChatMessages([]);
        };

        const handleGameDeleted = () => {
          if (!isMounted) return;
          toast.error('Game was deleted', { richColors: true });
          setChatMessages([]);
          router.replace('/game');
        };

        onGameEvent('player_joined', handlePlayerJoined);
        onGameEvent('player_left', handlePlayerLeft);
        onGameEvent('game_started', handleGameStarted);
        onGameEvent('new_round', handleNewRound);
        onGameEvent('answer_submitted', handleAnswerSubmitted);
        onGameEvent('round_finished', handleRoundFinished);
        onGameEvent('game_finished', handleGameFinished);
        onGameEvent('game_deleted', handleGameDeleted);

        return () => {
          disconnectFromGameWS();
          offGameEvent('player_joined', handlePlayerJoined);
          offGameEvent('player_left', handlePlayerLeft);
          offGameEvent('game_started', handleGameStarted);
          offGameEvent('new_round', handleNewRound);
          offGameEvent('answer_submitted', handleAnswerSubmitted);
          offGameEvent('round_finished', handleRoundFinished);
          offGameEvent('game_finished', handleGameFinished);
          offGameEvent('game_deleted', handleGameDeleted);
        };
      } catch (error) {
        logError(error, 'initWebSocket');
      }
    }

    const cleanup = initWebSocket();

    return () => {
      isMounted = false;
      cleanup?.then((fn) => fn?.());
    };
  }, [
    gameId,
    userId,
    getToken,
    router,
    fetchPlayers,
    fetchGameData,
    fetchRoundData,
    setGame,
    setGameState,
    setPlayers,
    setRound,
    setMyCards,
    setChatMessages,
  ]);

  const handleLeaveGame = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to leave the game?',
    );
    if (!confirmed) return;

    try {
      await leaveGameAction(gameId);
      toast.info('You left the game', { richColors: true });
      setChatMessages([]);
      router.replace('/game');
    } catch (error) {
      logError(error, 'handleLeaveGame');
      toast.error(getErrorMessage(error), { richColors: true });
    }
  }, [gameId, router, setChatMessages]);

  return {
    gameData: game,
    players,
    currentRound: round,
    answers,
    loading,
    isTransitioning,
    handleLeaveGame,
  };
}
