import { api } from "@/lib/api";
import { wsClient, WebSocketEvent } from "@/lib/websocket";
import { cardService } from "./cardService";
import type { Game, GamePlayer, Round, RoundAnswer, playerCards } from "@/lib/types";

interface CreateGameParams {
  max_players?: number;
  score_to_win?: number;
}

interface CreateGameResponse {
  id: string;
  code: string;
  status: string;
  host_player_id: string;
  max_players: number;
  score_to_win: number;
  public: boolean;
}

interface JoinGameParams {
  code: string;
}

interface CreateRoundAnswerParams {
  round_id: string;
  cards_used: string[];
}

interface PlayerCardsResponse {
  game_id: string;
  user_id: string;
  cards: string[];
}

interface SelectWinnerParams {
  round_id: string;
  winning_answer_id: string;
}

export async function createGame(params?: CreateGameParams): Promise<Game> {
  const response = await api.post<CreateGameResponse>("/api/v1/games", {
    max_players: params?.max_players || 8,
    score_to_win: params?.score_to_win || 7,
  });
  return response as unknown as Game;
}

export async function getGameByID(gameId: string): Promise<Game | null> {
  try {
    const game = await api.get<Game>(`/api/v1/games/${gameId}`);
    return game;
  } catch {
    return null;
  }
}

export async function getGameByCode(code: string): Promise<Game | null> {
  try {
    const game = await api.get<Game>(`/api/v1/games/by-code/${code}`);
    return game;
  } catch {
    return null;
  }
}

export async function joinGame(code: string): Promise<Game> {
  return api.post<Game>("/api/v1/games/join", { code });
}

export async function getGamePlayers(gameId: string): Promise<GamePlayer[]> {
  return api.get<GamePlayer[]>(`/api/v1/games/${gameId}/players`);
}

export async function startGame(gameId: string): Promise<Round> {
  return api.post<Round>(`/api/v1/games/${gameId}/start`);
}

export async function getLastRound(gameId: string): Promise<Round | null> {
  try {
    return await api.get<Round>(`/api/v1/games/${gameId}/rounds/last`);
  } catch {
    return null;
  }
}

export async function startNextRound(gameId: string): Promise<Round> {
  return api.post<Round>(`/api/v1/games/${gameId}/rounds/next`);
}

export async function getRoundAnswers(roundId: string): Promise<RoundAnswer[]> {
  return api.get<RoundAnswer[]>(`/api/v1/rounds/${roundId}/answers`);
}

export async function submitAnswer(
  roundId: string,
  cardsUsed: string[]
): Promise<RoundAnswer> {
  return api.post<RoundAnswer>(`/api/v1/rounds/${roundId}/answers`, {
    cards_used: cardsUsed,
  });
}

export async function selectWinner(
  roundId: string,
  winningAnswerId: string
): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(`/api/v1/rounds/${roundId}/winner`, {
    winning_answer_id: winningAnswerId,
  });
}

export async function getMyCards(
  gameId: string
): Promise<PlayerCardsResponse> {
  return api.get<PlayerCardsResponse>(`/api/v1/games/${gameId}/players/me/cards`);
}

export async function updateMyCards(
  gameId: string,
  cards: string[]
): Promise<PlayerCardsResponse> {
  return api.put<PlayerCardsResponse>(`/api/v1/games/${gameId}/players/me/cards`, {
    cards,
  });
}

export async function leaveGame(gameId: string): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(`/api/v1/games/${gameId}/leave`);
}

export function connectToGame(gameId: string, token: string) {
  wsClient.connect(gameId, token);
}

export function disconnectFromGame() {
  wsClient.disconnect();
}

export function onGameEvent(
  event: WebSocketEvent,
  handler: (data: unknown) => void
) {
  return wsClient.on(event, handler);
}

export function offGameEvent(
  event: WebSocketEvent,
  handler: (data: unknown) => void
) {
  wsClient.off(event, handler);
}

export async function getQuestionText(questionCardId: string): Promise<string> {
  return cardService.getQuestionText(questionCardId);
}

export async function getAnswerTexts(
  cardIds: string[]
): Promise<Record<string, string>> {
  return cardService.getAnswersText(cardIds);
}

export async function createGameFlow(userId: string, params?: CreateGameParams) {
  const game = await createGame(params);
  return game;
}

export async function joinGameFlow(code: string) {
  const game = await joinGame(code);
  return game;
}

export async function startGameFlow(gameId: string) {
  const round = await startGame(gameId);
  return round;
}

export async function submitAnswerFlow(
  roundId: string,
  cardsUsed: string[],
  setMyCards: (cards: string[]) => void
) {
  const myCardsResponse = await submitAnswer(roundId, cardsUsed);
  const newCardsResponse = await getMyCards(
    myCardsResponse.round_id?.replace(/^\d+-/, "") || ""
  );
  setMyCards(newCardsResponse.cards);
  return myCardsResponse;
}

export async function selectWinnerFlow(
  roundId: string,
  winningAnswerId: string
) {
  return selectWinner(roundId, winningAnswerId);
}

export async function getPlayerCards(gameId: string): Promise<string[]> {
  const response = await getMyCards(gameId);
  return response.cards;
}
