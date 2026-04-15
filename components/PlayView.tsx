"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/providers/GameProvider";
import { submitAnswerAction, selectWinnerAction } from "@/lib/actions/game.actions";
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
import { fetchQuestionTextAction } from "@/lib/actions/game.actions";

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
  const [questionText, setQuestionText] = useState<string>("");
  const [blankCount, setBlankCount] = useState<number>(1);

  useEffect(() => {
    setSelectedCards([]);
  }, [currentRound?.id]);

  useEffect(() => {
    async function loadQuestion() {
      if (currentRound?.question_card_id) {
        try {
          const question = await fetchQuestionTextAction(currentRound.question_card_id);
          setQuestionText(question);
          
          const questions = await fetch("/api/v1/cards/questions").then(r => r.json());
          const q = questions.find((q: { id: string; blank_count: number }) => q.id === currentRound.question_card_id);
          setBlankCount(q?.blank_count || 1);
        } catch (error) {
          logError(error, "loadQuestion");
        }
      }
    }
    loadQuestion();
  }, [currentRound?.question_card_id]);

  const isJudge = currentRound?.judge_user_id === userId;
  const hasSubmitted = answers.some((answer: RoundAnswer) => answer.user_id === userId);
  const canSubmit = !isJudge && !hasSubmitted && currentRound?.status === "submitting";

  async function onCardSelect(card: string) {
    const alreadySelected = selectedCards.find((c) => c === card);
    let updatedSelection;

    if (alreadySelected) {
      updatedSelection = selectedCards.filter((c) => c !== card);
    } else {
      if (selectedCards.length < blankCount) {
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

    if (selectedCards.length !== blankCount) {
      toast.warning(
        `Debes seleccionar exactamente ${blankCount} carta${blankCount > 1 ? "s" : ""}`,
        { richColors: true }
      );
      return;
    }

    try {
      setSubmittingAnswer(true);
      const cardIds = selectedCards;
      const { newCards } = await submitAnswerAction(
        currentRound.id,
        cardIds,
        currentRound.game_id
      );
      setMyCards(newCards);
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
      await selectWinnerAction(currentRound.id, answerId);
      toast.success("¡Ganador seleccionado!", { richColors: true });
    } catch (error: unknown) {
      logError(error, "handleSelectWinner");
      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setLoading(false);
    }
  }

  if (isTransitioning) {
    return (
      <div className="flex-1 items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-6 text-center">
          <div className="bg-white/20 p-6 rounded-full">
            <span className="text-2xl">🔄</span>
          </div>
          <h1 className="text-white text-3xl font-bold text-center">
            Iniciando siguiente ronda
          </h1>
          <p className="text-white/80 text-lg text-center">
            ¡Prepárate para el siguiente desafío!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 md:max-w-4xl mx-auto px-6 md:h-full py-4">
      <RoundHeader currentRound={currentRound} isJudge={isJudge} questionText={questionText} />

      <div className="flex-1 bg-white rounded-3xl">
        {canSubmit && (
          <CardSelector
            myCards={myCards}
            selectedCards={selectedCards}
            onCardSelect={onCardSelect}
            requiredCards={blankCount}
            onSubmit={handleSubmitAnswer}
            submitting={submittingAnswer}
          />
        )}

        <RoundStatusMessages
          hasSubmitted={hasSubmitted}
          isJudge={isJudge}
          answersCount={answers.length}
          playersCount={players.length}
          currentRound={currentRound}
        />

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

        <RoundStatusBar currentRound={currentRound} />
      </div>
    </div>
  );
}
