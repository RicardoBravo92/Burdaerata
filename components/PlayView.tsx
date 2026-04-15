"use client";

import { usePlay, UsePlayProps } from "@/hooks/usePlay";
import { useGame } from "@/providers/GameProvider";
import RoundHeader from "./play/RoundHeader";
import CardSelector from "./play/CardSelector";
import RoundStatusMessages from "./play/RoundStatusMessages";
import AnswersList from "./play/AnswersList";
import PlayersListModal from "./play/PlayersList";
import RoundStatusBar from "./play/RoundStatusBar";

export default function PlayView(props: UsePlayProps) {
  const { myCards } = useGame();
  const {
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
  } = usePlay(props);

  const { currentRound, players, answers, isTransitioning } = props;

  if (isTransitioning) {
    return (
      <div className="flex-1 items-center justify-center bg-[#99184e] min-h-screen">
        <div className="items-center space-y-6 text-center">
          <div className="bg-white/20 p-6 rounded-full">
            <span className="text-2xl">🔄</span>
          </div>
          <h1 className="text-white text-3xl font-bold text-center">
            Starting next round
          </h1>
          <p className="text-white/80 text-lg text-center">
            Get ready for the next challenge!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 md:max-w-4xl mx-auto px-6 md:h-full py-4">
      <RoundHeader 
        currentRound={currentRound} 
        isJudge={isJudge} 
        questionText={questionText} 
        players={players} 
      />

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
            currentUserId={userId || ""}
            players={players}
          />
        )}

        <PlayersListModal
          players={players}
          currentRound={currentRound}
          currentUserId={userId || ""}
        />

        <RoundStatusBar 
          currentRound={currentRound} 
          isHost={isHost}
          onNextRound={handleStartNextRound}
          loading={loading}
        />
      </div>
    </div>
  );
}