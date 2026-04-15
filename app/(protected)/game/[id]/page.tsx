"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import LobbyView from "@/components/LobbyView";
import PlayView from "@/components/PlayView";
import RoundTransition from "@/components/RoundTransition";
import { Game, RoundAnswer, GamePlayer, Round } from "@/lib/types";
import { useGame } from "@/providers/GameProvider";
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
import { FaExclamationTriangle, FaTrophy, FaQuestion } from "react-icons/fa";
import { logError, getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

const AlertIcon = () => <FaExclamationTriangle className="text-4xl" />;
const TrophyIcon = () => <FaTrophy className="text-4xl" />;
const HelpIcon = () => <FaQuestion className="text-4xl" />;

export default function GameScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { setMyCards, setGame, setRound } = useGame();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id as string;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [players, setPlayers] = useState<GamePlayer[] | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const previousRoundRef = useRef<Round | null>(null);

  useEffect(() => {
    if (!id || !userId) return;

    async function fetchData() {
      try {
        const [game, rounds, playerList] = await Promise.all([
          fetchGameAction(id),
          fetchLastRoundAction(id),
          fetchGamePlayersAction(id),
        ]);

        setGameData(game);
        setGame(game);
        setPlayers(playerList);

        if (game?.status === "playing" && rounds) {
          setCurrentRound(rounds);
          setRound(rounds);
          const roundAnswers = await fetchRoundAnswersAction(rounds.id);
          setAnswers(roundAnswers);
          const cards = await fetchMyCardsAction(id);
          setMyCards(cards.cards);
        }

        setLoading(false);
      } catch (error) {
        logError(error, "fetchData");
        setLoading(false);
      }
    }

    fetchData();
  }, [id, userId]);

  useEffect(() => {
    if (!id || !userId || !gameData) return;

    async function initWebSocket() {
      try {
        const token = await getToken();
        if (!token) return;

        connectToGameWS(id, token);

        const handlePlayerJoined = () => {
          fetchGamePlayersAction(id).then(setPlayers);
          toast.info("A player joined", { richColors: true });
        };

        const handlePlayerLeft = () => {
          fetchGamePlayersAction(id).then(setPlayers);
          toast.info("A player left", { richColors: true });
        };

        const handleGameStarted = async () => {
          const [newGame, newRound, playersData] = await Promise.all([
            fetchGameAction(id),
            fetchLastRoundAction(id),
            fetchGamePlayersAction(id),
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
          const cards = await fetchMyCardsAction(id);
          setMyCards(cards.cards);
        };

        const handleNewRound = async (data: unknown) => {
          const round = data as Round;
          setCurrentRound(round);
          if (round) setRound?.(round);
          const roundAnswers = await fetchRoundAnswersAction(round.id);
          setAnswers(roundAnswers);
          setIsTransitioning(true);
          setTimeout(() => setIsTransitioning(false), 3500);
        };

        const handleAnswerSubmitted = async () => {
          if (currentRound) {
            const roundAnswers = await fetchRoundAnswersAction(currentRound.id);
            setAnswers(roundAnswers);
          }
        };

        const handleRoundFinished = async () => {
          if (currentRound) {
            const roundAnswers = await fetchRoundAnswersAction(currentRound.id);
            setAnswers(roundAnswers);
          }
          toast.success("Round ended", { richColors: true });
        };

        const handleGameFinished = () => {
          toast.info("Game finished!", { richColors: true });
          setGameData((prev) => prev ? { ...prev, status: "finished" } : null);
          setTimeout(() => router.replace("/game"), 3000);
        };

        const handleGameDeleted = () => {
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

    initWebSocket();
  }, [id, userId, gameData?.status, getToken]);

  useEffect(() => {
    if (gameData?.status === "finished") {
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
      await leaveGameAction(id);
      toast.info("Saliste de la partida", { richColors: true });
      router.replace("/game");
    } catch (error) {
      logError(error, "handleLeaveGame");
      toast.error(getErrorMessage(error), { richColors: true });
    }
  }

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
            Unirte a la partida
          </h2>
          <p className="text-gray-700 mb-4">
            No formas parte de esta partida. ¿Quieres unirte?
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.replace("/game")}
              className="px-4 h-9 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => router.replace("/game")}
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
    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-6 p-6 text-center">
          <div className="bg-yellow-500 p-6 rounded-full">
            <TrophyIcon />
          </div>
          <h1 className="text-white text-3xl font-bold text-center">
            Game Over!
          </h1>
          <p className="text-white/80 text-lg text-center">
            Congratulations to all players!
          </p>
          <p className="text-white/60 text-center">
            Returning to home...
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
