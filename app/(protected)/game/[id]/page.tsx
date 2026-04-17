"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import LobbyView from "@/components/LobbyView";
import PlayView from "@/components/PlayView";
import RoundTransition from "@/components/RoundTransition";
import { GamePlayer } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FaExclamationTriangle, FaTrophy, FaQuestion } from "react-icons/fa";
import { useGameScreen } from "@/hooks/useGameScreen";

const AlertIcon = () => <FaExclamationTriangle className="text-4xl" />;
const TrophyIcon = () => <FaTrophy className="text-4xl" />;
const HelpIcon = () => <FaQuestion className="text-4xl" />;

export default function GameScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id as string;

  const {
    gameData,
    players,
    currentRound,
    answers,
    loading,
    isTransitioning,
    handleLeaveGame,
  } = useGameScreen(id, userId, getToken);

  const shouldShowJoinPrompt = useMemo(() => {
    if (!players || !userId) return false;
    const isPlayerInGame = (players as GamePlayer[]).some(
      (p) => p.user_id === userId
    );
    return !isPlayerInGame && gameData?.status === "waiting";
  }, [players, userId, gameData?.status]);

  if (loading || (!gameData && !players)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-[70px] w-[340px] md:w-[720px] rounded-xl" />
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
            Join the game
          </h2>
          <p className="text-gray-700 mb-4">
            You are not part of this game. Do you want to join?
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.replace("/game")}
              className="px-4 h-9 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => router.replace("/game")}
              className="px-4 h-9 rounded-full bg-[#99184e] text-white hover:bg-[#871444]"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTransitioning && currentRound) {
    return (
      <RoundTransition
        round={currentRound}
        players={players || []}
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
            The game you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  if (gameData.status === "finished") {
    const sortedPlayers = [...(players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
          <div className="bg-yellow-100 p-4 rounded-full mb-4">
            <TrophyIcon />
          </div>
          <h1 className="text-[#99184e] text-3xl font-bold text-center mb-6">
            ¡Juego Terminado!
          </h1>
          
          <div className="w-full space-y-3 mb-8">
            {sortedPlayers.map((p, index) => (
              <div 
                key={p.id} 
                className={`flex justify-between items-center p-3 rounded-xl border ${
                  index === 0 ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {p.profile?.full_name || p.user?.full_name || "Jugador"}
                  </span>
                </div>
                <div className="bg-[#99184e] text-white px-3 py-1 rounded-full text-sm font-bold">
                  {p.score || 0} pts
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => router.replace("/game")}
            className="w-full bg-[#99184e] hover:bg-[#7a1340] text-white font-bold h-12 rounded-full text-lg"
          >
            Salir al Lobby
          </Button>
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
            Leave
          </Button>
        </div>
        <LobbyView game={gameData} players={players || []} />
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
            Leave
          </Button>
        </div>
        {currentRound ? (
          <PlayView
            currentRound={currentRound}
            players={players || []}
            answers={answers}
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