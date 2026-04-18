"use client";
import { Game, Round, GamePlayer } from "@/lib/types";
import { PropsWithChildren, createContext, useContext, useState, useCallback } from "react";

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
  players: GamePlayer[];
  myCards: string[];
  round: Round | null;
  chatMessages: ChatMessage[];
  setGame: (game: Game | null) => void;
  setGameState: (game: Game | null | ((prev: Game | null) => Game | null)) => void;
  setPlayers: (players: GamePlayer[]) => void;
  setMyCards: (cards: string[]) => void;
  setRound: (round: Round | null) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const GameContext = createContext<GameData>({
  game: null,
  players: [],
  myCards: [],
  round: null,
  chatMessages: [],
  setGame: () => {},
  setGameState: () => {},
  setPlayers: () => {},
  setMyCards: () => {},
  setRound: () => {},
  setChatMessages: () => {},
});

export default function GameProvider({ children }: PropsWithChildren) {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [myCards, setMyCards] = useState<string[] | []>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const setGameState = useCallback((value: Game | null | ((prev: Game | null) => Game | null)) => {
    if (typeof value === 'function') {
      setGame(value as (prev: Game | null) => Game | null);
    } else {
      setGame(value);
    }
  }, []);

  return (
    <GameContext.Provider 
      value={{ 
        game, 
        players,
        myCards, 
        round,
        chatMessages,
        setMyCards, 
        setGame,
        setGameState,
        setPlayers,
        setRound,
        setChatMessages
      }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);