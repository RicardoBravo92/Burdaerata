'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface CardSwiperProps {
  myCards: string[];
  cardTexts: Record<string, string>;
  selectedCards: string[];
  onCardSelect: (card: string) => void;
}

export default function CardSwiper({
  myCards,
  cardTexts,
  selectedCards,
  onCardSelect,
}: CardSwiperProps) {
  return (
    <div className='relative mx-8 md:mx-12'>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 2 },
        }}
        grabCursor
        navigation={{
          prevEl: '.card-swiper-prev',
          nextEl: '.card-swiper-next',
        }}
      >
        {myCards.map((cardId: string, index: number) => {
          const isSelected = selectedCards.includes(cardId);
          const isLoading = !cardTexts[cardId];
          const cardText = cardTexts[cardId] || 'Loading...';

          return (
            <SwiperSlide key={index} className='!h-auto'>
              <Card
                className={`flex-1 transition-all duration-200 border-none py-0 gap-0 h-full ${
                  isLoading
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'cursor-pointer bg-card card-face hover:-translate-y-1'
                } ${
                  isSelected
                    ? 'card-face-selected bg-gradient-to-b from-white to-gold/15'
                    : ''
                }`}
                onClick={() => {
                  if (!isLoading) {
                    onCardSelect(cardId);
                  }
                }}
              >
                <div
                  className={`h-1.5 w-full rounded-t-[1.25rem] ${
                    isSelected ? 'bg-gold' : 'bg-primary'
                  }`}
                />
                <CardContent className='flex flex-col items-center justify-center p-4 min-h-[180px] h-full gap-2'>
                  <span className='text-lg font-semibold text-felt text-center wrap-break-word w-full leading-snug'>
                    {cardText}
                  </span>
                  {isSelected && (
                    <span className='inline-flex items-center gap-1 text-xs font-bold text-gold-foreground bg-gold/20 px-2.5 py-0.5 rounded-full'>
                      <CheckCircle2 className='w-3.5 h-3.5' /> Selected
                    </span>
                  )}
                </CardContent>
              </Card>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <Button
        variant='outline'
        size='icon'
        className='card-swiper-prev absolute -left-12 top-1/2 -translate-y-1/2 size-8 rounded-full z-10'
        aria-label='Previous card'
      >
        <ChevronLeft />
      </Button>
      <Button
        variant='outline'
        size='icon'
        className='card-swiper-next absolute -right-12 top-1/2 -translate-y-1/2 size-8 rounded-full z-10'
        aria-label='Next card'
      >
        <ChevronRight />
      </Button>
    </div>
  );
}