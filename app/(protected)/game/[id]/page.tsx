'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams, redirect } from 'next/navigation';
import LobbyView from '@/components/LobbyView';
import PlayView from '@/components/PlayView';
import RoundTransition from '@/components/RoundTransition';
import { supabase } from '@/lib/supabaseClient';
import { Game, RoundAnswer } from '@/lib/types';
import { useGame } from '@/providers/GameProvider';
import {
  getGameByID,
  getGamePlayerByID,
  getGamePlayers,
  getLastRoundByGame,
  getPlayerCard,
  createUserToGame,
} from '@/services/gameService';
import { leaveGame } from '@/services/gameService';
import { getGamePlayer } from '@/services/gameService';
import { useUser } from '@clerk/nextjs';
import {
  FaSync,
  FaExclamationTriangle,
  FaTrophy,
  FaQuestion,
} from 'react-icons/fa';
import { showToast } from '@/components/Toast';
import { getErrorMessage, logError } from '@/lib/errorHandler';

// Icons replacement - you can use react-icons or similar
const RefreshIcon = () => <FaSync className='text-4xl' />;
const AlertIcon = () => <FaExclamationTriangle className='text-4xl' />;
const TrophyIcon = () => <FaTrophy className='text-4xl' />;
const HelpIcon = () => <FaQuestion className='text-4xl' />;

