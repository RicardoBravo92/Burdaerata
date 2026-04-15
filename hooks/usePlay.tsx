"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useGame } from "@/providers/GameProvider";
import { useUser } from "@clerk/clerk-react";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import { submitAnswerAction, selectWinnerAction, fetchQuestionAction, startNextRoundAction } from "@/lib/actions/game.actions";
import type { Round, RoundAnswer, GamePlayer } from "@/lib/types";

export interface UsePlayProps {
  currentRound: Round;
  players: GamePlayer[];
  answers: RoundAnswer[];
  isTransitioning: boolean;
}

export interface UsePlayReturn {
  loading: boolean;
  submittingAnswer: boolean;
  selectedCards: string[];
  questionText: string;
  blankCount: number;
  isJudge: boolean;
  hasSubmitted: boolean;
  canSubmit: boolean;
  userId: string | undefined;
  onCardSelect: (card: string) => void;
  handleSubmitAnswer: () => Promise<void>;
  handleSelectWinner: (answerId: string) => Promise<void>;
  handleStartNextRound: () => Promise<void>;
  isHost: boolean;
}

export function usePlay({
  currentRound,
  players,
  answers,
}: UsePlayProps): UsePlayReturn {
  const { myCards, setMyCards } = useGame();
  const { user } = useUser();
  const userId = user?.id;
  const { game } = useGame();

  const [loading, setLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [questionText, setQuestionText] = useState<string>("");
  const [blankCount, setBlankCount] = useState<number>(1);

  useEffect(() => {
    setSelectedCards([]);
  }, [currentRound?.id]);

  useEffect(() => {
    async function loadQuestion() {
      if (currentRound?.question_card_id) {
        try {
          const question = await fetchQuestionAction(currentRound.question_card_id);
          setQuestionText(question.text);
          setBlankCount(question.blank_count || 1);
        } catch (error) {
          logError(error, "loadQuestion");
        }
      }
    }
    loadQuestion();
  }, [currentRound?.question_card_id]);

  const isJudge = currentRound?.judge_user_id === userId;
  const isHost = game?.host_player_id === players.find(p => p.user_id === userId)?.id;
  const hasSubmitted = answers.some((answer: RoundAnswer) => answer.user_id === userId);
  const canSubmit = !isJudge && !hasSubmitted && currentRound?.status === "submitting";

  const onCardSelect = useCallback(
    (card: string) => {
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
    },
    [selectedCards, blankCount]
  );

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedCards.length === 0) {
      toast.warning("Please select at least one card", { richColors: true });
      return;
    }

    if (selectedCards.length !== blankCount) {
      toast.warning(
        `You must select exactly ${blankCount} card${blankCount > 1 ? "s" : ""}`,
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
      toast.success("Answer submitted!", { richColors: true });
    } catch (error: unknown) {
      logError(error, "handleSubmitAnswer");
      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setSubmittingAnswer(false);
    }
  }, [selectedCards, blankCount, currentRound, setMyCards]);

  const handleSelectWinner = useCallback(
    async (answerId: string) => {
      if (!currentRound) {
        toast.error("Round not available", { richColors: true });
        return;
      }

      setLoading(true);
      try {
        await selectWinnerAction(currentRound.id, answerId);
        toast.success("Winner selected!", { richColors: true });
      } catch (error: unknown) {
        logError(error, "handleSelectWinner");
        toast.error(getErrorMessage(error), { richColors: true });
      } finally {
        setLoading(false);
      }
    },
    [currentRound]
  );
  
  const handleStartNextRound = useCallback(async () => {
    if (!currentRound?.game_id) return;
    setLoading(true);
    try {
      await startNextRoundAction(currentRound.game_id);
      toast.success("Round started!", { richColors: true });
    } catch (error) {
      logError(error, "handleStartNextRound");
      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setLoading(false);
    }
  }, [currentRound?.game_id]);

  return {
    loading,
    submittingAnswer,
    selectedCards,
    questionText,
    blankCount,
    isJudge,
    hasSubmitted,
    canSubmit,
    userId,
    onCardSelect,
    handleSubmitAnswer,
    handleSelectWinner,
    handleStartNextRound,
    isHost,
  };
}