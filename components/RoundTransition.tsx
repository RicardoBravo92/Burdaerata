'use client';

import { useEffect, useState } from 'react';
import { GamePlayer, Round, QuestionCard } from '@/lib/types';
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
    <div className='fixed inset-0 bg-gradient-to-br from-[#99184e] via-[#6c47ff] to-[#99184e] z-50 flex items-center justify-center p-6'>
      <div className='max-w-2xl w-full'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse delay-1000'></div>
        </div>

        <div className='relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20'>
          <div className='flex justify-center mb-8 animate-bounce'>
            <FaArrowRight className='text-white text-4xl' />
          </div>

          {round ? (
            <div className='text-center animate-fade-in delay-500'>
              <h3 className='text-2xl md:text-3xl font-bold text-white mb-6'>
                Iniciando Ronda {round.round_number}
              </h3>

              {nextJudge && (
                <div className='bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/30'>
                  <div className='flex items-center justify-center gap-3 mb-4'>
                    <FaStar className='text-yellow-400 text-2xl' />
                    <p className='text-white/80 text-sm font-semibold'>
                      Próximo Juez
                    </p>
                  </div>
                  <p className='text-white text-xl font-bold'>
                    {nextJudge.profile?.full_name || 'Desconocido'}
                  </p>
                </div>
              )}

              {round.question_card_id && (
                <div className='bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30'>
                  <p className='text-white/80 text-sm mb-3 font-semibold'>
                    Nueva Pregunta:
                  </p>
                  <p className='text-white text-lg font-medium'>
                    {questionText || 'Cargando...'}
                  </p>
                </div>
              )}

              <div className='mt-6 flex items-center justify-center gap-2 text-white/70'>
                <FaUsers className='text-lg' />
                <span className='text-sm'>
                  {players.length} player{players.length !== 1 ? 's' : ''} in game
                </span>
              </div>
            </div>
          ) : (
            <div className='text-center animate-fade-in delay-500'>
              <h3 className='text-2xl md:text-3xl font-bold text-white mb-6'>
                Preparing next round...
              </h3>
              <p className='text-white/80 text-lg'>Loading information</p>
            </div>
          )}

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
