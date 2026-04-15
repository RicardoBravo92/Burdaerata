"use server";

import {
  getGameByID,
  getGameByCode,
  getLastRound,
  getRoundAnswers,
  getMyCards,
  getGamePlayers,
  submitAnswer,
  updateMyCards,
  createGame,
  joinGame,
  startGame,
  startNextRound,
  selectWinner,
  leaveGame,
  getPlayerCards,
} from "@/services/gameService";
import { cardService } from "@/services/cardService";
import type { Game, Round, RoundAnswer } from "@/lib/types";

export async function fetchGameAction(gameId: string) {
  return getGameByID(gameId);
}

export async function fetchGameByCodeAction(code: string) {
  return getGameByCode(code);
}

export async function fetchLastRoundAction(gameId: string) {
  return getLastRound(gameId);
}

export async function fetchRoundAnswersAction(roundId: string) {
  return getRoundAnswers(roundId);
}

export async function fetchMyCardsAction(gameId: string) {
  const response = await getMyCards(gameId);
  return { cards: response.cards };
}

export async function fetchGamePlayersAction(gameId: string) {
  return getGamePlayers(gameId);
}

export async function createGameAction(maxPlayers?: number, scoreToWin?: number) {
  return createGame({ max_players: maxPlayers, score_to_win: scoreToWin });
}

export async function joinGameAction(code: string) {
  return joinGame(code);
}

export async function startGameAction(gameId: string) {
  return startGame(gameId);
}

export async function submitAnswerAction(
  roundId: string,
  cardIds: string[],
  gameId: string
) {
  const answer = await submitAnswer(roundId, cardIds);
  const cardsResponse = await getMyCards(gameId);
  return { answer, newCards: cardsResponse.cards };
}

export async function startNextRoundAction(gameId: string) {
  return startNextRound(gameId);
}

export async function selectWinnerAction(roundId: string, winningAnswerId: string) {
  return selectWinner(roundId, winningAnswerId);
}

export async function leaveGameAction(gameId: string) {
  return leaveGame(gameId);
}

export async function fetchQuestionTextAction(questionId: string) {
  return cardService.getQuestionText(questionId);
}

export async function fetchAnswerTextsAction(cardIds: string[]) {
  return cardService.getAnswersText(cardIds);
}
