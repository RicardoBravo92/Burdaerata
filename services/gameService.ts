import cardsData from "@/constants/cardsData.json";
import { supabase } from "@/lib/supabaseClient";
import {
  AnswerCard,
  Game,
  GamePlayer,
  playerCards,
  QuestionCard,
  Round,
  RoundAnswer,
} from "@/lib/types";

const { questions, answers } = cardsData;

export async function getGameByID(gameId: string): Promise<Game | null> {
  try {
    const { data: game, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .maybeSingle(); // Cambiar a maybeSingle

    return error ? null : game;
  } catch (error) {
    console.error("Error in getGameByID:", error);
    return null;
  }
}
export async function getGameByCode(gameCode: string): Promise<Game | null> {
  try {
    const { data: game, error } = await supabase
      .from("games")
      .select("*")
      .eq("code", gameCode)
      .maybeSingle();

    if (error) throw error;
    return game;
  } catch (error) {
    console.error("Error in getGameByCode:", error);
    return null;
  }
}
export async function createGames(params: {
  host_player_id: string;
  code: string;
  max_players?: number;
  score_to_win?: number;
}): Promise<Game> {
  try {
    const { data: newGame, error } = await supabase
      .from("games")
      .insert({
        code: params.code,
        host_player_id: params.host_player_id,
        status: "waiting",
        max_players: params.max_players || 8,
        score_to_win: params.score_to_win,
      })
      .select()
      .single();

    if (error) throw error;
    return newGame;
  } catch (error) {
    console.error("Error in newGame:", error);
    throw error;
  }
}

export async function updateGame(params: {
  game_id: string;
  status?: "waiting" | "playing" | "ended";
}): Promise<Game | null> {
  try {
    const { data: updatedGame, error } = await supabase
      .from("games")
      .update({
        status: params.status,
      })
      .eq("id", params.game_id)
      .select("*")
      .single();

    if (error) throw error;
    return updatedGame;
  } catch (error) {
    console.error("Error in updateGame:", error);
    throw error;
  }
}

export async function getGamePlayers(
  gameId: string,
): Promise<GamePlayer[] | null> {
  try {
    const { data: players, error } = await supabase
      .from("game_players")
      .select(
        `
        *,
        profile:users("*")
      `,
      )
      .eq("game_id", gameId);

    if (error) throw error;
    return players || [];
  } catch (error) {
    console.error("Error in getGamePlayers:", error);
    throw error;
  }
}

export async function updateGamePlayer(params: {
  game_id: string;
  user_id: string;
  score?: number;
}): Promise<GamePlayer | null> {
  try {
    const { data: updatedPlayer, error } = await supabase
      .from("game_players")
      .update({
        score: params.score,
      })
      .eq("game_id", params.game_id)
      .eq("user_id", params.user_id)
      .single();

    if (error) throw error;
    return updatedPlayer;
  } catch (error) {
    console.error("Error in updateGamePlayer:", error);
    throw error;
  }
}

export async function getGamePlayer(
  gameId: string,
  userId: string,
): Promise<GamePlayer | null> {
  try {
    const { data: player, error } = await supabase
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return player || null;
  } catch (error) {
    console.error("Error in getGamePlayer:", error);
    throw error;
  }
}
//getGamePlayer with profile by id
export async function getGamePlayerWithProfile(
  id: string,
): Promise<GamePlayer | null> {
  try {
    const { data: player, error } = await supabase
      .from("game_players")
      .select(
        `
        *,
        user:users(full_name)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return player || null;
  } catch (error) {
    console.error("Error in getGamePlayer:", error);
    throw error;
  }
}

export async function getLastRoundByGame(
  gameId: string,
): Promise<Round | null> {
  try {
    const { data: round, error } = await supabase
      .from("rounds")
      .select(
        `
        *,
        judge:users(full_name)
      `,
      )
      .eq("game_id", gameId)
      .order("round_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return round || null;
  } catch (error) {
    console.error("Error in getLastRoundByGame:", error);
    throw error;
  }
}

export async function getRoundByID(roundId: string): Promise<Round | null> {
  try {
    const { data: round, error } = await supabase
      .from("rounds")
      .select("*")
      .eq("id", roundId)
      .maybeSingle(); // Cambiar a maybeSingle

    return error ? null : round;
  } catch (error) {
    console.error("Error in getRoundByID:", error);
    return null;
  }
}

export async function createRound(params: {
  game_id: string;
  round_number: number;
  question_card_id: string;
  judge_user_id: string;
}): Promise<Round> {
  try {
    const { data: newRound, error } = await supabase
      .from("rounds")
      .insert({
        game_id: params.game_id,
        round_number: params.round_number,
        question_card_id: params.question_card_id,
        judge_user_id: params.judge_user_id,
      })
      .select(
        `
        *,
        judge:users(full_name)
      `,
      )
      .single();

    if (error) throw error;
    return newRound || null;
  } catch (error) {
    console.error("Error in createRound:", error);
    throw error;
  }
}

export async function createRoundAnswer(params: {
  round_id: string;
  user_id: string;
  cards_used: string[];
}): Promise<RoundAnswer | null> {
  try {
    const { data: newRoundAnswer, error } = await supabase
      .from("round_answers")
      .insert({
        round_id: params.round_id,
        user_id: params.user_id,
        cards_used: params.cards_used,
      })
      .select()
      .single();

    if (error) throw error;
    return newRoundAnswer || null;
  } catch (error) {
    console.error("Error in createRoundAnswer:", error);
    throw error;
  }
}

export function getRandomQuestionCard(): QuestionCard {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

export function getRandomAnswerCards(limit: number = 1): AnswerCard[] {
  if (answers.length === 0) {
    return [];
  }
  const shuffled = [...answers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

export async function createUserToGame(params: {
  game_id: string;
  user_id: string;
}): Promise<GamePlayer | null> {
  try {
    const { data: newGamePlayer, error } = await supabase
      .from("game_players")
      .insert({
        game_id: params.game_id,
        user_id: params.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    return newGamePlayer || null;
  } catch (error) {
    console.error("Error in createUserToGame:", error);
    throw error;
  }
}

export async function getPlayerCard(
  user_id: string,
  game_id: string,
): Promise<playerCards | null> {
  try {
    const { data: card, error } = await supabase
      .from("player_cards")
      .select("*")
      .eq("game_id", game_id)
      .eq("user_id", user_id)
      .maybeSingle(); // Cambiar a maybeSingle

    return error ? null : card;
  } catch (error) {
    console.error("Error en getPlayerCard:", error);
    return null;
  }
}
export async function updatePlayerCard(params: {
  user_id: string;
  cards: string[];
  game_id: string;
}): Promise<playerCards | null> {
  try {
    const { data: updatedPlayerCard, error } = await supabase
      .from("player_cards")
      .update({
        cards: params.cards,
      })
      .eq("user_id", params.user_id)
      .eq("game_id", params.game_id)
      .select()
      .single();

    if (error) throw error;
    return updatedPlayerCard || null;
  } catch (error) {
    console.error("Error in updatePlayerCard:", error);
    throw error;
  }
}
export async function getUserAnwerfromRound(
  roundId: string,
  userId: string,
): Promise<RoundAnswer | null> {
  try {
    const { data: roundAnswers, error } = await supabase
      .from("round_answers")
      .select("*")
      .eq("round_id", roundId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return roundAnswers || null;
  } catch (error) {
    console.error("Error in getUserAnwerfromRound:", error);
    throw error;
  }
}

// Create a new game
export async function createGame(
  userId: string,
  max_players?: number,
  score_to_win?: number,
) {
  try {
    // Generate unique code
    let code: string = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      code = Math.floor(100000 + Math.random() * 900000).toString();

      const existingGame = await getGameByCode(code);

      if (!existingGame) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique game code");
    }

    const newGame = await createGames({
      host_player_id: userId,
      code: code,
      max_players: max_players,
      score_to_win: score_to_win,
    });

    if (!newGame) throw new Error("Failed to create game");

    // Auto-join host to the game
    const joinGame = await createUserToGame({
      game_id: newGame.id,
      user_id: userId,
    });

    if (!joinGame) {
      console.error("❌ Error in joinGame: Failed to join game");
      throw new Error("Failed to join game");
    }

    return newGame;
  } catch (error) {
    console.error("Error in createGame:", error);
    throw error;
  }
}

export async function joinGame(userId: string, code: string) {
  try {
    const game = await getGameByCode(code);
    if (!game) throw new Error("Game not found");

    // Check if game is full
    const gamePlayers = await getGamePlayers(game.id);
    if (!gamePlayers) throw new Error("Failed to get game players");

    const maxPlayers = game.max_players || 10;
    if (gamePlayers && gamePlayers.length >= maxPlayers) {
      throw new Error("Game is full");
    }

    // Check if user is already in the game
    const existingPlayer = gamePlayers.find(
      (player) => player.user_id === userId,
    );

    if (existingPlayer) {
      console.log("existingPlayer", existingPlayer);
      throw new Error("You are already in this game");
    }

    const joinGame = await createUserToGame({
      game_id: game.id,
      user_id: userId,
    });
    console.log("joinGame", joinGame);
    if (!joinGame) {
      console.error("❌ Error in joinGame: Failed to join game");
      throw new Error("Failed to join game");
    }

    return game;
  } catch (error) {
    console.error("Error in joinGame:", error);
    throw error;
  }
}

export async function startGame(userId: string, gameId: string) {
  try {
    // Get game info
    const game = await getGameByID(gameId);
    if (!game) {
      console.error("❌ Game fetch error: Game not found");
      throw new Error("Game not found");
    }

    if (game.status !== "waiting") {
      throw new Error("Game has already started");
    }

    // Get all players
    const players = await getGamePlayers(gameId);
    if (!players || players.length === 0) {
      console.error("❌ Players fetch error: No players in the game");
      throw new Error("No players in the game");
    }

    if (!players || players.length < 2) {
      throw new Error("Need at least 2 players to start the game");
    }
    // Verify user is in the game
    const playerInGame = players.some((player) => player.user_id === userId);

    if (!playerInGame) {
      console.error("❌ Player not in game:", userId);
      throw new Error("You are not in this game");
    }

    const nextJudgeIndex = 0;
    const judge = players[nextJudgeIndex].user_id || players[0].user_id;
    if (!judge) {
      console.error("❌ Judge not found");
      throw new Error("Judge not found");
    }

    // Get random question card
    const question = getRandomQuestionCard();
    if (!question) {
      console.error("❌ Question not found");
      throw new Error("Question not found");
    }

    // Calculate next round numbe

    // Create round
    const roundData = {
      game_id: gameId,
      round_number: 1,
      question_card_id: question.id || "q1",
      judge_user_id: judge,
      status: "submitting",
    };

    const round = await createRound(roundData);

    if (!round) {
      console.error("❌ Round creation error: Failed to create round");
      throw new Error("Failed to create round");
    }

    await updateGame({
      game_id: gameId,
      status: "playing",
    });

    await dealCardsToPlayers(gameId, 10);

    return round;
  } catch (error) {
    console.error("💥 Error in startGame:", error);
    throw error;
  }
}

export async function submitAnswer(
  userId: string,
  round: Round,
  cardIds: string[],
  myCards: string[],
  setMyCards: (cards: string[]) => void,
) {
  try {
    // Check if user has already submitted an answer for this round

    // const existingAnswer = await getUserAnwerfromRound(roundId, userId);
    // if (existingAnswer) {
    //   console.log("existingAnswer", existingAnswer);
    //   throw new Error("You have already submitted an answer for this round");
    // }

    if (!round) {
      console.error("❌ Error fetching round:", round);
      throw new Error("Round not found");
    }

    if (round?.judge_user_id === userId) {
      throw new Error("Judge cannot submit answers");
    }

    const cleanCardIds = Array.isArray(cardIds)
      ? cardIds.filter(
          (cardId) => typeof cardId === "string" && cardId.length > 0,
        )
      : [];

    // Insertar la respuesta
    const newRoundAnswer = await createRoundAnswer({
      round_id: round.id,
      user_id: userId,
      cards_used: cleanCardIds,
    });

    // get player cards
    // const playerCards = await getPlayerCard(userId, round.game_id);
    // if (!playerCards) {
    //   console.error("❌ Error fetching player cards");
    //   throw new Error("Failed to fetch player cards");
    // }

    const newPlayerCards = myCards?.filter(
      (card) => !cleanCardIds.includes(card),
    );
    //add new cards

    const cardsToAdd = getRandomAnswerCards(cleanCardIds.length);

    const onlyIds = cardsToAdd.map((card) => card.id);

    newPlayerCards?.push(...onlyIds);

    await updatePlayerCard({
      user_id: userId,
      cards: newPlayerCards,
      game_id: round.game_id!,
    });
    setMyCards(newPlayerCards);

    return newRoundAnswer;
  } catch (error) {
    console.error("💥 Error in submitAnswer:", error);
    throw error;
  }
}

export async function startNextRound(userId: string, gameId: string) {
  try {
    // Verificar que el usuario está en el juego
    const playerInGame = await getGamePlayer(gameId, userId);

    if (!playerInGame) throw new Error("You are not in this game");

    // Verificar estado actual del juego
    const game = await getGameByID(gameId);
    if (!game) {
      console.error("❌ Game fetch error: Game not found");
      throw new Error("Game not found");
    }

    if (game.status !== "playing") {
      throw new Error("Game is not in playing state");
    }

    // Obtener todos los jugadores
    const players = await getGamePlayers(gameId);
    if (!players || players.length === 0) {
      console.error("❌ Players fetch error: No players in the game");
      throw new Error("No players in the game");
    }

    if (!players || players.length < 2) {
      throw new Error("Not enough players to continue");
    }

    // FIXED: Obtener última ronda - usar limit(1) en lugar de single() inicialmente
    const lastRound = await getLastRoundByGame(gameId);

    if (!lastRound) {
      console.error("❌ Round fetch error: No previous round found");
      throw new Error("No previous round found");
    }

    const currentRoundNumber = lastRound?.round_number || 0;
    const nextJudgeIndex = currentRoundNumber % players.length;
    const nextJudge = players[nextJudgeIndex].user_id || players[0].user_id;
    if (!nextJudge) {
      console.error("❌ Next judge not found");
      throw new Error("Next judge not found");
    }

    // Obtener carta de pregunta aleatoria
    const question = getRandomQuestionCard();
    if (!question) {
      console.error("❌ Question not found");
      throw new Error("Question not found");
    }

    // Calcular número de siguiente ronda
    const nextRoundNumber = (lastRound?.round_number || 0) + 1;

    // Crear nueva ronda
    const roundData = {
      game_id: gameId,
      judge_user_id: nextJudge,
      round_number: nextRoundNumber,
      question_card_id: question.id,
      status: "submitting",
    };

    const newRound = await createRound(roundData);

    if (!newRound) {
      console.error("❌ Round creation error: Failed to create next round");
      throw new Error("Failed to create next round");
    }

    return newRound;
  } catch (error) {
    console.error("💥 Error in startNextRound:", error);
    throw error;
  }
}

export async function selectWinner(
  userId: string,
  winningAnswerId: string,
  round: Round,
) {
  try {
    if (!round) throw new Error("Round not found");

    // Verificar que el usuario es el juez
    if (round.judge_user_id !== userId) {
      throw new Error("Only the judge can select winners");
    }
    if (round.status === "finished") {
      throw new Error("This round is already finished");
    }

    // VERIFICACIÓN de la respuesta - FIXED: Use .maybeSingle() or handle multiple rows
    const { data: answer, error: answerError } = await supabase
      .from("round_answers")
      .select("id, round_id, user_id, final_text")
      .eq("id", winningAnswerId)
      .eq("round_id", round.id) // Added this filter for safety
      .maybeSingle(); // Use maybeSingle instead of single

    if (answerError) {
      console.error("❌ Error fetching answer:", answerError);
      throw new Error(`Failed to fetch answer: ${answerError.message}`);
    }

    if (!answer) {
      throw new Error("Answer not found or doesn't belong to this round");
    }

    // OBTENER Y ACTUALIZAR SCORE - VERSIÓN MEJORADA
    const currentPlayer = await getGamePlayer(round.game_id!, answer.user_id);

    if (!currentPlayer) {
      console.error("❌ Error fetching player score:", currentPlayer);
      throw new Error(`Failed to fetch player score`);
    }

    if (!currentPlayer) {
      console.error("❌ Player not found in game");
      throw new Error("Player not found in game");
    }

    const currentScore = currentPlayer.score || 0;
    const newScore = currentScore + 1;

    // ACTUALIZAR SCORE
    await updateGamePlayer({
      game_id: round.game_id!,
      user_id: answer.user_id,
      score: newScore,
    });

    // Marcar la respuesta como ganadora
    const { error: updateAnswerError } = await supabase
      .from("round_answers")
      .update({ is_winner: true })
      .eq("id", winningAnswerId);

    if (updateAnswerError) {
      console.error("❌ Error marking answer as winner:", updateAnswerError);
      throw new Error(`Failed to mark winner: ${updateAnswerError.message}`);
    }

    // Actualizar la ronda como finished
    const { error: updateRoundError } = await supabase
      .from("rounds")
      .update({
        winning_answer_id: winningAnswerId,
        status: "finished",
      })
      .eq("id", round.id);

    if (updateRoundError) {
      console.error("❌ Error updating round:", updateRoundError);
      throw new Error(`Failed to update round: ${updateRoundError.message}`);
    }
    //if newScore is equal to game score_to_win
    const game = await getGameByID(round.game_id!);
    if (newScore === game?.score_to_win) {
      // Mark game as finished
      const { error: updateGameError } = await supabase
        .from("games")
        .update({
          status: "finished",
        })
        .eq("id", round.game_id);

      if (updateGameError) {
        console.error("❌ Error updating game:", updateGameError);
        throw new Error(`Failed to update game: ${updateGameError.message}`);
      }
      return { success: true };
    }

    // Iniciar siguiente ronda después de un delay
    setTimeout(async () => {
      try {
        await startNextRound(userId, round.game_id!);
      } catch (error) {
        console.error("❌ Error starting next round:", error);
      }
    }, 3000);

    return { success: true };
  } catch (error) {
    console.error("💥 Error in selectWinner:", error);
    throw error;
  }
}

export async function dealCardsToPlayers(
  gameId: string,
  cardsPerPlayer: number = 10,
) {
  try {
    // Get all players in the game
    const players = await getGamePlayers(gameId);

    if (!players || players.length === 0) {
      throw new Error("No players found in the game");
    }

    // Get random answer cards
    const answerCards = getRandomAnswerCards(
      cardsPerPlayer * (players?.length || 1),
    );

    if (!answerCards || answerCards.length === 0) {
      throw new Error("No answer cards available");
    }
    const onlyIds = answerCards.map((card) => card.id);

    // Assign cards to players
    const cardAssignments = players?.map((player, index) => ({
      user_id: player.user_id,
      game_id: gameId,
      cards: onlyIds.slice(
        index * cardsPerPlayer,
        (index + 1) * cardsPerPlayer,
      ),
    }));
    if (!cardAssignments) {
      throw new Error("No players found in the game");
    }
    const { error: assignmentError } = await supabase
      .from("player_cards")
      .insert(cardAssignments);

    if (assignmentError) {
      throw assignmentError;
    }

    return cardAssignments.length;
  } catch (error) {
    console.error("Error dealing cards:", error);
    throw error;
  }
}

// Leave game
export async function leaveGame(userId: string, gameId: string) {
  try {
    const { error } = await supabase
      .from("game_players")
      .delete()
      .eq("game_id", gameId)
      .eq("user_id", userId);

    if (error) throw error;

    // Check if game is empty and delete it if needed
    const remainingPlayers = await getGamePlayers(gameId);

    if (!remainingPlayers || remainingPlayers.length === 0) {
      await supabase.from("games").delete().eq("id", gameId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in leaveGame:", error);
    throw error;
  }
}