export default function GameScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { game, setMyCards, setGame } = useGame();
  const { user, isLoaded, isSignedIn } = useUser();
  const userId = user?.id as string;
  const [players, setPlayers] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState<any>(undefined);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextRound, setNextRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [insufficientPlayers, setInsufficientPlayers] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);

  async function handleLeaveGame() {
    try {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('¿Seguro que quieres salir de la partida?')
          : false;
      if (!confirmed) return;
      if (!isLoaded || !isSignedIn || !user) return;
      await leaveGame(userId as string, id as string);
      showToast('Saliste de la partida', 'info');
      router.replace('/game');
    } catch (error) {
      logError(error, 'handleLeaveGame');
      showToast(getErrorMessage(error), 'error');
    }
  }
  const currentRoundRef = useRef(currentRound);
  const isTransitioningRef = useRef(isTransitioning);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  const fetchCurrentRound = useCallback(async () => {
    try {
      const roundData = await getLastRoundByGame(id as string);
      setCurrentRound(roundData);

      if (roundData) {
        const { data, error } = await supabase
          .from('round_answers')
          .select(
            `
            *,
            user:users(full_name)
          `,
          )
          .eq('round_id', roundData.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAnswers(data || []);
      } else {
        // Clear answers if no round
        setAnswers([]);
      }
    } catch (error) {
      logError(error, 'fetchCurrentRound');
      showToast(getErrorMessage(error), 'error');
      setCurrentRound(undefined);
      setAnswers([]);
    }
  }, [id]);

  const fetchPlayerCards = useCallback(async () => {
    if (!userId || !id) return;
    try {
      const data = await getPlayerCard(userId, id);
      setMyCards(data?.cards || []);
    } catch (error) {
      logError(error, 'fetchPlayerCards');
      setMyCards([]);
    }
  }, [id, userId]);

  const fetchAnswers = useCallback(async (roundId: string) => {
    try {
      const { data, error } = await supabase
        .from('round_answers')
        .select(
          `
          *,
          user:users(full_name)
        `,
        )
        .eq('round_id', roundId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAnswers(data || []);
    } catch (error) {
      logError(error, 'fetchAnswers');
      setAnswers([]);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    // Cleanup previous subscription if exists
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const subscription = supabase
      .channel(`game:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // const newPlayer: any = payload.new;
            fetchPlayers();
          }
          if (payload.eventType === 'DELETE') {
            const oldPlayer: any = payload.old;
            setPlayers((prev) =>
              prev.filter(
                (player: any) => player.user_id !== oldPlayer.user_id,
              ),
            );
          }
          if (payload.eventType === 'UPDATE') {
            const updatedPlayer: any = payload.new;
            const { score, user_id } = updatedPlayer;
            //update score
            setPlayers((prev) =>
              prev.map((player: any) =>
                player.user_id === user_id ? { ...player, score } : player,
              ),
            );
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${id}`,
        },
        async (payload: any) => {
          const newGame: Game = payload.new;
          setGame(newGame);

          if (newGame?.status === 'playing') {
            fetchCurrentRound();
            fetchPlayerCards();
          }
          if (newGame?.status === 'finished') {
            showToast('¡Juego terminado!', 'info');
            setTimeout(() => {
              router.replace('/game');
            }, 3000);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rounds',
          filter: `game_id=eq.${id}`,
        },
        async (payload) => {
          const newRound: any = payload.new;
          if (newRound) {
            if (payload.eventType === 'INSERT' && !isTransitioningRef.current) {
              setNextRound(newRound);

              setAnswers([]);

              setIsTransitioning(true);

              setTimeout(async () => {
                setCurrentRound(newRound);
                setIsTransitioning(false);
                setNextRound(null);
              }, 3500); // Increased to 3.5 seconds for better UX
            } else if (payload.eventType === 'UPDATE') {
              // Update current round if it's the same round
              if (currentRoundRef.current?.id === newRound.id) {
                setCurrentRound(newRound);
              }
              // If it's a finished round, fetch answers to show winner
              if (newRound.status === 'finished' && newRound.id) {
                await fetchAnswers(newRound.id);
              }
            }
          }
        },
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
    };
  }, [id, fetchCurrentRound, fetchPlayerCards, fetchAnswers, router, setGame]);

  useEffect(() => {
    if (!currentRound?.id || !id) return;

    const answersSubscription = supabase
      .channel(`round_answers:${currentRound.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'round_answers',
          filter: `round_id=eq.${currentRound.id}`,
        },
        (payload: any) => {
          setAnswers((prev) => {
            // Handle INSERT
            if (payload.eventType === 'INSERT') {
              const newAnswer = payload.new;
              //
              if (
                prev.some((answer: RoundAnswer) => answer.id === newAnswer.id)
              ) {
                return prev;
              }
              return [...prev, newAnswer];
            }

            // Handle DELETE
            if (payload.eventType === 'DELETE') {
              return prev.filter(
                (answer: RoundAnswer) => answer.id !== payload.old.id,
              );
            }

            // Handle UPDATE
            if (payload.eventType === 'UPDATE') {
              return prev.map((answer: RoundAnswer) =>
                answer.id === payload.new.id ? payload.new : answer,
              );
            }

            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      answersSubscription.unsubscribe();
    };
  }, [currentRound?.id, id]);

  useEffect(() => {
    fetchGameState();
  }, [id, userId]);

  useEffect(() => {
    if (
      game?.status === 'playing' &&
      Array.isArray(players) &&
      players.length > 0 &&
      players.length < 3
    ) {
      setInsufficientPlayers(true);
      showToast('Partida finalizada por falta de jugadores', 'info');
      const timeout = setTimeout(() => {
        router.replace('/game');
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [players.length, game?.status, router]);

  async function handleJoinGameFromPrompt() {
    try {
      await createUserToGame({
        game_id: id,
        user_id: userId,
      });
      setShowJoinPrompt(false);

      // Actualizar lista de jugadores y estado sin redirigir
      const updatedPlayers = await getGamePlayers(id);
      setPlayers(updatedPlayers || []);

      showToast('Te uniste a la partida', 'success');
    } catch (error) {
      logError(error, 'handleJoinGameFromPrompt');
      showToast(getErrorMessage(error), 'error');
    }
  }

  function handleCancelJoinPrompt() {
    setShowJoinPrompt(false);
    router.replace('/game');
  }

  async function fetchGameState() {
    try {
      setLoading(true);
      const gameData = await getGameByID(id as string);

      if (gameData) {
        setGame(gameData);
        await fetchPlayers();
        if (gameData?.status == 'playing') {
          await fetchCurrentRound();
          await fetchPlayerCards();
        }
      } else {
        showToast('Juego no encontrado', 'error');
        router.replace('/game');
      }
    } catch (error) {
      logError(error, 'fetchGameState');
      showToast(getErrorMessage(error), 'error');
      router.replace('/game');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlayers() {
    try {
      const playersData = await getGamePlayers(id as string);

      setPlayers(playersData || []);
    } catch (error) {
      logError(error, 'fetchPlayers');
      setPlayers([]);
    }
  }

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center bg-[#99184e] min-h-screen'>
        <div className='items-center space-y-4 text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
          <p className='text-white text-xl font-semibold'>Loading User...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center bg-[#99184e] min-h-screen'>
        <div className='items-center space-y-4 text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
          <p className='text-white text-xl font-semibold'>Loading Game...</p>
        </div>
      </div>
    );
  }

  if (insufficientPlayers) {
    return (
      <div className='flex items-center justify-center bg-[#99184e] min-h-screen'>
        <div className='bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center'>
          <h2 className='text-lg font-bold text-[#99184e] mb-2'>
            Partida finalizada
          </h2>
          <p className='text-gray-700 mb-4'>
            Se necesitan al menos 3 jugadores para continuar.
          </p>
          <p className='text-gray-500 text-sm'>Redirigiendo…</p>
        </div>
      </div>
    );
  }

  if (showJoinPrompt && game?.status === 'waiting') {
    return (
      <div className='flex items-center justify-center bg-[#99184e] min-h-screen'>
        <div className='bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center'>
          <h2 className='text-lg font-bold text-[#99184e] mb-2'>
            Unirte a la partida
          </h2>
          <p className='text-gray-700 mb-4'>
            No formas parte de esta partida. ¿Quieres unirte?
          </p>
          <div className='flex justify-center gap-3'>
            <button
              onClick={handleCancelJoinPrompt}
              className='px-4 h-9 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50'
            >
              Cancelar
            </button>
            <button
              onClick={handleJoinGameFromPrompt}
              className='px-4 h-9 rounded-full bg-[#99184e] text-white hover:bg-[#871444]'
            >
              Unirme
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTransitioning && nextRound) {
    return <RoundTransition nextRound={nextRound} players={players} />;
  }

  if (!game) {
    return (
      <div className='flex items-center justify-center bg-[#99184e] min-h-screen'>
        <div className='items-center space-y-4 p-6 text-center'>
          <AlertIcon />
          <h1 className='text-white text-xl font-semibold text-center'>
            Game Not Found
          </h1>
          <p className='text-white/70 text-center text-base'>
            The game you're looking for doesn't exist or you don't have access.
          </p>
        </div>
      </div>
    );
  }

  if (game.status === 'finished') {
    return (
      <div className='flex items-center justify-center bg-[#99184e] min-h-screen'>
        <div className='items-center space-y-6 p-6 text-center'>
          <div className='bg-yellow-500 p-6 rounded-full'>
            <TrophyIcon />
          </div>
          <h1 className='text-white text-3xl font-bold text-center'>
            Game Finished!
          </h1>
          <p className='text-white/80 text-lg text-center'>
            Congratulations to all players!
          </p>
          <p className='text-white/60 text-center'>
            Returning to home screen...
          </p>
        </div>
      </div>
    );
  }

  if (game.status === 'waiting') {
    return (
      <div className='h-lvh'>
        <div className='fixed top-20 right-4 z-50'>
          <button
            onClick={handleLeaveGame}
            className='bg-white text-[#99184e] rounded-full font-medium text-sm h-9 px-4 hover:bg-white/90 shadow'
          >
            Salir
          </button>
        </div>
        <LobbyView game={game} players={players} />
      </div>
    );
  }

  if (game.status === 'playing') {
    return (
      <>
        <div className='fixed top-20 right-4 z-50'>
          <button
            onClick={handleLeaveGame}
            className='bg-white text-[#99184e] rounded-full font-medium text-sm h-9 px-4 hover:bg-white/90 shadow'
          >
            Salir
          </button>
        </div>
        <PlayView
          currentRound={currentRound}
          players={players}
          answers={answers}
          isTransitioning={isTransitioning}
        />
      </>
    );
  }

  return (
    <div className='flex items-center justify-center bg-[#99184e] min-h-screen'>
      <div className='items-center space-y-4 text-center'>
        <HelpIcon />
        <h1 className='text-white text-xl font-semibold'>Unknown Game State</h1>
      </div>
    </div>
  );
}
