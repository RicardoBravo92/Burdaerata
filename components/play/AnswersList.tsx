"use client";

import { useEffect, useState } from "react";
import { GamePlayer, Round, RoundAnswer } from "@/lib/types";
import { fetchAnswerTextsAction } from "@/lib/actions/game.actions";

interface AnswersListProps {
  answers: RoundAnswer[];
  isJudge: boolean;
  currentRound: Round;
  loading: boolean;
  onSelectWinner: (answerId: string) => void;
  playersCount: number;
  currentUserId: string | undefined;
  players: GamePlayer[];
}

const TrophyIcon = () => <span className="text-2xl">🏆</span>;
const TimeIcon = () => <span className="text-2xl">⏰</span>;

export default function AnswersList({
  answers,
  isJudge,
  currentRound,
  loading,
  onSelectWinner,
  playersCount,
  currentUserId,
  players,
}: AnswersListProps) {
  const [cardTexts, setCardTexts] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function loadCardTexts() {
      const allCardIds = answers.flatMap((a) => a.cards_used || []);
      if (allCardIds.length > 0) {
        const texts = await fetchAnswerTextsAction(allCardIds);
        setCardTexts(texts);
      }
    }
    loadCardTexts();
  }, [answers]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {isJudge ? "Seleccionar Ganador" : "Respuestas Enviadas"}
        </h2>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-gray-700 font-semibold">
            {answers.length} {answers.length === 1 ? "respuesta" : "respuestas"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {answers.length > 0 ? (
          answers.map((item) => (
            <div
              key={item.id}
              className={`
                rounded-2xl p-4 border-2
                ${
                  item.is_winner
                    ? "bg-yellow-50 border-yellow-400"
                    : "bg-gray-50 border-gray-200"
                }
                transition-all hover:shadow-md
              `}
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <p className="text-gray-800 text-base font-medium">
                    <ul className="list-disc list-inside space-y-1">
                      {item.cards_used &&
                        item.cards_used.map((cardId: string, idx: number) => (
                          <li key={`${item.id}-${idx}`}>
                            {cardTexts.get(cardId) || "Cargando..."}
                          </li>
                        ))}
                    </ul>
                  </p>
                  <span className="text-gray-600 text-sm mt-2 block">
                    por{" "}
                    {players.find((p) => p.user_id === item.user_id)?.profile
                      ?.full_name || "Desconocido"}
                    {item.user_id === currentUserId && " (Tú)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.is_winner ? (
                    <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                      <TrophyIcon />
                      <span className="text-yellow-800 font-bold ml-1 text-sm">
                        ¡Ganador!
                      </span>
                    </div>
                  ) : (
                    isJudge &&
                    currentRound?.status === "submitting" && (
                      <button
                        className={`flex items-center px-4 py-2 rounded-full ${
                          loading
                            ? "bg-gray-400"
                            : "bg-[#99184e] hover:bg-[#7a1340]"
                        } text-white font-bold text-sm transition-colors`}
                        onClick={() => onSelectWinner(item.id)}
                        disabled={loading || answers.length < playersCount - 1}
                      >
                        <TrophyIcon />
                        <span className="ml-1">Seleccionar</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <TimeIcon />
            <p className="text-gray-500 text-lg font-medium mt-4">
              {currentRound?.status === "submitting"
                ? "Aún no hay respuestas..."
                : "Esperando siguiente ronda..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
