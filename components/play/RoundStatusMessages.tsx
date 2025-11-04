"use client";

import { Round } from "@/lib/types";

interface RoundStatusMessagesProps {
  hasSubmitted: boolean;
  isJudge: boolean;
  answersCount: number;
  playersCount: number;
  currentRound: Round;
}

const CheckIcon = () => <span className="text-2xl">✅</span>;
const StarIcon = () => <span className="text-2xl">⭐</span>;

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
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center">
          <CheckIcon />
          <span className="text-green-800 font-semibold ml-3">
            Answer submitted! Waiting for others...
          </span>
        </div>
      )}

      {isJudge &&
        answersCount < playersCount - 1 &&
        currentRound?.status === "submitting" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center">
            <StarIcon />
            <span className="text-amber-800 font-semibold ml-3">
              You are the judge! Waiting for answers... ({answersCount}/
              {playersCount - 1})
            </span>
          </div>
        )}
    </>
  );
}

