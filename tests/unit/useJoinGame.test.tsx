import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useJoinGame } from "@/hooks/useJoinGame";
import { getErrorMessage } from "@/lib/errorHandler";

const mocks = vi.hoisted(() => ({
  joinGameAction: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  logError: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/lib/actions/game.actions", () => ({
  joinGameAction: mocks.joinGameAction,
}));
vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/lib/errorHandler", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/errorHandler")>("@/lib/errorHandler");
  return { ...actual, logError: mocks.logError };
});

describe("useJoinGame", () => {
  beforeEach(() => {
    mocks.joinGameAction.mockReset();
    mocks.toastError.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.logError.mockReset();
    mocks.push.mockReset();
  });

  it("starts with an empty code and no loading state", () => {
    const { result } = renderHook(() => useJoinGame());
    expect(result.current.code).toBe("");
    expect(result.current.joinLoading).toBe(false);
  });

  it("joins a game and navigates to it", async () => {
    mocks.joinGameAction.mockResolvedValue({ id: "game-1" });
    const { result } = renderHook(() => useJoinGame());

    act(() => result.current.setCode("123456"));
    await act(async () => {
      await result.current.handleJoinGame();
    });

    expect(mocks.joinGameAction).toHaveBeenCalledWith("123456");
    expect(mocks.toastSuccess).toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith("/game/game-1");
    expect(result.current.joinLoading).toBe(false);
  });

  it("shows an error and clears the code when the game cannot be joined", async () => {
    mocks.joinGameAction.mockResolvedValue(null);
    const { result } = renderHook(() => useJoinGame());

    act(() => result.current.setCode("123456"));
    await act(async () => {
      await result.current.handleJoinGame();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(
      "Failed to join game. Check the code.",
      expect.anything()
    );
    expect(result.current.code).toBe("");
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("maps errors to friendly messages", async () => {
    mocks.joinGameAction.mockRejectedValue(new Error("game not found"));
    const { result } = renderHook(() => useJoinGame());

    act(() => result.current.setCode("999999"));
    await act(async () => {
      await result.current.handleJoinGame();
    });

    expect(mocks.logError).toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      getErrorMessage(new Error("game not found")),
      expect.anything()
    );
  });
});