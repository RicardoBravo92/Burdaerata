"use client";

import { Round } from "@/lib/types";

interface RoundStatusBarProps {
  currentRound: Round;
}

const TrophyIcon = () => <span className="text-2xl">🏆</span>;

export default function RoundStatusBar({
  currentRound,
}: RoundStatusBarProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-semibold">
          Round {currentRound?.round_number} •{" "}
          {currentRound?.status?.toUpperCase()}
        </span>
        {currentRound?.winning_answer_id && (
          <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
            <TrophyIcon />
            <span className="text-green-800 font-bold ml-1 text-sm">
              Winner Selected!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

