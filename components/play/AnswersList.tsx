"use client";

import { useEffect, useState } from "react";
import { GamePlayer, Round, RoundAnswer } from "@/lib/types";
import { fetchAnswerTextsAction } from "@/lib/actions/game.actions";
import { Trophy, Clock, Loader2 } from "lucide-react";

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
  const [cardTexts, setCardTexts] = useState<Record<string, string>>({});

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
    <div className="mb-4 px-2 md:px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-felt">
          {isJudge ? "Pick the funniest answer" : "Submitted Answers"}
        </h2>
        <div className="bg-felt/10 px-3 py-1 rounded-full">
          <span className="text-felt/70 font-semibold text-sm">
            {answers.length} {answers.length === 1 ? "answer" : "answers"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {answers.length > 0 ? (
          answers.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-4 transition-all ${
                item.is_winner
                  ? "bg-gold/15 border-2 border-gold card-face-selected"
                  : "bg-card border border-felt/10 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-felt text-base font-medium">
                    <ul className="space-y-1">
                      {item.cards_used &&
                        item.cards_used.map((cardId: string, idx: number) => (
                          <li key={`${item.id}-${idx}`} className="leading-snug">
                            {cardTexts[cardId] || "Loading..."}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <span className="text-felt/50 text-sm mt-2 block">
                    by{" "}
                    {players.find((p) => p.user_id === item.user_id)?.profile
                      ?.full_name || "Unknown"}
                    {item.user_id === currentUserId && " (You)"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.is_winner ? (
                    <div className="flex items-center bg-gold px-3 py-1.5 rounded-full">
                      <Trophy className="w-4 h-4 text-gold-foreground" />
                      <span className="text-gold-foreground font-bold ml-1.5 text-sm">
                        Winner!
                      </span>
                    </div>
                  ) : (
                    isJudge &&
                    currentRound?.status === "submitting" && (
                      <button
                        className={`flex items-center px-4 py-2 rounded-full transition-all ${
                          loading || answers.length < playersCount - 1
                            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                            : "bg-gold hover:bg-gold/85 text-gold-foreground cursor-pointer shadow-md shadow-gold/30"
                        } font-bold text-sm`}
                        onClick={() => onSelectWinner(item.id)}
                        disabled={loading || answers.length < playersCount - 1}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trophy className="w-4 h-4" />
                        )}
                        <span className="ml-1.5">Pick</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-felt/40">
            <Clock className="w-10 h-10" />
            <p className="text-felt/50 text-base font-medium mt-3">
              {currentRound?.status === "submitting"
                ? "No answers yet..."
                : "Waiting for the next round..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}