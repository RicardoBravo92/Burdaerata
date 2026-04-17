"use client";

import { usePlay, UsePlayProps } from "@/hooks/usePlay";
import { useGame } from "@/providers/GameProvider";
import RoundHeader from "./play/RoundHeader";
import CardSelector from "./play/CardSelector";
import RoundStatusMessages from "./play/RoundStatusMessages";
import AnswersList from "./play/AnswersList";
import PlayersListModal from "./play/PlayersList";
import RoundStatusBar from "./play/RoundStatusBar";
import { StarIcon } from "lucide-react";

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
    <div className="flex flex-col">
        <PlayersListModal
          players={players}
          currentRound={currentRound}
          currentUserId={userId || ""}
        />
      <RoundHeader 
        currentRound={currentRound} 
        isJudge={isJudge} 
        questionText={questionText} 
        players={players} 
      />

      <div className="flex flex-row">
        <div className='md:w-3/10 hidden md:block px-2 pt-4'>
        <div className=" flex flex-col space-y-3">

          {players.map((item) => (
            <div
              key={item.id}
              className={`
                flex items-center px-4 py-3 rounded-2xl 
                ${
                  item.user_id === currentRound?.judge_user_id
                    ? 'bg-yellow-100 border border-yellow-400'
                    : item.user_id === userId
                    ? 'bg-blue-100 border border-blue-400'
                    : 'bg-gray-100 border border-gray-300'
                }
                flex-shrink-0 transition-all hover:shadow-md
              `}
            >
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-gray-800'>
                  {item.user?.full_name || item.profile?.full_name || 'Unknown'}
                </span>
                {item.user_id === userId && (
                  <span className='text-blue-600 font-bold'>(You)</span>
                )}
                {item.user_id === currentRound?.judge_user_id && <StarIcon />}
                <div className='bg-white px-2 py-1 rounded-full ml-2'>
                  <span className='text-gray-700 font-bold text-xs'>
                    {item.score || 0} Pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>

    <div className="w-full md:w-7/10 mx-auto px-6 md:h-full py-4 max-w-xl">
      

      <div className=" bg-white rounded-3xl">
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


        <RoundStatusBar 
          currentRound={currentRound} 
          isHost={isHost}
          onNextRound={handleStartNextRound}
          loading={loading}
        />
      </div>
    </div>
    <div className="md:w-3/10 px-2 pt-8 hidden md:block items-center justify-center   ">
        {/* mock chat*/}
        
      </div>
      </div>

   

    </div>
  );
}