"use client";

import { Round } from "@/lib/types";
import { CheckCircle2, Crown } from "lucide-react";

interface RoundStatusMessagesProps {
  hasSubmitted: boolean;
  isJudge: boolean;
  answersCount: number;
  playersCount: number;
  currentRound: Round;
}

export default function RoundStatusMessages({
  hasSubmitted,
  isJudge,
  answersCount,
  playersCount,
  currentRound,
}: RoundStatusMessagesProps) {
  return (
    <>
      {hasSubmitted && !isJudge && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-4 flex items-center mx-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-green-800 font-semibold ml-2.5 text-sm">
            Answer submitted! Waiting for the rest of the table...
          </span>
        </div>
      )}

      {isJudge &&
        answersCount < playersCount - 1 &&
        currentRound?.status === "submitting" && (
          <div className="bg-gold/10 border border-gold/40 rounded-2xl px-4 py-3 mb-4 flex items-center mx-2">
            <Crown className="w-5 h-5 text-gold-foreground shrink-0" />
            <span className="text-gold-foreground font-semibold ml-2.5 text-sm">
              You are the judge! Waiting for answers ({answersCount}/
              {playersCount - 1})
            </span>
          </div>
        )}
    </>
  );
}