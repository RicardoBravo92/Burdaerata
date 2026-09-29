import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { cardService } from "@/services/cardService";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn() },
}));

const getMock = vi.mocked(api.get);

describe("cardService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    cardService.clearCache();
  });

  describe("getQuestions", () => {
    it("fetches the question list and caches it", async () => {
      const questions = [{ id: "q1", blank_count: 1 }];
      getMock.mockResolvedValueOnce(questions);

      const first = await cardService.getQuestions();
      const second = await cardService.getQuestions();

      expect(first).toEqual(questions);
      expect(second).toEqual(questions);
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith("/api/v1/cards/questions");
    });
  });

  describe("getQuestion", () => {
    it("fetches an uncached question and caches its text", async () => {
      getMock.mockResolvedValueOnce({ id: "q1", blank_count: 2, text: "Text _" });

      const question = await cardService.getQuestion("q1");

      expect(question).toEqual({ id: "q1", blank_count: 2, text: "Text _" });
      expect(getMock).toHaveBeenLastCalledWith("/api/v1/cards/questions/q1");
    });

    it("returns the cached question without another fetch", async () => {
      getMock.mockResolvedValueOnce([{ id: "q1", blank_count: 2 }]);
      getMock.mockResolvedValueOnce({ id: "q1", blank_count: 2, text: "Text _" });

      await cardService.getQuestions();
      await cardService.getQuestion("q1");
      const cached = await cardService.getQuestion("q1");

      expect(cached).toEqual({ id: "q1", blank_count: 2, text: "Text _" });
      expect(getMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("getAnswers", () => {
    it("fetches the answer list and caches it", async () => {
      const answers = [{ id: "a1" }];
      getMock.mockResolvedValueOnce(answers);

      const first = await cardService.getAnswers();
      const second = await cardService.getAnswers();

      expect(first).toEqual(answers);
      expect(second).toEqual(answers);
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith("/api/v1/cards/answers");
    });
  });

  describe("getAnswer", () => {
    it("fetches an uncached answer", async () => {
      getMock.mockResolvedValueOnce({ id: "a1", text: "Answer" });

      const answer = await cardService.getAnswer("a1");

      expect(answer).toEqual({ id: "a1", text: "Answer" });
      expect(getMock).toHaveBeenCalledWith("/api/v1/cards/answers/a1");
    });

    it("returns a cached answer without another fetch", async () => {
      getMock.mockResolvedValueOnce({ id: "a1", text: "Answer" });

      await cardService.getAnswer("a1");
      const cached = await cardService.getAnswer("a1");

      expect(cached).toEqual({ id: "a1", text: "Answer" });
      expect(getMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAnswersText", () => {
    it("fetches only uncached ids", async () => {
      getMock.mockResolvedValueOnce({ id: "a1", text: "One" });
      getMock.mockResolvedValueOnce({ id: "a2", text: "Two" });

      const result = await cardService.getAnswersText(["a1", "a2"]);
      expect(result).toEqual({ a1: "One", a2: "Two" });
      expect(getMock).toHaveBeenCalledTimes(2);

      const cached = await cardService.getAnswersText(["a1", "a2"]);
      expect(cached).toEqual({ a1: "One", a2: "Two" });
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    it("resolves texts for every requested id", async () => {
      getMock.mockResolvedValue({ id: "a1", text: "Only" });

      const result = await cardService.getAnswersText(["a1", "a1"]);
      expect(result).toEqual({ a1: "Only" });
    });
  });

  describe("getQuestionText", () => {
    it("fetches text for an uncached question", async () => {
      getMock.mockResolvedValueOnce({ id: "q1", blank_count: 1, text: "Q?" });
      expect(await cardService.getQuestionText("q1")).toBe("Q?");
    });

    it("returns cached text without another fetch", async () => {
      getMock.mockResolvedValueOnce({ id: "q1", blank_count: 1, text: "Q?" });
      await cardService.getQuestionText("q1");
      expect(await cardService.getQuestionText("q1")).toBe("Q?");
      expect(getMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearCache", () => {
    it("forces a new fetch after clearing", async () => {
      getMock.mockResolvedValueOnce([{ id: "q1", blank_count: 1 }]);
      await cardService.getQuestions();
      cardService.clearCache();
      await cardService.getQuestions();
      expect(getMock).toHaveBeenCalledTimes(2);
    });
  });
});