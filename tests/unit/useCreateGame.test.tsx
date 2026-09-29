import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateGame } from "@/hooks/useCreateGame";
import { GAME_CONSTANTS } from "@/constants/gamesettings";

const mocks = vi.hoisted(() => ({
  createGameAction: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/lib/actions/game.actions", () => ({
  createGameAction: mocks.createGameAction,
}));
vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: true, userId: "user_1" }),
}));
vi.mock("@/providers/GameProvider", () => ({
  useGame: () => ({}),
}));
vi.mock("@/lib/errorHandler", () => ({
  logError: mocks.logError,
}));

function stubLocationAssign() {
  const original = window.location;
  const assign = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { ...original, assign },
  });
  return {
    assign,
    restore: () =>
      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: original,
      }),
  };
}

describe("useCreateGame", () => {
  let location: ReturnType<typeof stubLocationAssign>;

  beforeEach(() => {
    mocks.createGameAction.mockReset();
    mocks.toastError.mockReset();
    mocks.logError.mockReset();
    location = stubLocationAssign();
  });

  afterEach(() => {
    location.restore();
  });

  it("returns default settings", () => {
    const { result } = renderHook(() => useCreateGame());
    expect(result.current.settings).toEqual({
      maxPlayers: GAME_CONSTANTS.DEFAULT_PLAYERS,
      scoreToWin: GAME_CONSTANTS.DEFAULT_SCORE,
    });
    expect(result.current.createLoading).toBe(false);
    expect(result.current.showSettings).toBe(false);
  });

  it("updates a single setting", () => {
    const { result } = renderHook(() => useCreateGame());
    act(() => result.current.updateSetting("maxPlayers", 6));
    expect(result.current.settings.maxPlayers).toBe(6);
    expect(result.current.settings.scoreToWin).toBe(GAME_CONSTANTS.DEFAULT_SCORE);
  });

  it("toggles settings visibility", () => {
    const { result } = renderHook(() => useCreateGame());
    act(() => result.current.toggleSettings());
    expect(result.current.showSettings).toBe(true);
    act(() => result.current.toggleSettings());
    expect(result.current.showSettings).toBe(false);
  });

  it("creates a game and redirects using the default settings", async () => {
    mocks.createGameAction.mockResolvedValue({ id: "game-1" });
    const { result } = renderHook(() => useCreateGame());

    await act(async () => {
      await result.current.handleCreateGame();
    });

    expect(mocks.createGameAction).toHaveBeenCalledWith(
      GAME_CONSTANTS.DEFAULT_PLAYERS,
      GAME_CONSTANTS.DEFAULT_SCORE
    );
    expect(location.assign).toHaveBeenCalledWith("/game/game-1");
    expect(result.current.createLoading).toBe(false);
  });

  it("creates a game with custom settings", async () => {
    mocks.createGameAction.mockResolvedValue({ id: "game-2" });
    const { result } = renderHook(() => useCreateGame());

    act(() => result.current.updateSetting("maxPlayers", 4));
    act(() => result.current.updateSetting("scoreToWin", 5));
    await act(async () => {
      await result.current.handleCreateGame();
    });

    expect(mocks.createGameAction).toHaveBeenCalledWith(4, 5);
    expect(location.assign).toHaveBeenCalledWith("/game/game-2");
  });

  it("shows a validation toast and does not call the action for invalid settings", async () => {
    const { result } = renderHook(() => useCreateGame());

    act(() =>
      result.current.updateSetting("maxPlayers", GAME_CONSTANTS.MIN_PLAYERS - 1)
    );
    await act(async () => {
      await result.current.handleCreateGame();
    });

    expect(mocks.createGameAction).not.toHaveBeenCalled();
    expect(location.assign).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      `Player count must be between ${GAME_CONSTANTS.MIN_PLAYERS} and ${GAME_CONSTANTS.MAX_PLAYERS}`,
      expect.anything()
    );
  });

  it("handles a create action that returns no game id", async () => {
    mocks.createGameAction.mockResolvedValue(null);
    const { result } = renderHook(() => useCreateGame());

    await act(async () => {
      await result.current.handleCreateGame();
    });

    expect(location.assign).not.toHaveBeenCalled();
    expect(mocks.logError).toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Failed to create game. Please try again.",
      expect.anything()
    );
    expect(result.current.createLoading).toBe(false);
  });

  it("handles a rejected create action", async () => {
    mocks.createGameAction.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCreateGame());

    await act(async () => {
      await result.current.handleCreateGame();
    });

    expect(location.assign).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalled();
  });
});