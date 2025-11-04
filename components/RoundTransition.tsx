"use client";

import { GamePlayer, Round, RoundAnswer } from "@/lib/types";
import { getCardAnswer, getCardQuestion } from "@/lib/getCards";
import { FaTrophy, FaStar, FaUsers, FaArrowRight } from "react-icons/fa";

interface RoundTransitionProps {
  previousRound: Round | null;
  nextRound: Round | null;
  players: GamePlayer[];
  previousAnswers: RoundAnswer[];
  onComplete?: () => void;
}

export default function RoundTransition({
  previousRound,
  nextRound,
  players,
  previousAnswers,
  onComplete,
}: RoundTransitionProps) {
  const winningAnswer = previousAnswers.find((a) => a.is_winner);
  const winner = winningAnswer
    ? players.find((p) => p.user_id === winningAnswer.user_id)
    : null;
  const nextJudge = nextRound
    ? players.find((p) => p.user_id === nextRound.judge_user_id)
    : null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#99184e] via-[#6c47ff] to-[#99184e] z-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Previous Round Results */}
          {previousRound && winningAnswer && (
            <div className="mb-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-4 animate-bounce">
                  <FaTrophy className="text-4xl text-yellow-900" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Round {previousRound.round_number} Winner!
                </h2>
              </div>

              {/* Winning Answer */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-yellow-900">
                        {winner?.user?.full_name?.[0] || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">
                        {winner?.user?.full_name || "Unknown Player"}
                      </p>
                      <p className="text-white/70 text-sm">Won this round!</p>
                    </div>
                  </div>
                  <div className="bg-yellow-400 px-4 py-2 rounded-full">
                    <span className="text-yellow-900 font-bold">
                      +1 Point
                    </span>
                  </div>
                </div>

                {/* Winning Answer Text */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-white/90 text-sm mb-2 font-semibold">
                    Winning Answer:
                  </p>
                  <div className="space-y-2">
                    {winningAnswer.cards_used?.map((cardId: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white/20 rounded-lg p-3 text-white font-medium"
                      >
                        {getCardAnswer(cardId)?.text || "Unknown card"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question Card */}
              {previousRound.question_card_id && (
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-blue-300/30">
                  <p className="text-white/90 text-sm mb-1 font-semibold">
                    Question:
                  </p>
                  <p className="text-white text-base">
                    {getCardQuestion(previousRound.question_card_id)?.text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transition Arrow */}
          <div className="flex justify-center mb-8 animate-bounce">
            <FaArrowRight className="text-white text-4xl" />
          </div>

          {/* Next Round Info */}
          {nextRound ? (
            <div className="text-center animate-fade-in delay-500">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Starting Round {nextRound.round_number}
              </h3>

              {/* Next Judge */}
              {nextJudge && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/30">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <FaStar className="text-yellow-400 text-2xl" />
                    <p className="text-white/80 text-sm font-semibold">
                      Next Judge
                    </p>
                  </div>
                  <p className="text-white text-xl font-bold">
                    {nextJudge.user?.full_name || "Unknown"}
                  </p>
                </div>
              )}

              {/* Question Preview */}
              {nextRound.question_card_id && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <p className="text-white/80 text-sm mb-3 font-semibold">
                    New Question:
                  </p>
                  <p className="text-white text-lg font-medium">
                    {getCardQuestion(nextRound.question_card_id)?.text}
                  </p>
                </div>
              )}

              {/* Players Count */}
              <div className="mt-6 flex items-center justify-center gap-2 text-white/70">
                <FaUsers className="text-lg" />
                <span className="text-sm">
                  {players.length} player{players.length !== 1 ? "s" : ""} in game
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fade-in delay-500">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Preparing Next Round...
              </h3>
              <p className="text-white/80 text-lg">
                Loading round information
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

