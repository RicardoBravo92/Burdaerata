import { describe, expect, it } from "vitest";
import { sanitizeGameCode, validateGameCode } from "@/lib/validation";

describe("validateGameCode", () => {
  it("rejects an empty code", () => {
    const result = validateGameCode("");
    expect(result).toEqual({
      valid: false,
      error: "El código de juego no puede estar vacío",
    });
  });

  it("rejects a whitespace-only code", () => {
    expect(validateGameCode("   ").valid).toBe(false);
  });

  it("rejects codes with incorrect length", () => {
    expect(validateGameCode("12345")).toEqual({
      valid: false,
      error: "El código debe tener exactamente 6 caracteres",
    });
    expect(validateGameCode("1234567").valid).toBe(false);
  });

  it("rejects codes containing non-numeric characters", () => {
    expect(validateGameCode("12345a")).toEqual({
      valid: false,
      error: "El código debe contener solo números",
    });
    expect(validateGameCode("abc123").valid).toBe(false);
  });

  it("accepts a valid 6-digit code", () => {
    expect(validateGameCode("123456")).toEqual({ valid: true });
  });
});

describe("sanitizeGameCode", () => {
  it("trims surrounding whitespace", () => {
    expect(sanitizeGameCode("  123456  ")).toBe("123456");
  });

  it("strips non-digit characters", () => {
    expect(sanitizeGameCode("a1b2c3d4e5f6")).toBe("123456");
  });

  it("limits the result to 6 digits", () => {
    expect(sanitizeGameCode("1234567890")).toBe("123456");
  });

  it("returns an empty string when there are no digits", () => {
    expect(sanitizeGameCode("hola")).toBe("");
  });
});