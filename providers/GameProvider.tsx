"use client";
import { Game, Round } from "@/lib/types";
import { PropsWithChildren, createContext, useContext, useState } from "react";

interface ChatMessage {
  id: string;
  text: string;
  user: {
    id: string;
    full_name: string;
  };
}

type GameData = {
  game: Game | null;
  myCards: string[];
  round: Round | null;
  chatMessages: ChatMessage[];
  setGame: (game: Game | null) => void;
  setMyCards: (cards: string[]) => void;
  setRound: (round: Round | null) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const GameContext = createContext<GameData>({
  game: null,
  myCards: [],
  round: null,
  chatMessages: [],
  setGame: () => {},
  setMyCards: () => {},
  setRound: () => {},
  setChatMessages: () => {},
});

export default function GameProvider({ children }: PropsWithChildren) {
  const [game, setGame] = useState<Game | null>(null);
  const [myCards, setMyCards] = useState<string[] | []>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  return (
    <GameContext.Provider 
      value={{ 
        game, 
        myCards, 
        round,
        chatMessages,
        setMyCards, 
        setGame,
        setRound,
        setChatMessages
      }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);