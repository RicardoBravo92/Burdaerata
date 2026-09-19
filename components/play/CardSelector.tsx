'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchAnswerTextsAction } from '@/lib/actions/game.actions';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const CardSwiper = dynamic(() => import('@/components/play/CardSwiper'), {
  ssr: false,
  loading: () => <div className='h-[220px] mx-8 md:mx-12 animate-pulse bg-muted rounded-2xl' />,
});

interface CardSelectorProps {
  myCards: string[];
  selectedCards: string[];
  onCardSelect: (card: string) => void;
  requiredCards: number;
  onSubmit: () => void;
  submitting: boolean;
}

export default function CardSelector({
  myCards,
  selectedCards,
  onCardSelect,
  requiredCards,
  onSubmit,
  submitting,
}: CardSelectorProps) {
  const [cardTexts, setCardTexts] = useState<Record<string, string>>({});
  const isComplete = selectedCards.length === requiredCards;

  useEffect(() => {
    async function loadCardTexts() {
      if (myCards.length > 0) {
        const texts = await fetchAnswerTextsAction(myCards);
        setCardTexts(texts);
      }
    }
    loadCardTexts();
  }, [myCards]);

  return (
    <div className='mb-4'>
      <div className='flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 px-2 md:px-4'>
        <div>
          <h2 className='text-lg font-bold text-felt'>Your Cards</h2>
          <p className='text-sm text-felt/60 font-medium'>
            Pick {requiredCards} card{requiredCards > 1 ? 's' : ''} to complete
            the answer ({selectedCards.length}/{requiredCards})
          </p>
        </div>
        <button
          className={`flex items-center gap-2 py-2.5 px-5 rounded-2xl whitespace-nowrap transition-all duration-200 ${
            isComplete && !submitting
              ? 'bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-lg shadow-primary/30 hover:-translate-y-0.5'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          } font-bold`}
          onClick={isComplete ? onSubmit : undefined}
          disabled={!isComplete || submitting}
        >
          {submitting ? (
            <Loader2 className='w-5 h-5 animate-spin' />
          ) : (
            <Send className='w-5 h-5' />
          )}
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>

      {selectedCards.length > 0 && !isComplete && (
        <div className='px-4 md:px-6 mb-3 flex items-center gap-2'>
          <p className='text-sm font-semibold text-felt/70'>
            Selected ({selectedCards.length}/{requiredCards}):
          </p>
          {selectedCards.map((cardId, i) => (
            <span
              key={i}
              className='inline-flex items-center gap-1 text-xs bg-gold/20 text-gold-foreground px-2.5 py-1 rounded-full font-semibold'
            >
              {cardTexts[cardId] || '...'}
            </span>
          ))}
        </div>
      )}

      {isComplete && (
        <div className='px-4 md:px-6 mb-3 flex items-center gap-2'>
          <CheckCircle2 className='w-4 h-4 text-green-600 shrink-0' />
          <p className='text-sm font-bold text-green-700'>
            Your answer is ready — hit submit!
          </p>
        </div>
      )}

      <CardSwiper
        myCards={myCards}
        cardTexts={cardTexts}
        selectedCards={selectedCards}
        onCardSelect={onCardSelect}
      />
    </div>
  );
}