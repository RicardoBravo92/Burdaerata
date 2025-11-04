/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Converts an error to a user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    // Map common error messages to user-friendly ones
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("game not found")) {
      return "El juego no existe o ha sido eliminado";
    }

    if (errorMessage.includes("game is full")) {
      return "El juego está lleno. Intenta con otro código";
    }

    if (errorMessage.includes("already in this game")) {
      return "Ya estás en este juego";
    }

    if (errorMessage.includes("failed to generate unique game code")) {
      return "No se pudo crear el juego. Intenta de nuevo";
    }

    if (errorMessage.includes("not found")) {
      return "Recurso no encontrado";
    }

    if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
      return "No tienes permiso para realizar esta acción";
    }

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "Error de conexión. Verifica tu internet";
    }

    // Default user-friendly message
    return "Ocurrió un error inesperado. Por favor, intenta de nuevo";
  }

  return "Ocurrió un error inesperado";
}

/**
 * Logs error with context
 */
export function logError(error: unknown, context?: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextMessage = context ? `[${context}]` : "";
  
  console.error(`${contextMessage} Error:`, {
    message: errorMessage,
    error,
    timestamp: new Date().toISOString(),
  });
}

