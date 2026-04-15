"use client";

import { Round } from "@/lib/types";

interface RoundHeaderProps {
  currentRound: Round;
  isJudge: boolean;
  questionText?: string;
  players?: any[];
}

const StarIcon = () => <span className="text-2xl">⭐</span>;

export default function RoundHeader({
  currentRound,
  isJudge,
  questionText,
  players,
}: RoundHeaderProps) {
  const judge = currentRound.judge?.full_name 
    ? currentRound.judge.full_name 
    : players?.find(p => p.user_id === currentRound.judge_user_id)?.profile?.full_name || "Desconocido";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-center">
            Ronda {currentRound?.round_number}
          </h1>
          <p className="text-center text-base mt-1">
            {currentRound?.status === "submitting"
              ? "¡Envía tus respuestas!"
              : "Esperando al juez..."}
          </p>
        </div>
      </div>

      {currentRound?.question_card_id && (
        <div className="bg-blue-600 rounded-3xl p-6 shadow-lg mb-6">
          <p className="text-white text-xl font-bold text-center mb-4 leading-7">
            {questionText || "Cargando pregunta..."}
          </p>
          <div className="flex items-center justify-center bg-blue-700 px-4 py-2 rounded-full self-center">
            <StarIcon />
            <span className="text-white font-semibold ml-2">
              Juez: {judge}
              {isJudge && " (Tú)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
