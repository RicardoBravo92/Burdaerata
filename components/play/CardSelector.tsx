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
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 min-h-[72px] px-2 md:px-6 gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          Your Cards ({selectedCards.length}/{requiredCards} selected)
        </h2>
        <button
          className={`flex items-center py-2 px-4 md:py-3 md:px-6 rounded-2xl whitespace-nowrap ${
            isComplete && !submitting
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          } text-white font-bold transition-colors duration-200`}
          onClick={isComplete ? onSubmit : undefined}
          disabled={!isComplete || submitting}
        >
          {submitting ? <RefreshIcon /> : <SendIcon />}
          <span className="ml-2">
            {submitting ? "Submitting..." : "Submit Answer"}
          </span>
        </button>
      </div>

      {selectedCards.length > 0 && !isComplete && (
        <div className="px-4 md:px-6 mb-3">
          <p className="text-sm text-gray-500 mb-1">
            Select {requiredCards - selectedCards.length} more:
          </p>
          <ul className="flex flex-wrap gap-2">
            {selectedCards.map((cardId, i) => (
              <li 
                key={i} 
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
              >
                {cardTexts[cardId] || "..."}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isComplete && (
        <div className="px-4 md:px-6 mb-3">
          <p className="text-sm text-green-600 mb-1">
            Your answer:
          </p>
          <ul className="flex flex-wrap gap-2">
            {selectedCards.map((cardId, i) => (
              <li 
                key={i} 
                className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-full"
              >
                {cardTexts[cardId] || "..."}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Carousel className="mx-10">
        <CarouselContent className="items-stretch">
          {myCards.map((cardId: string, index: number) => {
            const isSelected = selectedCards.includes(cardId);
            const isLoading = !cardTexts[cardId];
            const cardText = cardTexts[cardId] || "Loading...";

            return (
              <CarouselItem
                key={index}
                className={`md:basis-1/2 flex ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isLoading) {
                    onCardSelect(cardId);
                  }
                }}
              >
                <Card
                  className={`
                    flex-1 transition-all duration-200
                    ${isLoading ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "cursor-pointer"}
                    ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : (!isLoading ? "bg-blue-100 text-gray-800 border-blue-100 hover:bg-gray-50" : "")
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
