export type GameState = "waiting" | "playing" | "finished";

export interface User {
  id: string;
  full_name?: string;
  avatar_url?: string;
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
  status: string;
  host_player_id: string;
  max_players: number;
  score_to_win: number;
  public: boolean;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  user_id: string;
  score: number;
  is_host?: boolean;
  is_ready?: boolean;
  avatar_url?: string;
  profile?: { full_name?: string; avatar_url?: string };
  user?: { full_name?: string };
}

export interface playerCards {
  cards: string[];
  game_id: string;
  user_id: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
}

export interface Round {
  id: string;
  game_id: string;
  judge_user_id: string;
  question_card_id: string;
  round_number: number;
  status: string;
  winning_answer_id: string | null;
  judge?: User;
}

export interface RoundAnswer {
  id: string;
  round_id: string;
  user_id: string;
  cards_used: string[];
  final_text: string;
  is_winner: boolean;
  created_at?: string;
  user?: { full_name?: string };
}
