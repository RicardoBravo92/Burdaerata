"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import LobbyView from "@/components/LobbyView";
import PlayView from "@/components/PlayView";
import RoundTransition from "@/components/RoundTransition";
import { Game, RoundAnswer, GamePlayer, Round } from "@/lib/types";
import { useGame } from "@/providers/GameProvider";
import {
  fetchGameAction,
  fetchLastRoundAction,
  fetchRoundAnswersAction,
  fetchPlayerCardAction,
  fetchGamePlayersAction,
  leaveGameAction,
  joinGameAction,
} from "@/lib/actions/game.actions";
import { FaExclamationTriangle, FaTrophy, FaQuestion } from "react-icons/fa";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

const AlertIcon = () => <FaExclamationTriangle className="text-4xl" />;
const TrophyIcon = () => <FaTrophy className="text-4xl" />;
const HelpIcon = () => <FaQuestion className="text-4xl" />;

export default function GameScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { setMyCards, setGame } = useGame();
  const { user, isSignedIn } = useUser();
  const userId = user?.id as string;

  const [isTransitioning, setIsTransitioning] = useState(false);
  // Derivamos el prompt de unión según el estado actual

  // SWR fetching
  const { data: players, mutate: mutatePlayers } = useSWR<GamePlayer[]>(
    id ? `game_players:${id}` : null,
    () => fetchGamePlayersAction(id),
    { refreshInterval: 2000 },
  );

  const { data: gameData } = useSWR<Game>(
    id ? `game:${id}` : null,
    () => fetchGameAction(id),
    {
      refreshInterval: 2000,
      onSuccess: (data) => {
        if (data) setGame(data as unknown as Game);
      },
    },
  );

  const { data: currentRound } = useSWR<Round | null>(
    id && gameData?.status === "playing" ? `game_round:${id}` : null,
    () => fetchLastRoundAction(id),
    {
      refreshInterval: 2000,
      onSuccess: (data) => {
        // Handle round transition if round number changes
        if (
          data &&
          previousRoundRef.current &&
          data.id !== previousRoundRef.current.id
        ) {
          setIsTransitioning(true);
          setTimeout(() => setIsTransitioning(false), 3500);
        }
        previousRoundRef.current = data as Round | null;
      },
    },
  );

  const { data: answers } = useSWR<RoundAnswer[]>(
    currentRound?.id ? `round_answers:${currentRound.id}` : null,
    () => fetchRoundAnswersAction(currentRound!.id),
    { refreshInterval: 2000 },
  );

  useSWR(
    userId && id && gameData?.status === "playing"
      ? `player_cards:${userId}:${id}`
      : null,
    () => fetchPlayerCardAction(userId, id),
    {
      onSuccess: (data) => {
        if (data) setMyCards(data.cards || []);
      },
    },
  );

  const previousRoundRef = useRef<Round | null>(null);

  useEffect(() => {
    if (gameData?.status === "finished") {
      toast.info("¡Juego terminado!", { richColors: true });
      setTimeout(() => {
        router.replace("/game");
      }, 3000);
    }
  }, [gameData?.status, router]);

  async function handleLeaveGame() {
    try {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm("¿Seguro que quieres salir de la partida?")
          : false;
      if (!confirmed) return;
      if (!isSignedIn || !user) return;
      await leaveGameAction(userId, id);
      toast.info("Saliste de la partida", { richColors: true });
      router.replace("/game");
    } catch (error) {
      logError(error, "handleLeaveGame");
      toast.error(getErrorMessage(error), { richColors: true });
    }
  }

  async function handleJoinGameFromPrompt() {
    try {
      await joinGameAction(userId, id);
      mutatePlayers();
      toast.success("Te uniste a la partida", { richColors: true });
    } catch (error) {
      logError(error, "handleJoinGameFromPrompt");
      toast.error(getErrorMessage(error), { richColors: true });
    }
  }

  function handleCancelJoinPrompt() {
    router.replace("/game");
  }

  // Derivar si se debe mostrar el prompt de unión
  const shouldShowJoinPrompt = useMemo(() => {
    if (!players || !userId) return false;
    const isPlayerInGame = (players as GamePlayer[]).some(
      (p) => p.user_id === userId,
    );
    return !isPlayerInGame && gameData?.status === "waiting";
  }, [players, userId, gameData?.status]);

  if (!gameData && !players) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-[70px] w-[340px]  md:w-[720px] rounded-xl" />
        <Skeleton className="h-[200px] w-[340px] md:w-[720px] rounded-xl" />
        <Skeleton className="h-[100px] w-[340px] md:w-[720px] rounded-xl" />
      </div>
    );
  }

  if (shouldShowJoinPrompt && gameData?.status === "waiting") {
    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
          <h2 className="text-lg font-bold text-[#99184e] mb-2">
            Unirte a la partida
          </h2>
          <p className="text-gray-700 mb-4">
            No formas parte de esta partida. ¿Quieres unirte?
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleCancelJoinPrompt}
              className="px-4 h-9 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleJoinGameFromPrompt}
              className="px-4 h-9 rounded-full bg-[#99184e] text-white hover:bg-[#871444]"
            >
              Unirme
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTransitioning && currentRound) {
    return (
      <RoundTransition
        round={currentRound as unknown as Round}
        players={players as unknown as GamePlayer[]}
      />
    );
  }

  if (!gameData) {
    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-4 p-6 text-center">
          <AlertIcon />
          <h1 className="text-white text-xl font-semibold text-center">
            Game Not Found
          </h1>
          <p className="text-white/70 text-center text-base">
            The game you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  if (gameData.status === "finished") {
    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-6 p-6 text-center">
          <div className="bg-yellow-500 p-6 rounded-full">
            <TrophyIcon />
          </div>
          <h1 className="text-white text-3xl font-bold text-center">
            Game Finished!
          </h1>
          <p className="text-white/80 text-lg text-center">
            Congratulations to all players!
          </p>
          <p className="text-white/60 text-center">
            Returning to home screen...
          </p>
        </div>
      </div>
    );
  }

  if (gameData.status === "waiting") {
    return (
      <div className="h-lvh">
        <div className="fixed top-20 right-4 md:right-12 z-50">
          <Button
            variant="destructive"
            onClick={handleLeaveGame}
            className="bg-white text-[#99184e] rounded-full font-medium text-sm h-9 px-4 hover:bg-white/90 shadow"
          >
            Salir
          </Button>
        </div>
        <LobbyView
          game={gameData as unknown as Game}
          players={players as unknown as GamePlayer[]}
        />
      </div>
    );
  }

  if (gameData.status === "playing") {
    return (
      <>
        <div className="fixed top-20 right-4 z-50">
          <Button
            variant="destructive"
            onClick={handleLeaveGame}
            className="bg-white text-[#99184e] rounded-full font-medium text-sm h-9 px-4 hover:bg-white/90 shadow"
          >
            Salir
          </Button>
        </div>
        {currentRound ? (
          <PlayView
            currentRound={currentRound as unknown as Round}
            players={players as unknown as GamePlayer[]}
            answers={answers as unknown as RoundAnswer[]}
            isTransitioning={isTransitioning}
          />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <Skeleton className="h-[200px] w-[340px] rounded-xl" />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
      <div className="items-center space-y-4 text-center">
        <HelpIcon />
        <h1 className="text-white text-xl font-semibold">Unknown Game State</h1>
      </div>
    </div>
  );
}
