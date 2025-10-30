"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, redirect } from "next/navigation";
import LobbyView from "@/components/LobbyView";
import PlayView from "@/components/PlayView";
import { supabase } from "@/lib/supabaseClient";
import { Game, RoundAnswer } from "@/lib/types";
import { useGame } from "@/providers/GameProvider";
import {
  getGameByID,
  getGamePlayers,
  getLastRoundByGame,
  getPlayerCard,
} from "@/services/gameService";
import { useUser } from "@clerk/clerk-react";
import {
  FaSync,
  FaExclamationTriangle,
  FaTrophy,
  FaQuestion,
} from "react-icons/fa";

// Icons replacement - you can use react-icons or similar
const RefreshIcon = () => <FaSync className="text-4xl" />;
const AlertIcon = () => <FaExclamationTriangle className="text-4xl" />;
const TrophyIcon = () => <FaTrophy className="text-4xl" />;
const HelpIcon = () => <FaQuestion className="text-4xl" />;

export default function GameScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  // Asegúrate que el componente está envuelto por el GameProvider
  const { game, setMyCards, setGame } = useGame();
  const { user } = useUser();

  const [players, setPlayers] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState<any>(undefined);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = supabase
      .channel(`game:${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPlayer: any = payload.new;
            setPlayers((prev) => [...prev, newPlayer]);
          }
          if (payload.eventType === "DELETE") {
            setPlayers((prev) =>
              prev.filter((player) => player.id !== payload.old.id),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${id} AND status=eq.playing OR status=eq.finished`,
        },
        async (payload: any) => {
          const newGame: Game = payload.new;
          setGame(newGame);

          if (newGame?.status === "playing") {
            fetchCurrentRound();
            fetchPlayerCards();
          }
          if (newGame?.status === "finished") {
            setTimeout(() => {
              router.replace("/");
            }, 3000);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rounds",
          filter: `game_id=eq.${id}`,
        },
        async (payload) => {
          const newRound: any = payload.new;
          if (newRound) {
            if (payload.eventType === "INSERT" && !isTransitioning) {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentRound(newRound);
                setIsTransitioning(false);
              }, 2000);
            } else if (payload.eventType === "UPDATE") {
              setCurrentRound(newRound);
              if (newRound.id) {
                await fetchAnswers(newRound.id);
              }
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "round_answers",
          filter: `game_id=eq.${id} AND round_id=eq.${currentRound?.id}`,
        },
        async (payload: any) => {
          if (!currentRound) return;
          setAnswers((prev) => {
            if (
              prev.some((answer: RoundAnswer) => answer.id === payload.new.id)
            ) {
              return prev;
            }

            if (payload.eventType === "DELETE") {
              return prev.filter(
                (answer: RoundAnswer) => answer.id !== payload.old.id,
              );
            }

            return [...prev, payload.new];
          });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, user?.id, currentRound?.id, isTransitioning]);

  useEffect(() => {
    fetchGameState();
  }, [id]);

  async function fetchGameState() {
    try {
      setLoading(true);
      const gameData = await getGameByID(id as string);

      if (gameData) {
        setGame(gameData);
        await fetchPlayers();

        if (gameData?.status === "playing") {
          await fetchCurrentRound();
          await fetchPlayerCards();
        }
      } else {
        router.replace("/game");
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlayers() {
    try {
      const playersData = await getGamePlayers(id as string);
      setPlayers(playersData || []);
    } catch (error) {
      console.error("Error fetching players:", error);
      setPlayers([]);
    }
  }

  async function fetchCurrentRound() {
    try {
      const roundData = await getLastRoundByGame(id as string);
      setCurrentRound(roundData);

      if (roundData) {
        await fetchAnswers(roundData.id);
      }
    } catch (error) {
      console.error("Error fetching current round:", error);
      setCurrentRound(undefined);
    }
  }

  async function fetchAnswers(roundId: string) {
    try {
      const { data, error } = await supabase
        .from("round_answers")
        .select(
          `
          *,
          user:users(full_name)
        `,
        )
        .eq("round_id", roundId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setAnswers(data || []);
    } catch (error) {
      console.error("Error fetching answers:", error);
      setAnswers([]);
    }
  }

  async function fetchPlayerCards() {
    if (!user) return;

    try {
      const data = await getPlayerCard(user.id, id as string);
      setMyCards(data?.cards || []);
    } catch (error) {
      console.error("Error in fetchPlayerCards:", error);
      setMyCards([]);
    }
  }

  // if (!user) {
  //   redirect("/");
  // }

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-xl font-semibold">Loading Game...</p>
        </div>
      </div>
    );
  }

  // Transition State
  if (isTransitioning) {
    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-6 text-center">
          <div className="bg-white/20 p-6 rounded-full">
            <RefreshIcon />
          </div>
          <h1 className="text-white text-2xl font-bold text-center">
            Starting Next Round
          </h1>
          <p className="text-white/80 text-lg text-center">
            Get ready for the next challenge!
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-4 p-6 text-center">
          <AlertIcon />
          <h1 className="text-white text-xl font-semibold text-center">
            Game Not Found
          </h1>
          <p className="text-white/70 text-center text-base">
            The game you're looking for doesn't exist or you don't have access.
          </p>
        </div>
      </div>
    );
  }

  // Game Finished State
  if (game.status === "finished") {
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

  // Game States
  if (game.status === "waiting") {
    return (
      <div className="h-lvh">
        <LobbyView game={game} players={players} />
      </div>
    );
  }

  if (game.status === "playing") {
    return (
      <PlayView
        currentRound={currentRound}
        players={players}
        answers={answers}
        isTransitioning={isTransitioning}
      />
    );
  }

  // Fallback
  return (
    <div className="flex items-center justify-center bg-[#99184e] min-h-screen">
      <div className="items-center space-y-4 text-center">
        <HelpIcon />
        <h1 className="text-white text-xl font-semibold">Unknown Game State</h1>
      </div>
    </div>
  );
}
