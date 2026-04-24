"use client";

import { Round } from "@/lib/types";
import { useEffect, useState } from "react";
import { GAME_CONSTANTS } from "@/constants/gamesettings";

interface RoundStatusBarProps {
  currentRound: Round;
  isHost?: boolean;
  onNextRound?: () => void;
  loading?: boolean;
}

const TrophyIcon = () => <span className="text-2xl">🏆</span>;

export default function RoundStatusBar({
  currentRound,
  isHost,
  onNextRound,
  loading,
}: RoundStatusBarProps) {
const [countdown, setCountdown] = useState(GAME_CONSTANTS.timeToStartNextRound);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (currentRound?.status === "finished") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (isHost && prev === 1) {
              onNextRound?.();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(GAME_CONSTANTS.timeToStartNextRound);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentRound?.status, isHost, onNextRound]);
  

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-semibold">
          Round {currentRound?.round_number} •{" "}
          {currentRound?.status?.toUpperCase()}
        </span>
        {currentRound?.status === "finished" && isHost && (
          // <button
          //   onClick={onNextRound}
          //   disabled={loading}
          //   className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
          // >
          //   {loading ? "Starting..." : "Next Round"}
          // </button>
          //next round stating in 10 seconds
          <span>
            Next round starting in {countdown} seconds...
          </span>
        )}

        {currentRound?.winning_answer_id && currentRound?.status !== "finished" && (
          <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
            <TrophyIcon />
            <span className="text-green-800 font-bold ml-1 text-sm">
              Winner Selected!
            </span>
          </div>
        )}
        
        {currentRound?.status === "finished" && !isHost && (
          // <div className="bg-amber-100 px-4 py-2 rounded-full text-amber-800 font-semibold text-sm">
          //   Waiting for host...
          // </div>
         <span>
             Next round starting in {countdown} seconds...
          </span>
            
        )}
      </div>
    </div>
  );
}

