"use client";

import { getCardAnswer } from "@/lib/getCards";
import { useState } from "react";

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
const AlertIcon = () => <span className="text-2xl">⚠️</span>;

export default function CardSelector({
  myCards,
  selectedCards,
  onCardSelect,
  requiredCards,
  onSubmit,
  submitting,
}: CardSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Your Cards ({selectedCards.length}/{requiredCards} selected)
        </h2>
        {selectedCards.length > 0 && (
          <button
            className={`flex items-center py-3 px-6 rounded-2xl ${
              submitting ? "bg-gray-400" : "bg-[#99184e]"
            } text-white font-bold`}
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? <RefreshIcon /> : <SendIcon />}
            <span className="ml-2">
              {submitting ? "Submitting..." : "Submit Answer"}
            </span>
          </button>
        )}
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-4">
        {myCards.length > 0 ? (
          myCards.map((item: string) => (
            <button
              key={item}
              className={`
                w-64 h-32 p-4 rounded-2xl flex items-center justify-center
                border-2 shrink-0
                ${
                  selectedCards.some((sc) => sc === item)
                    ? "bg-[#99184e] border-[#99184e] text-white"
                    : "bg-white border-gray-200 text-gray-800"
                }
                shadow-lg transition-all hover:scale-105
              `}
              onClick={() => onCardSelect(item)}
              disabled={
                requiredCards <= selectedCards.length &&
                !selectedCards.some((sc) => sc === item)
              }
            >
              <p className="text-base font-semibold text-center line-clamp-3">
                {getCardAnswer(item)?.text}
              </p>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 w-full">
            <AlertIcon />
            <p className="text-gray-500 text-lg font-medium mt-4">
              No cards available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

