'use client';

import { useEffect, useState } from 'react';
import { GamePlayer, Round } from '@/lib/types';
import { FaStar, FaUsers, FaArrowRight } from 'react-icons/fa';
import { cardService } from '@/services/cardService';

interface RoundTransitionProps {
  round: Round | null;
  players: GamePlayer[];
  onComplete?: () => void;
}

export default function RoundTransition({
  round,
  players,
}: RoundTransitionProps) {
  const [questionText, setQuestionText] = useState<string>('');
  
  const nextJudge = round
    ? players.find((p) => p.user_id === round.judge_user_id)
    : null;

  useEffect(() => {
    async function loadQuestion() {
      if (round?.question_card_id) {
        try {
          const question = await cardService.getQuestion(round.question_card_id);
          setQuestionText(question.text);
        } catch (error) {
          console.error('Error loading question:', error);
        }
      }
    }
    loadQuestion();
  }, [round?.question_card_id]);

  return (
    <div className='fixed inset-0 bg-felt z-50 flex items-center justify-center p-6 overflow-hidden'>
      <div className='absolute inset-0 bg-felt-glow opacity-40' />
      <div className='max-w-2xl w-full relative'>
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-1/2 -left-1/2 w-full h-full bg-gold/10 rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute -bottom-1/2 -right-1/2 w-full h-full bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
        </div>

        <div className='relative bg-card/90 backdrop-blur rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/50 border border-white/10 overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-gold via-primary to-gold' />
          <div className='flex justify-center mb-8 animate-bounce'>
            <FaArrowRight className='text-gold text-4xl' />
          </div>

          {round ? (
            <div className='text-center animate-fade-in delay-500'>
              <h3 className='text-2xl md:text-3xl font-bold text-felt mb-6'>
                Starting Round {round.round_number}
              </h3>

              {nextJudge && (
                <div className='bg-gold/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gold/30'>
                  <div className='flex items-center justify-center gap-3 mb-4'>
                    <FaStar className='text-gold text-2xl' />
                    <p className='text-gold-foreground text-sm font-semibold'>
                      Next Judge
                    </p>
                  </div>
                  <p className='text-felt text-xl font-bold'>
                    {nextJudge.profile?.full_name || 'Unknown'}
                  </p>
                </div>
              )}

              {round.question_card_id && (
                <div className='bg-felt/5 backdrop-blur-sm rounded-2xl p-6 border border-felt/10'>
                  <p className='text-felt/60 text-sm mb-3 font-semibold'>
                    New Question:
                  </p>
                  <p className='text-felt text-lg font-medium'>
                    {questionText || 'Loading...'}
                  </p>
                </div>
              )}

              <div className='mt-6 flex items-center justify-center gap-2 text-felt/50'>
                <FaUsers className='text-lg' />
                <span className='text-sm'>
                  {players.length} player{players.length !== 1 ? 's' : ''} in game
                </span>
              </div>
            </div>
          ) : (
            <div className='text-center animate-fade-in delay-500'>
              <h3 className='text-2xl md:text-3xl font-bold text-felt mb-6'>
                Preparing next round...
              </h3>
              <p className='text-felt/60 text-lg'>Loading information</p>
            </div>
          )}

          <div className='mt-8 flex justify-center'>
            <div className='flex gap-2'>
              <div className='w-3 h-3 bg-gold rounded-full animate-bounce'></div>
              <div className='w-3 h-3 bg-gold rounded-full animate-bounce delay-200'></div>
              <div className='w-3 h-3 bg-gold rounded-full animate-bounce delay-400'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
