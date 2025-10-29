"use client";
import { Game, Round } from "@/lib/types";
import { PropsWithChildren, createContext, useContext, useState } from "react";

type GameData = {
  game: Game | null;
  myCards: string[];
  round: Round | null;
  setGame: (game: Game | null) => void;
  setMyCards: (cards: string[]) => void;
};

const GameContext = createContext<GameData>({
  game: null,
  myCards: [],
  round: null,
  setGame: () => {},
  setMyCards: () => {},
});

export default function GameProvider({ children }: PropsWithChildren) {
  const [game, setGame] = useState<Game | null>(null);
  const [myCards, setMyCards] = useState<string[] | []>([]);

  return (
    <GameContext.Provider value={{ game, myCards, setMyCards, setGame }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
