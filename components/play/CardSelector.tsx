"use client";

import { useEffect, useState } from "react";
import { fetchAnswerTextsAction } from "@/lib/actions/game.actions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface CardSelectorProps {
  myCards: string[];
  selectedCards: string[];
  onCardSelect: (card: string) => void;
  requiredCards: number;
  onSubmit: () => void;
  submitting: boolean;
}

const RefreshIcon = () => <span className="text-2xl">🔄</span>;
const SendIcon = () => <span className="text-2xl">📤</span>;

export default function CardSelector({
  myCards,
  selectedCards,
  onCardSelect,
  requiredCards,
  onSubmit,
  submitting,
}: CardSelectorProps) {
  const [cardTexts, setCardTexts] = useState<Record<string, string>>({});

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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4 min-h-[72px] px-2 md:px-6">
        <h2 className="text-xl font-bold text-gray-800 pl-4 md:pl-0">
          Your Cards ({selectedCards.length}/{requiredCards} selected)
        </h2>
        {selectedCards.length > 0 && (
          <button
            className={`flex items-center md:py-3 py-1 md:px-6 px-2 rounded-2xl ${
              submitting ? "bg-gray-400" : "bg-blue-600"
            } text-white font-bold transition-colors duration-200`}
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? <RefreshIcon /> : <SendIcon />}
            <span className="ml-2 text-sm md:text-base">
              {submitting ? "Submitting..." : "Submit Answer"}
            </span>
          </button>
        )}
      </div>

      <Carousel className="mx-10">
        <CarouselContent className="items-stretch">
          {myCards.map((cardId: string, index: number) => {
            const isSelected = selectedCards.includes(cardId);
            const cardText = cardTexts[cardId] || "Loading...";

            return (
              <CarouselItem
                key={index}
                className="md:basis-1/2 flex"
                onClick={() => onCardSelect(cardId)}
              >
                <Card
                  className={`
                    flex-1 cursor-pointer transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-blue-100 text-gray-800 border-blue-100 hover:bg-gray-50"
                    }
                  `}
                >
                  <CardContent className="flex items-center justify-center p-6 min-h-[200px] h-full">
                    <span className="text-xl font-semibold text-center wrap-break-word w-full leading-relaxed">
                      {cardText}
                    </span>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
