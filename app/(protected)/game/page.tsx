"use client";
import { createGame, joinGame } from "@/services/gameService";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { showToast } from "@/components/Toast";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import { validateGameCode, sanitizeGameCode } from "@/lib/validation";

export default function HomeTab() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [scoreToWin, setScoreToWin] = useState(10);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  async function handleCreateGame() {
    setLoading(true);
    try {
      if (!user) {
        showToast("Usuario no encontrado. Por favor, inicia sesión.", "error");
        return;
      }
      const newGame = await createGame(user.id, maxPlayers, scoreToWin);
      if (newGame) {
        showToast("¡Juego creado exitosamente!", "success");
        router.push(`/game/${newGame.id}`);
      } else {
        showToast("No se pudo crear el juego. Intenta de nuevo.", "error");
      }
    } catch (error: any) {
      logError(error, "handleCreateGame");
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame() {
    const sanitizedCode = sanitizeGameCode(code);
    const validation = validateGameCode(sanitizedCode);
    
    if (!validation.valid) {
      showToast(validation.error || "Código de juego inválido", "warning");
      setCode(sanitizedCode);
      return;
    }

    setJoinLoading(true);
    try {
      if (!user) {
        showToast("Usuario no encontrado. Por favor, inicia sesión.", "error");
        return;
      }
      const joinedGame = await joinGame(user.id, sanitizedCode);
      if (joinedGame) {
        showToast("¡Te uniste al juego exitosamente!", "success");
        router.push(`/game/${joinedGame.id}`);
      } else {
        showToast("No se pudo unir al juego. Verifica el código.", "error");
      }
    } catch (error: any) {
      logError(error, "handleJoinGame");
      showToast(getErrorMessage(error), "error");
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <div className="h-lvh   items-center justify-center p-6 ">
      {/* Main Actions Container */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-2xl mx-auto">
        {/* Create Game Card */}
        <div className="bg-white rounded-3xl p-8 md:p-2 shadow-lg mb-8 md:mb-4">
          <div className="text-center mb-6 md:mb-2">
            <h2 className="text-3xl md:text-xl font-bold text-gray-800 mb-1">
              Create New Game
            </h2>
            <p className="text-gray-600 text-lg md:text-base leading-6">
              Start a new game session and invite your friends to join the fun!
            </p>
          </div>

          {/* Game Settings */}
          {showSettings && (
            <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Players: {maxPlayers}
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score to Win: {scoreToWin}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={scoreToWin}
                  onChange={(e) => setScoreToWin(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="space-y-4 md:space-y-1">
            <button
              onClick={handleCreateGame}
              disabled={loading}
              className={`
                block mx-auto w-full md:w-[280px] px-6 py-4 md:py-3 rounded-2xl text-white
                font-semibold text-lg md:text-sm transition-all duration-200
                flex items-center justify-center
                ${
                  loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 hover:scale-105"
                }
              `}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Game...
                </div>
              ) : (
                "Create Game"
              )}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full py-3 md:py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              {showSettings ? "Hide Settings" : "Game Settings"}
            </button>
          </div>
        </div>

        {/* Join Game Card */}
        <div className="bg-white rounded-3xl p-8 md:p-4 shadow-lg">
          <div className="text-center mb-6 md:mb-2">
            <h2 className="text-3xl md:text-xl font-bold text-gray-800 mb-2">
              Join Game
            </h2>
            <p className="text-gray-600 text-lg md:text-base leading-6">
              Enter a game code to join your friend's session
            </p>
          </div>

          <button
            onClick={() => setShowJoinModal(true)}
            className="block mx-auto w-full md:w-[280px] px-6 py-4 md:py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg md:text-sm rounded-2xl transition-all duration-200 hover:scale-105"
          >
            Join with Code
          </button>
        </div>
      </div>

      {/* Join Game Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Enter Game Code
              </h3>
              <p className="text-gray-600 text-base">
                Ask your friend for the 6-character game code
              </p>
            </div>

            <input
              className="
                w-full border-2 border-gray-200 p-4 rounded-2xl
                text-lg mb-6 bg-gray-50 text-center font-semibold
                tracking-widest uppercase focus:border-blue-500 focus:outline-none
              "
              placeholder="ENTER CODE"
              value={code}
              maxLength={6}
              onChange={(e) => {
                const sanitized = sanitizeGameCode(e.target.value);
                setCode(sanitized);
              }}
              autoFocus
            />

            <div className="flex space-x-4">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinGame}
                disabled={!code.trim() || code.length !== 6 || joinLoading}
                className={`
                  flex-1 py-3 text-white font-semibold rounded-2xl transition-all
                  ${
                    !code.trim() || code.length !== 6 || joinLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }
                `}
              >
                {joinLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  "Join Game"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
