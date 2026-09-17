"use client";

import { Round } from "@/lib/types";
import { useEffect, useState } from "react";
import { GAME_CONSTANTS } from "@/constants/gamesettings";
import { Trophy, Timer } from "lucide-react";

interface RoundStatusBarProps {
  currentRound: Round;
  isHost?: boolean;
  onNextRound?: () => void;
}

export default function RoundStatusBar({
  currentRound,
  isHost,
  onNextRound,
}: RoundStatusBarProps) {
  const [countdown, setCountdown] = useState(
    GAME_CONSTANTS.timeToStartNextRound,
  );

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
    <div className="bg-felt/5 border border-felt/10 rounded-2xl px-4 py-3 mx-2 mb-2">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <span className="text-felt/70 font-semibold text-sm">
          Round {currentRound?.round_number} •{" "}
          {currentRound?.status?.replace("_", " ")}
        </span>

        {currentRound?.winning_answer_id && currentRound?.status !== "finished" && (
          <div className="flex items-center bg-gold/15 px-3 py-1 rounded-full">
            <Trophy className="w-4 h-4 text-gold-foreground" />
            <span className="text-gold-foreground font-bold ml-1.5 text-sm">
              Winner Selected!
            </span>
          </div>
        )}

        {currentRound?.status === "finished" && (
          <div className="flex items-center gap-1.5 text-felt/70">
            <Timer className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Next round in {countdown}s...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}