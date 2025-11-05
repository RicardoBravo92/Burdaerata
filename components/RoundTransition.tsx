'use client';

import { GamePlayer, Round } from '@/lib/types';
import { getCardQuestion } from '@/lib/getCards';
import { FaStar, FaUsers, FaArrowRight } from 'react-icons/fa';

interface RoundTransitionProps {
  nextRound: Round | null;
  players: GamePlayer[];
  onComplete?: () => void;
}

export default function RoundTransition({
  nextRound,
  players,
}: RoundTransitionProps) {
  const nextJudge = nextRound
    ? players.find((p) => p.profile?.id === nextRound.judge_user_id)
    : null;

  return (
    <div className='fixed inset-0 bg-gradient-to-br from-[#99184e] via-[#6c47ff] to-[#99184e] z-50 flex items-center justify-center p-6'>
      <div className='max-w-2xl w-full'>
        {/* Animated Background */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse delay-1000'></div>
        </div>

        <div className='relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20'>
          {/* Previous Round Results */}

          {/* Transition Arrow */}
          <div className='flex justify-center mb-8 animate-bounce'>
            <FaArrowRight className='text-white text-4xl' />
          </div>

          {/* Next Round Info */}
          {nextRound ? (
            <div className='text-center animate-fade-in delay-500'>
              <h3 className='text-2xl md:text-3xl font-bold text-white mb-6'>
                Starting Round {nextRound.round_number}
              </h3>

              {/* Next Judge */}
              {nextJudge && (
                <div className='bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/30'>
                  <div className='flex items-center justify-center gap-3 mb-4'>
                    <FaStar className='text-yellow-400 text-2xl' />
                    <p className='text-white/80 text-sm font-semibold'>
                      Next Judge
                    </p>
                  </div>
                  <p className='text-white text-xl font-bold'>
                    {nextJudge.profile?.full_name || 'Unknown'}
                  </p>
                </div>
              )}

              {/* Question Preview */}
              {nextRound.question_card_id && (
                <div className='bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30'>
                  <p className='text-white/80 text-sm mb-3 font-semibold'>
                    New Question:
                  </p>
                  <p className='text-white text-lg font-medium'>
                    {getCardQuestion(nextRound.question_card_id)?.text}
                  </p>
                </div>
              )}

              {/* Players Count */}
              <div className='mt-6 flex items-center justify-center gap-2 text-white/70'>
                <FaUsers className='text-lg' />
                <span className='text-sm'>
                  {players.length} player{players.length !== 1 ? 's' : ''} in
                  game
                </span>
              </div>
            </div>
          ) : (
            <div className='text-center animate-fade-in delay-500'>
              <h3 className='text-2xl md:text-3xl font-bold text-white mb-6'>
                Preparing Next Round...
              </h3>
              <p className='text-white/80 text-lg'>Loading round information</p>
            </div>
          )}

          {/* Loading Indicator */}
          <div className='mt-8 flex justify-center'>
            <div className='flex gap-2'>
              <div className='w-3 h-3 bg-white rounded-full animate-bounce'></div>
              <div className='w-3 h-3 bg-white rounded-full animate-bounce delay-200'></div>
              <div className='w-3 h-3 bg-white rounded-full animate-bounce delay-400'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
