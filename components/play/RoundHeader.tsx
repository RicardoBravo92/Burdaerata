"use client";

import { GamePlayer, Round } from "@/lib/types";
import { Crown } from "lucide-react";

interface RoundHeaderProps {
  currentRound: Round;
  isJudge: boolean;
  questionText?: string;
  players?: GamePlayer[];
}

export default function RoundHeader({
  currentRound,
  isJudge,
  questionText,
  players,
}: RoundHeaderProps) {
  const judge = currentRound.judge?.full_name
    ? currentRound.judge.full_name
    : players?.find((p) => p.user_id === currentRound.judge_user_id)?.profile
        ?.full_name || "Unknown";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6 mb-4 mt-2 animate-fade-in">
      <div className="text-center mb-3 flex items-center justify-center gap-2">
        <span className="text-felt-foreground/70 text-sm font-semibold uppercase tracking-widest">
          {currentRound?.status === "submitting"
            ? "Submit your answers"
            : "Waiting for judge"}
        </span>
      </div>

      {currentRound?.question_card_id && (
        <div className="bg-card card-face p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-gold via-yellow-400 to-gold" />
          <p className="text-felt text-xl md:text-2xl font-bold text-center leading-snug">
            {questionText || "Loading question..."}
          </p>
          <div className="flex justify-center mt-5">
            <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/40 text-gold-foreground px-4 py-1.5 rounded-full">
              <Crown className="w-4 h-4" />
              <span className="font-bold text-sm">
                Judge: {judge}
                {isJudge && " (You)"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}