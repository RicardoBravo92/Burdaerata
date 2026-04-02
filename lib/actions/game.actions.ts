'use server';

import { 
  getGameByID, 
  getLastRoundByGame, 
  getRoundAnswers, 
  getPlayerCard, 
  getGamePlayers,
  createRoundAnswer,
  updatePlayerCard,
  createGame,
  joinGame,
  startGame,
  startNextRound,
  selectWinner,
  leaveGame,
  getRandomAnswerCards
} from '@/services/gameService';
import { Round } from '@/lib/types';

export async function fetchGameAction(gameId: string) {
  return await getGameByID(gameId);
}

export async function fetchLastRoundAction(gameId: string) {
  return await getLastRoundByGame(gameId);
}

export async function fetchRoundAnswersAction(roundId: string) {
  return await getRoundAnswers(roundId);
}

export async function fetchPlayerCardAction(userId: string, gameId: string) {
  return await getPlayerCard(userId, gameId);
}

export async function fetchGamePlayersAction(gameId: string) {
  return await getGamePlayers(gameId);
}

export async function createGameAction(userId: string, maxPlayers?: number, scoreToWin?: number) {
  return await createGame(userId, maxPlayers, scoreToWin);
}

export async function joinGameAction(userId: string, code: string) {
  return await joinGame(userId, code);
}

export async function startGameAction(userId: string, gameId: string) {
  return await startGame(userId, gameId);
}

export async function submitAnswerAction(
  userId: string,
  round: Round,
  cardIds: string[],
  myCards: string[],
) {
  // In the original service, it took setMyCards. 
  // We'll return the updated list instead so the client can update.
  const newRoundAnswer = await createRoundAnswer({
    round_id: round.id,
    user_id: userId,
    cards_used: cardIds,
  });

  const cleanCardIds = cardIds.filter(id => id.length > 0);
  const newPlayerCards = myCards.filter(card => !cleanCardIds.includes(card));
  const cardsToAdd = getRandomAnswerCards(cleanCardIds.length, myCards);
  const onlyIds = cardsToAdd.map(card => card.id);
  newPlayerCards.push(...onlyIds);

  await updatePlayerCard({
    user_id: userId,
    cards: newPlayerCards,
    game_id: round.game_id!,
  });

  return { newRoundAnswer, newPlayerCards };
}

export async function startNextRoundAction(userId: string, gameId: string) {
  return await startNextRound(userId, gameId);
}

export async function selectWinnerAction(userId: string, winningAnswerId: string, round: Round) {
  return await selectWinner(userId, winningAnswerId, round);
}

export async function leaveGameAction(userId: string, gameId: string) {
  return await leaveGame(userId, gameId);
}
