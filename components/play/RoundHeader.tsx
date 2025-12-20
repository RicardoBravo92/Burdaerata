"use client";

import { Round } from "@/lib/types";
import { getCardQuestion } from "@/lib/getCards";

interface RoundHeaderProps {
  currentRound: Round;
  isJudge: boolean;
}

const StarIcon = () => <span className="text-2xl">⭐</span>;

export default function RoundHeader({
  currentRound,
  isJudge,
}: RoundHeaderProps) {
  console.log("currentRound", currentRound);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold  text-center">
            Round {currentRound?.round_number}
          </h1>
          <p className=" text-center text-base mt-1">
            {currentRound?.status === "submitting"
              ? "Submit your answers!"
              : "Waiting for judge..."}
          </p>
        </div>
      </div>

      {/* Question Card */}
      {currentRound?.question_card_id && (
        <div className="bg-blue-600 rounded-3xl p-6 shadow-lg mb-6">
          <p className="text-white text-xl font-bold text-center mb-4 leading-7">
            {getCardQuestion(currentRound.question_card_id)?.text}
          </p>
          <div className="flex items-center justify-center bg-blue-700 px-4 py-2 rounded-full self-center">
            <StarIcon />
            <span className="text-white font-semibold ml-2">
              Judge: {currentRound.judge?.full_name || "Unknown"}
              {isJudge && " (You)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
