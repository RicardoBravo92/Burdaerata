"use client";
import { createGame, joinGame } from "@/services/gameService";
import { useState } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

export default function HomeTab() {
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
        throw new Error("User not found");
      }
      const newGame = await createGame(user.id, maxPlayers, scoreToWin);
      redirect(`/game/${newGame.id}`);
    } catch (error: any) {
      console.error("Error creating game:", error);
      alert(error.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame() {
    setJoinLoading(true);
    try {
      if (!user) {
        throw new Error("User not found");
      }
      const joinedGame = await joinGame(user.id, code);
      redirect(`/game/${joinedGame.id}`);
    } catch (error: any) {
      console.error("Error joining game:", error);
      alert(error.message || "Failed to join game");
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
              onChange={(e) => setCode(e.target.value.toUpperCase())}
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
