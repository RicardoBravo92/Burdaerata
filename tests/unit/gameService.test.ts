import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/websocket";
import { cardService } from "@/services/cardService";
import * as gameService from "@/services/gameService";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/lib/websocket", () => ({
  wsClient: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(() => vi.fn()),
    off: vi.fn(),
    send: vi.fn(),
  },
}));

vi.mock("@/services/cardService", () => ({
  cardService: { getQuestionText: vi.fn(), getAnswersText: vi.fn() },
}));

const getMock = vi.mocked(api.get);
const postMock = vi.mocked(api.post);

const game = {
  id: "game-1",
  code: "123456",
  status: "waiting",
  host_player_id: "p1",
  max_players: 8,
  score_to_win: 10,
  public: true,
};

describe("gameService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createGame", () => {
    it("posts with default settings when no params are given", async () => {
      postMock.mockResolvedValueOnce(game);
      await expect(gameService.createGame()).resolves.toEqual(game);
      expect(postMock).toHaveBeenCalledWith("/api/v1/games", {
        max_players: 8,
        score_to_win: 7,
      });
    });

    it("posts with custom params", async () => {
      postMock.mockResolvedValueOnce(game);
      await gameService.createGame({ max_players: 12, score_to_win: 20 });
      expect(postMock).toHaveBeenCalledWith("/api/v1/games", {
        max_players: 12,
        score_to_win: 20,
      });
    });

    it("fills defaults for partial params", async () => {
      postMock.mockResolvedValueOnce(game);
      await gameService.createGame({ max_players: 4 });
      expect(postMock).toHaveBeenCalledWith("/api/v1/games", {
        max_players: 4,
        score_to_win: 7,
      });
    });
  });

  describe("getGameByID", () => {
    it("returns the game on success", async () => {
      getMock.mockResolvedValueOnce(game);
      await expect(gameService.getGameByID("game-1")).resolves.toEqual(game);
      expect(getMock).toHaveBeenCalledWith("/api/v1/games/game-1");
    });

    it("returns null when the request fails", async () => {
      getMock.mockRejectedValueOnce(new Error("game not found"));
      await expect(gameService.getGameByID("game-1")).resolves.toBeNull();
    });
  });

  describe("getGameByCode", () => {
    it("returns the game on success", async () => {
      getMock.mockResolvedValueOnce(game);
      await expect(gameService.getGameByCode("123456")).resolves.toEqual(game);
      expect(getMock).toHaveBeenCalledWith("/api/v1/games/by-code/123456");
    });

    it("returns null when the request fails", async () => {
      getMock.mockRejectedValueOnce(new Error("boom"));
      await expect(gameService.getGameByCode("123456")).resolves.toBeNull();
    });
  });

  describe("joinGame", () => {
    it("posts the code to the join endpoint", async () => {
      postMock.mockResolvedValueOnce(game);
      await expect(gameService.joinGame("123456")).resolves.toEqual(game);
      expect(postMock).toHaveBeenCalledWith("/api/v1/games/join", { code: "123456" });
    });
  });

  describe("getGamePlayers", () => {
    it("gets the players for a game", async () => {
      getMock.mockResolvedValueOnce([]);
      await gameService.getGamePlayers("game-1");
      expect(getMock).toHaveBeenCalledWith("/api/v1/games/game-1/players");
    });
  });

  describe("startGame", () => {
    it("posts to the start endpoint", async () => {
      const round = { id: "r1", status: "playing" };
      postMock.mockResolvedValueOnce(round);
      await expect(gameService.startGame("game-1")).resolves.toEqual(round);
      expect(postMock).toHaveBeenCalledWith("/api/v1/games/game-1/start");
    });
  });

  describe("getLastRound", () => {
    it("returns the last round on success", async () => {
      const round = { id: "r1", status: "playing" };
      getMock.mockResolvedValueOnce(round);
      await expect(gameService.getLastRound("game-1")).resolves.toEqual(round);
    });

    it("returns null when the request fails", async () => {
      getMock.mockRejectedValueOnce(new Error("no round"));
      await expect(gameService.getLastRound("game-1")).resolves.toBeNull();
    });
  });

  describe("startNextRound", () => {
    it("posts to the next round endpoint", async () => {
      const round = { id: "r2" };
      postMock.mockResolvedValueOnce(round);
      await expect(gameService.startNextRound("game-1")).resolves.toEqual(round);
      expect(postMock).toHaveBeenCalledWith("/api/v1/games/game-1/rounds/next");
    });
  });

  describe("getRoundAnswers", () => {
    it("gets answers for a round", async () => {
      getMock.mockResolvedValueOnce([]);
      await gameService.getRoundAnswers("r1");
      expect(getMock).toHaveBeenCalledWith("/api/v1/games/rounds/r1/answers");
    });
  });

  describe("submitAnswer", () => {
    it("posts the used cards", async () => {
      const answer = { id: "a1" };
      postMock.mockResolvedValueOnce(answer);
      await expect(gameService.submitAnswer("r1", ["c1", "c2"])).resolves.toEqual(answer);
      expect(postMock).toHaveBeenCalledWith("/api/v1/games/rounds/r1/answers", {
        cards_used: ["c1", "c2"],
      });
    });
  });

  describe("selectWinner", () => {
    it("posts the winning answer id", async () => {
      const answer = { id: "a1", is_winner: true };
      postMock.mockResolvedValueOnce(answer);
      await expect(gameService.selectWinner("r1", "ans1")).resolves.toEqual(answer);
      expect(postMock).toHaveBeenCalledWith("/api/v1/games/rounds/r1/winner", {
        winning_answer_id: "ans1",
      });
    });
  });

  describe("getMyCards", () => {
    it("gets the current player cards", async () => {
      const payload = { game_id: "game-1", user_id: "u1", cards: ["c1"] };
      getMock.mockResolvedValueOnce(payload);
      await expect(gameService.getMyCards("game-1")).resolves.toEqual(payload);
      expect(getMock).toHaveBeenCalledWith("/api/v1/games/game-1/players/me/cards");
    });
  });

  describe("leaveGame", () => {
    it("posts to the leave endpoint", async () => {
      postMock.mockResolvedValueOnce({ success: true });
      await expect(gameService.leaveGame("game-1")).resolves.toEqual({ success: true });
      expect(postMock).toHaveBeenCalledWith("/api/v1/games/game-1/leave");
    });
  });

  describe("websocket bridge", () => {
    it("connects and disconnects via the ws client", () => {
      gameService.connectToGame("game-1", "token");
      expect(wsClient.connect).toHaveBeenCalledWith("game-1", "token");
      gameService.disconnectFromGame();
      expect(wsClient.disconnect).toHaveBeenCalled();
    });

    it("subscribes and unsubscribes game events", () => {
      const handler = vi.fn();
      const unsubscribe = gameService.onGameEvent("player_joined", handler);
      expect(wsClient.on).toHaveBeenCalledWith("player_joined", handler);
      unsubscribe();
      gameService.offGameEvent("player_joined", handler);
      expect(wsClient.off).toHaveBeenCalledWith("player_joined", handler);
    });
  });

  describe("card text bridge", () => {
    it("delegates question text to cardService", async () => {
      vi.mocked(cardService.getQuestionText).mockResolvedValueOnce("Q?");
      await expect(gameService.getQuestionText("q1")).resolves.toBe("Q?");
      expect(cardService.getQuestionText).toHaveBeenCalledWith("q1");
    });

    it("delegates answer texts to cardService", async () => {
      vi.mocked(cardService.getAnswersText).mockResolvedValueOnce({ a1: "T" });
      await expect(gameService.getAnswerTexts(["a1"])).resolves.toEqual({ a1: "T" });
      expect(cardService.getAnswersText).toHaveBeenCalledWith(["a1"]);
    });
  });

  describe("getPlayerCards and flows", () => {
    it("getPlayerCards returns the cards array", async () => {
      getMock.mockResolvedValueOnce({ game_id: "game-1", user_id: "u1", cards: ["c1", "c2"] });
      await expect(gameService.getPlayerCards("game-1")).resolves.toEqual(["c1", "c2"]);
    });

    it("submitAnswerFlow submits and updates the player cards", async () => {
      postMock.mockResolvedValueOnce({ id: "a1" });
      getMock.mockResolvedValueOnce({ game_id: "game-1", user_id: "u1", cards: ["c3"] });
      const setMyCards = vi.fn();

      const result = await gameService.submitAnswerFlow("r1", "game-1", ["c1"], setMyCards);

      expect(result).toEqual({ id: "a1" });
      expect(setMyCards).toHaveBeenCalledWith(["c3"]);
    });

    it("createGameFlow and joinGameFlow pass through", async () => {
      postMock.mockResolvedValueOnce(game);
      await expect(gameService.createGameFlow("u1")).resolves.toEqual(game);
      postMock.mockResolvedValueOnce(game);
      await expect(gameService.joinGameFlow("123456")).resolves.toEqual(game);
    });
  });
});