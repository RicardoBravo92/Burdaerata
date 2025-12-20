import { Database } from "@/database.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type GameState = "waiting" | "playing" | "finished";

export interface User {
  id: string;
  first_name: string;
  avatar_url: string;
  last_name: string;
  full_name: string;
}

export interface QuestionCard {
  id: string;
  text: string;
  blank_count: number;
}

export interface AnswerCard {
  id: string;
  text: string;
}

export interface Game {
  id: string;
  code: string;
  status: string | null;
  host_player_id: string;
  max_players: number | null;
  score_to_win: number | null;
  public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GamePlayer {
  id: string;
  game_id: string | null;
  user_id: string | null;
  score: number | null;
  created_at: string | null;
  user: User | null;
  profile: User;
  avatar_url: string;
}

export interface playerCards {
  cards: string[];
  created_at: string | null;
  game_id: string | null;
  id: string;
  user_id: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
}

export interface Round {
  created_at: string | null;
  game_id: string | null;
  id: string;
  judge_user_id: string;
  question_card_id: string | null;
  round_number: number | null;
  status: string | null;
  updated_at: string | null;
  winning_answer_id: string | null;
  judge: User | null;
}

export interface RoundAnswer {
  cards_used: string[] | null;
  created_at: string | null;
  final_text: string | null;
  id: string;
  is_winner: boolean | null;
  round_id: string | null;
  user_id: string;
  user: User | null;
}
