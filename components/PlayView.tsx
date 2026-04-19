'use client';

import { usePlay, UsePlayProps } from '@/hooks/usePlay';
import { useGame } from '@/providers/GameProvider';
import RoundHeader from './play/RoundHeader';
import CardSelector from './play/CardSelector';
import RoundStatusMessages from './play/RoundStatusMessages';
import AnswersList from './play/AnswersList';
import PlayersListModal from './play/PlayersList';
import RoundStatusBar from './play/RoundStatusBar';
import { StarIcon } from 'lucide-react';
import ChatGame from './play/ChatGame';
import ChatModal from './play/ChatModal';

export default function PlayView(props: UsePlayProps) {
  const { myCards, chatMessages, setChatMessages } = useGame();
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

  const { currentRound, players, answers } = props;

  return (
    <div className='flex flex-col' style={{ zoom: 0.8 }}>
      <div className='flex justify-end items-center gap-2 px-4 pt-2 lg:hidden'>
        <PlayersListModal
          players={players}
          currentRound={currentRound}
          currentUserId={userId || ''}
        />
        <ChatModal
          messages={chatMessages}
          setMessages={setChatMessages}
          currentUserId={userId || ''}
        />
      </div>
      <RoundHeader
        currentRound={currentRound}
        isJudge={isJudge}
        questionText={questionText}
        players={players}
      />

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-6xl mx-auto px-4 pb-12 mt-3'>
        {/* Left Container - Players List */}
        <div className='hidden lg:block lg:col-span-3'>
          <div className='flex flex-col space-y-3 w-full'>
            {players.map((item) => (
              <div
                key={item.id}
                className={`
                  flex items-center px-4 py-3 rounded-2xl shadow-sm
                  ${
                    item.user_id === currentRound?.judge_user_id
                      ? 'bg-yellow-100 border border-yellow-300'
                      : item.user_id === userId
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-indigo-50 border border-indigo-100'
                  }
                  transition-all hover:shadow-md w-full
                `}
              >
                <div className='flex items-center gap-2 w-full'>
                  <span className='font-semibold text-gray-800 truncate max-w-[120px]'>
                    {item.user?.full_name ||
                      item.profile?.full_name ||
                      'Unknown'}
                  </span>
                  {item.user_id === userId && (
                    <span className='text-blue-600 font-bold text-sm'>
                      (You)
                    </span>
                  )}
                  {item.user_id === currentRound?.judge_user_id && (
                    <StarIcon className='w-5 h-5 text-yellow-500 fill-current' />
                  )}
                  <div className='bg-white px-2 py-1 rounded-full ml-auto whitespace-nowrap shadow-sm'>
                    <span className='text-gray-700 font-bold text-xs'>
                      {item.score || 0} Pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Container - Game Board */}
        <div className='col-span-1 lg:col-span-6 w-full max-w-2xl mx-auto flex flex-col h-full'>
          <div className='bg-white rounded-[2rem] shadow-2xl shadow-black/10 w-full overflow-hidden flex flex-col'>
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
                currentUserId={userId || ''}
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

        {/* Right Container - Chat */}
        <div className='hidden lg:flex lg:col-span-3 flex-col bg-white rounded-[2rem] shadow-2xl shadow-black/10 overflow-hidden h-[450px] w-full'>
          <ChatGame
            messages={chatMessages}
            setMessages={setChatMessages}
            currentUserId={userId || ''}
          />
        </div>
      </div>
    </div>
  );
}
