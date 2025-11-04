/**
 * Validation utilities for user input
 */

/**
 * Validates a game code format
 */
export function validateGameCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "El código de juego no puede estar vacío" };
  }

  if (code.length !== 6) {
    return { valid: false, error: "El código debe tener exactamente 6 caracteres" };
  }

  if (!/^\d{6}$/.test(code)) {
    return { valid: false, error: "El código debe contener solo números" };
  }

  return { valid: true };
}

/**
 * Sanitizes a game code (uppercase, trim, remove non-numeric)
 */
export function sanitizeGameCode(code: string): string {
  return code.trim().replace(/\D/g, "").slice(0, 6);
}

