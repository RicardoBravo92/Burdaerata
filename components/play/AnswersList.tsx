'use client';

import { Round, RoundAnswer } from '@/lib/types';
import { getCardAnswer } from '@/lib/getCards';
import { UserResource } from '@clerk/types';

interface AnswersListProps {
  answers: RoundAnswer[];
  isJudge: boolean;
  currentRound: Round;
  loading: boolean;
  onSelectWinner: (answerId: string) => void;
  playersCount: number;
  currentUserId: string | undefined;
  currentUser: UserResource | null | undefined;
}

const TrophyIcon = () => <span className='text-2xl'>🏆</span>;
const TimeIcon = () => <span className='text-2xl'>⏰</span>;

export default function AnswersList({
  answers,
  isJudge,
  currentRound,
  loading,
  onSelectWinner,
  playersCount,
  currentUserId,
}: AnswersListProps) {
  return (
    <div className='mb-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold text-gray-800'>
          {isJudge ? 'Select Winner' : 'Submitted Answers'}
        </h2>
        <div className='bg-gray-100 px-3 py-1 rounded-full'>
          <span className='text-gray-700 font-semibold'>
            {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
          </span>
        </div>
      </div>

      <div className='space-y-3'>
        {answers.length > 0 ? (
          answers.map((item) => (
            <div
              key={item.id}
              className={`
                rounded-2xl p-4 border-2
                ${
                  item.is_winner
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-gray-50 border-gray-200'
                }
                transition-all hover:shadow-md
              `}
            >
              <div className='flex justify-between items-center gap-4'>
                <div className='flex-1'>
                  <p className='text-gray-800 text-base font-medium'>
                    <ul className='list-disc list-inside space-y-1'>
                      {item.cards_used &&
                        item.cards_used.map((cardId: string, idx: number) => (
                          <li key={`${item.id}-${idx}`}>
                            {getCardAnswer(cardId)?.text}
                          </li>
                        ))}
                    </ul>
                  </p>
                  <span className='text-gray-600 text-sm mt-2 block'>
                    by {item.user?.full_name || 'Unknown'}
                    {item.user_id === currentUserId && ' (You)'}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  {item.is_winner ? (
                    <div className='flex items-center bg-yellow-100 px-3 py-1 rounded-full'>
                      <TrophyIcon />
                      <span className='text-yellow-800 font-bold ml-1 text-sm'>
                        Winner!
                      </span>
                    </div>
                  ) : (
                    isJudge &&
                    currentRound?.status === 'submitting' && (
                      <button
                        className={`flex items-center px-4 py-2 rounded-full ${
                          loading
                            ? 'bg-gray-400'
                            : 'bg-[#99184e] hover:bg-[#7a1340]'
                        } text-white font-bold text-sm transition-colors`}
                        onClick={() => onSelectWinner(item.id)}
                        disabled={loading || answers.length < playersCount - 1}
                      >
                        <TrophyIcon />
                        <span className='ml-1'>Select Winner</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center py-8'>
            <TimeIcon />
            <p className='text-gray-500 text-lg font-medium mt-4'>
              {currentRound?.status === 'submitting'
                ? 'No answers yet...'
                : 'Waiting for next round...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
