"use client";

import { getCardAnswer, getCardQuestion } from "@/lib/getCards";
import { useGame } from "@/providers/GameProvider";
import { selectWinner, submitAnswer } from "@/services/gameService";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { GamePlayer, Round, RoundAnswer } from "@/lib/types";

interface PlayViewProps {
  currentRound: Round;
  players: GamePlayer[];
  answers: RoundAnswer[];
  isTransitioning: boolean;
}

export default function PlayView({
  currentRound,
  players,
  answers,
  isTransitioning,
}: PlayViewProps) {
  const { myCards, setMyCards } = useGame();
  const { user } = useUser();
  const userId = user?.id;
  const [loading, setLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const isJudge = currentRound?.judge_user_id === userId;
  const hasSubmitted = answers.some((answer: any) => answer.user_id === userId);
  const canSubmit =
    !isJudge && !hasSubmitted && currentRound?.status === "submitting";

  const handleBlankCount = () => {
    if (!currentRound?.question_card_id) return 1;
    const question = getCardQuestion(currentRound.question_card_id);
    return question?.blank_count || 1;
  };

  async function onCardSelect(card: any) {
    const alreadySelected = selectedCards.find((c) => c === card);
    let updatedSelection;

    if (alreadySelected) {
      updatedSelection = selectedCards.filter((c) => c !== card);
    } else {
      updatedSelection = [...selectedCards, card];
    }

    setSelectedCards(updatedSelection);
  }

  async function handleSubmitAnswer() {
    if (selectedCards.length === 0 || !currentRound) {
      return;
    }

    try {
      setSubmittingAnswer(true);
      const cardIds = selectedCards;
      if (!userId) throw new Error("User not found");
      await submitAnswer(userId, currentRound, cardIds, myCards, setMyCards);
      setSelectedCards([]);
    } catch (error: any) {
      console.error("Error submitting answer:", error);
    } finally {
      setSubmittingAnswer(false);
    }
  }

  async function handleSelectWinner(answerId: string) {
    if (!currentRound) {
      console.error("No current round available");
      return;
    }

    setLoading(true);
    try {
      if (!userId) throw new Error("User not found");
      await selectWinner(userId, answerId, currentRound);
    } catch (error: any) {
      console.error("Error in handleSelectWinner:", error);
    } finally {
      setLoading(false);
    }
  }

  // Icons replacement - using emojis or you can install react-icons
  const RefreshIcon = () => <span className="text-2xl">🔄</span>;
  const SendIcon = () => <span className="text-2xl">📤</span>;
  const StarIcon = () => <span className="text-2xl">⭐</span>;
  const CheckIcon = () => <span className="text-2xl">✅</span>;
  const AlertIcon = () => <span className="text-2xl">⚠️</span>;
  const TimeIcon = () => <span className="text-2xl">⏰</span>;
  const TrophyIcon = () => <span className="text-2xl">🏆</span>;

  // Transition Overlay
  if (isTransitioning) {
    return (
      <div className="flex-1 items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-6 text-center">
          <div className="bg-white/20 p-6 rounded-full">
            <RefreshIcon />
          </div>
          <h1 className="text-white text-3xl font-bold text-center">
            Starting Next Round
          </h1>
          <p className="text-white/80 text-lg text-center">
            Get ready for the next challenge!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#99184e] min-h-screen">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white text-center">
              Round {currentRound?.round_number}
            </h1>
            <p className="text-white/80 text-center text-base mt-1">
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

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-t-3xl p-6">
        {/* Answer Submission Section */}
        {canSubmit && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Your Cards ({selectedCards.length}/{handleBlankCount()}{" "}
                selected)
              </h2>
              {selectedCards.length > 0 && (
                <button
                  className={`flex items-center py-3 px-6 rounded-2xl ${
                    submittingAnswer ? "bg-gray-400" : "bg-[#99184e]"
                  } text-white font-bold`}
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer}
                >
                  {submittingAnswer ? <RefreshIcon /> : <SendIcon />}
                  <span className="ml-2">
                    {submittingAnswer ? "Submitting..." : "Submit Answer"}
                  </span>
                </button>
              )}
            </div>

            <div className="flex overflow-x-auto space-x-4 pb-4">
              {myCards.length > 0 ? (
                myCards.map((item: any) => (
                  <button
                    key={item}
                    className={`
                      w-64 h-32 p-4 rounded-2xl flex items-center justify-center
                      border-2 shrink-0
                      ${
                        selectedCards.some((sc) => sc === item)
                          ? "bg-[#99184e] border-[#99184e] text-white"
                          : "bg-white border-gray-200 text-gray-800"
                      }
                      shadow-lg
                    `}
                    onClick={() => onCardSelect(item)}
                    disabled={
                      handleBlankCount() <= selectedCards.length &&
                      !selectedCards.some((sc) => sc === item)
                    }
                  >
                    <p className="text-base font-semibold text-center line-clamp-3">
                      {getCardAnswer(item)?.text}
                    </p>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 w-full">
                  <AlertIcon />
                  <p className="text-gray-500 text-lg font-medium mt-4">
                    No cards available
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {hasSubmitted && !isJudge && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center">
            <CheckIcon />
            <span className="text-green-800 font-semibold ml-3">
              Answer submitted! Waiting for others...
            </span>
          </div>
        )}

        {isJudge &&
          answers.length < players.length - 1 &&
          currentRound?.status === "submitting" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center">
              <StarIcon />
              <span className="text-amber-800 font-semibold ml-3">
                You are the judge! Waiting for answers... ({answers.length}/
                {players.length - 1})
              </span>
            </div>
          )}

        {/* Answers Section */}
        {(hasSubmitted || isJudge) && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {isJudge ? "Select Winner" : "Submitted Answers"}
              </h2>
              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-gray-700 font-semibold">
                  {answers.length} {answers.length === 1 ? "answer" : "answers"}
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
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        by {item.user?.full_name || "Unknown"}
                        {item.user_id === user?.id && " (You)"}
                      </span>

                      {item.is_winner ? (
                        <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                          <TrophyIcon />
                          <span className="text-yellow-800 font-bold ml-1 text-sm">
                            Winner!
                          </span>
                        </div>
                      ) : (
                        isJudge &&
                        currentRound?.status === "submitting" && (
                          <button
                            className={`flex items-center px-4 py-2 rounded-full ${
                              loading ? "bg-gray-400" : "bg-[#99184e]"
                            } text-white font-bold text-sm`}
                            onClick={() => handleSelectWinner(item.id)}
                            disabled={
                              loading || answers.length < players.length - 1
                            }
                          >
                            <TrophyIcon />
                            <span className="ml-1">Select Winner</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <TimeIcon />
                  <p className="text-gray-500 text-lg font-medium mt-4">
                    {currentRound?.status === "submitting"
                      ? "No answers yet..."
                      : "Waiting for next round..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Players Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Players ({players.length})
          </h2>
          <div className="flex overflow-x-auto space-x-3 pb-4">
            {players.map((item) => (
              <div
                key={item.id}
                className={`
                  flex items-center px-4 py-3 rounded-2xl
                  ${
                    item.user_id === currentRound?.judge_user_id
                      ? "bg-yellow-100 border border-yellow-400"
                      : item.user_id === user?.id
                      ? "bg-blue-100 border border-blue-400"
                      : "bg-gray-100 border border-gray-300"
                  }
                  flex-shrink-0
                `}
              >
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800">
                    {item.user?.full_name}
                  </span>
                  {item.user_id === user?.id && (
                    <span className="text-blue-600 font-bold ml-1">(You)</span>
                  )}
                </div>
                {item.user_id === currentRound?.judge_user_id && <StarIcon />}
                <div className="bg-white px-2 py-1 rounded-full ml-2">
                  <span className="text-gray-700 font-bold text-xs">
                    {item.score} Pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Round Status */}
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
      </div>
    </div>
  );
}
