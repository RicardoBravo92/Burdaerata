"use client";

import { getCardQuestion } from "@/lib/getCards";
import { useGame } from "@/providers/GameProvider";
import { selectWinner, submitAnswer } from "@/services/gameService";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { GamePlayer, Round, RoundAnswer } from "@/lib/types";
import { toast } from "sonner";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import RoundHeader from "./play/RoundHeader";
import CardSelector from "./play/CardSelector";
import RoundStatusMessages from "./play/RoundStatusMessages";
import AnswersList from "./play/AnswersList";
import PlayersListModal from "./play/PlayersList";
import RoundStatusBar from "./play/RoundStatusBar";

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
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Reset selected cards when round changes
  useEffect(() => {
    setSelectedCards([]);
  }, [currentRound?.id]);

  const isJudge = currentRound?.judge_user_id === userId;
  const hasSubmitted = answers.some((answer: RoundAnswer) => answer.user_id === userId);
  const canSubmit =
    !isJudge && !hasSubmitted && currentRound?.status === "submitting";

  const handleBlankCount = () => {
    if (!currentRound?.question_card_id) return 1;
    const question = getCardQuestion(currentRound.question_card_id);
    return question?.blank_count || 1;
  };

  async function onCardSelect(card: string) {
    const alreadySelected = selectedCards.find((c) => c === card);
    let updatedSelection;

    if (alreadySelected) {
      updatedSelection = selectedCards.filter((c) => c !== card);
    } else {
      // updatedSelection = [...selectedCards, card];
      //if requiredCards > selectedCards.length add card else deselect last one and add new
      if (selectedCards.length < handleBlankCount()) {
        updatedSelection = [...selectedCards, card];
      } else {
        updatedSelection = [...selectedCards.slice(1), card];
      }
    }

    setSelectedCards(updatedSelection);
  }

  async function handleSubmitAnswer() {
    if (selectedCards.length === 0 || !currentRound) {
      toast.warning("Por favor selecciona al menos una carta", {
        richColors: true,
      });
      return;
    }

    const requiredCards = handleBlankCount();
    if (selectedCards.length !== requiredCards) {
      toast.warning(
        `Debes seleccionar exactamente ${requiredCards} carta${
          requiredCards > 1 ? "s" : ""
        }`,
        { richColors: true },
      );
      return;
    }

    try {
      setSubmittingAnswer(true);
      const cardIds = selectedCards;
      if (!userId) {
        toast.error("Usuario no encontrado", { richColors: true });
        return;
      }
      await submitAnswer(userId, currentRound, cardIds, myCards, setMyCards);
      setSelectedCards([]);
      toast.success("Respuesta enviada exitosamente", { richColors: true });
    } catch (error: unknown) {
      logError(error, "handleSubmitAnswer");
      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setSubmittingAnswer(false);
    }
  }

  async function handleSelectWinner(answerId: string) {
    if (!currentRound) {
      toast.error("Ronda no disponible", { richColors: true });
      return;
    }

    setLoading(true);
    try {
      if (!userId) {
        toast.error("Usuario no encontrado", { richColors: true });
        return;
      }
      await selectWinner(userId, answerId, currentRound);
      toast.success("¡Ganador seleccionado!", { richColors: true });
    } catch (error: unknown) {
      logError(error, "handleSelectWinner");
      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setLoading(false);
    }
  }

  // Transition Overlay
  if (isTransitioning) {
    return (
      <div className="flex-1 items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-6 text-center">
          <div className="bg-white/20 p-6 rounded-full">
            <span className="text-2xl">🔄</span>
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

  console.log("answers", answers);

  return (
    <div className="flex-1 md:max-w-4xl mx-auto px-6  md:h-full py-4">
      <RoundHeader currentRound={currentRound} isJudge={isJudge} />

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-3xl">
        {/* Answer Submission Section */}
        {canSubmit && (
          <CardSelector
            myCards={myCards}
            selectedCards={selectedCards}
            onCardSelect={onCardSelect}
            requiredCards={handleBlankCount()}
            onSubmit={handleSubmitAnswer}
            submitting={submittingAnswer}
          />
        )}

        {/* Status Messages */}
        <RoundStatusMessages
          hasSubmitted={hasSubmitted}
          isJudge={isJudge}
          answersCount={answers.length}
          playersCount={players.length}
          currentRound={currentRound}
        />

        {/* Answers Section */}
        {(hasSubmitted || isJudge) && (
          <AnswersList
            answers={answers}
            isJudge={isJudge}
            currentRound={currentRound}
            loading={loading}
            onSelectWinner={handleSelectWinner}
            playersCount={players.length}
            currentUserId={userId}
            players={players}
          />
        )}

        <PlayersListModal
          players={players}
          currentRound={currentRound}
          currentUserId={userId}
        />

        {/* Round Status */}
        <RoundStatusBar currentRound={currentRound} />
      </div>
    </div>
  );
}
