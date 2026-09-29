import { describe, expect, it, vi } from "vitest";
import {
  AppError,
  getErrorMessage,
  logError,
} from "@/lib/errorHandler";

describe("AppError", () => {
  it("extends Error with name, message and optional code", () => {
    const error = new AppError("boom", "CREATE_FAILED", "Mensaje amigable");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.message).toBe("boom");
    expect(error.code).toBe("CREATE_FAILED");
    expect(error.userMessage).toBe("Mensaje amigable");
  });
});

describe("getErrorMessage", () => {
  it("uses userMessage for AppError when present", () => {
    const error = new AppError("boom", "X", "Cosas bonitas");
    expect(getErrorMessage(error)).toBe("Cosas bonitas");
  });

  it("falls back to the raw message for AppError without userMessage", () => {
    const error = new AppError("raw boom");
    expect(getErrorMessage(error)).toBe("raw boom");
  });

  it.each([
    ["game not found", "El juego no existe o ha sido eliminado"],
    ["Game is full", "El juego está lleno. Intenta con otro código"],
    ["You are already in this game", "Ya estás en este juego"],
    ["failed to generate unique game code", "No se pudo crear el juego. Intenta de nuevo"],
    ["resource not found", "Recurso no encontrado"],
    ["permission denied", "No tienes permiso para realizar esta acción"],
    ["unauthorized", "No tienes permiso para realizar esta acción"],
    ["network request failed", "Error de conexión. Verifica tu internet"],
    ["fetch failed", "Error de conexión. Verifica tu internet"],
  ])("maps %s to a friendly message", (raw, expected) => {
    expect(getErrorMessage(new Error(raw))).toBe(expected);
  });

  it("returns the default message for an unknown error", () => {
    expect(getErrorMessage(new Error("something weird"))).toBe(
      "Ocurrió un error inesperado. Por favor, intenta de nuevo"
    );
  });

  it("returns a generic message for non-Error values", () => {
    expect(getErrorMessage("no soy un error")).toBe("Ocurrió un error inesperado");
    expect(getErrorMessage(null)).toBe("Ocurrió un error inesperado");
  });
});

describe("logError", () => {
  it("logs the error with the given context", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError(new Error("fallo"), "handleJoinGame");
    expect(spy).toHaveBeenCalledTimes(1);
    const payload = spy.mock.calls[0][1] as Record<string, unknown>;
    expect(String(spy.mock.calls[0][0])).toContain("[handleJoinGame]");
    expect(payload.message).toBe("fallo");
    spy.mockRestore();
  });

  it("stringifies non-Error values", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("simple");
    expect(String(spy.mock.calls[0][1].message)).toBe("simple");
    spy.mockRestore();
  });
});