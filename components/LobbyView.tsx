import { Game, GamePlayer } from "@/lib/types";
import { startGame } from "@/services/gameService";
import { FaUser, FaStar } from "react-icons/fa";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { showToast } from "@/components/Toast";
import { getErrorMessage, logError } from "@/lib/errorHandler";

export default function LobbyView({
  game,
  players,
}: {
  game: Game;
  players: GamePlayer[];
}) {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const isHost = game?.host_player_id === user?.id;

  async function handleCopyCode() {
    if (game?.code) {
      await navigator.clipboard.writeText(game.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShareGame() {
    if (game?.code) {
      try {
        await navigator.share({
          title: "Join my game!",
          text: `Join my game using this code: ${game.code}`,
        });
        showToast("Game code shared successfully!", "success");
      } catch (error) {
        // User cancelled sharing or error occurred
        if (error instanceof Error && error.name !== "AbortError") {
          logError(error, "handleShareGame");
          showToast(getErrorMessage(error), "error");
        }
      }
    }
  }

  async function handleStartGame() {
    if (players && players.length < 2) {
      showToast("Necesitas al menos 2 jugadores para iniciar el juego", "warning");
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        showToast("Usuario no encontrado", "error");
        return;
      }
      if (!game?.id) {
        showToast("Juego no encontrado", "error");
        return;
      }
      await startGame(user.id, game.id as string);
      showToast("¡Juego iniciado!", "success");
    } catch (error: any) {
      logError(error, "handleStartGame");
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1  md:max-w-xl mx-auto px-6 h-screen">
      {/* Header */}
      <div className="items-center mb-8 md:mb-4">
        <div className="text-3xl font-bold text-white text-center mb-4 py-2 bg-[#99184e]/90 rounded-lg">
          Game Lobby
        </div>
        <div className="text-white/80 text-lg text-center mt-2 italic">
          Waiting for players to join...
        </div>
      </div>

      {/* Game Code Card */}
      <div className="bg-white rounded-3xl p-2  shadow-lg mb-6 md:mb-2 flex flex-col md:flex-row justify-around items-center ">
        <div className="text-gray-600  font-medium mb-3 md:mb-1">
          Share this code with friends:
        </div>
        <div className=" justify-between items-center mb-4 md:mb-1 flex flex-col md:flex-row gap-4 ">
          <div className="text-xl font-bold text-[#99184e] tracking-widest">
            {game?.code}
          </div>
          <div className="flex-row space-x-2">
            <button
              className={`p-3 rounded-2xl ${
                copied ? "bg-green-100" : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={handleCopyCode}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
            <button
              className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200"
              onClick={handleShareGame}
            >
              Share
            </button>
          </div>
        </div>
        {copied && (
          <div className="text-green-600 text-sm font-medium text-center">
            ✓ Copied to clipboard!
          </div>
        )}
      </div>

      {/* Players Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 md:mb-2 flex-1">
        <div className="flex-row justify-between items-center mb-2">
          <div className="text-xl font-bold text-gray-800">
            Players ({players?.length || 0})
          </div>
          {players && players.length < 2 && (
            <div className="bg-amber-100 px-3 py-1 rounded-full">
              <div className="text-amber-800 text-sm font-medium">
                Need {3 - players.length} more
              </div>
            </div>
          )}
        </div>

        {players && players.length > 0 ? (
          players.map((item: GamePlayer) => (
            <div
              className="flex-row justify-between items-center px-4 py-2 bg-gray-50 rounded-2xl mb-3"
              key={item.id}
            >
              <div className=" items-center flex flex-row">
                <div className="w-5 h-5 bg-[#99184e] rounded-full flex items-center justify-center mr-1">
                  {/* <FaUser className="text-base text-white" /> */}
                  {/* item.profile?.avatar_url*/}
                  {item.profile?.avatar_url &&
                  item.profile?.avatar_url !== "" ? (
                    <Image
                      src={item.profile?.avatar_url}
                      alt="Profile"
                      className="w-5 h-5 rounded-full"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <FaUser className="text-base text-white" />
                  )}
                </div>
                <div className=" font-semibold text-gray-800 text-base">
                  {item.profile?.full_name ||
                    item.user?.full_name ||
                    "Unknown Player"}
                  {item.id === user?.id && (
                    <span className="text-[#99184e]"> (You)</span>
                  )}
                </div>
              </div>
              {item.id === game?.host_player_id && (
                <div className="flex-row items-center bg-[#99184e] px-3 py-1 rounded-full">
                  <FaStar />
                  <div className="text-white text-sm font-bold ml-1">Host</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="items-center justify-center py-12">
            <div className="text-gray-500 text-lg font-medium mt-4">
              No players yet
            </div>
            <div className="text-gray-400 text-center mt-2">
              Share the game code to invite friends!
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isHost ? (
        <div className="bg-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-around">
          <button
            className={`
              py-4 rounded-2xl items-center
              ${
                players && players.length >= 2 && !loading
                  ? "bg-[#99184e]"
                  : "bg-gray-300 hover:bg-gray-200"
              }
            `}
            onClick={handleStartGame}
            disabled={loading || !players || players.length < 3}
          >
            {loading ? (
              <div className="flex-row items-center">
                <div className="text-white text-lg font-bold ml-2">
                  Starting Game...
                </div>
              </div>
            ) : (
              <div className="flex-row items-center">
                <div className="text-white text-lg font-bold mx-2">
                  {players.length < 3 ? "Need at least 3 players" : "Start Game"}
                </div>
              </div>
            )}
          </button>

          {players && players.length < 2 && (
            <div className="text-amber-600 text-sm text-center mt-3 font-medium">
              Invite {3 - players.length} more player
              {players.length === 1 ? "" : "s"} to start
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="items-center">
            <div className="text-gray-700 text-lg font-semibold text-center mt-2">
              Waiting for host to start the game
            </div>
            <div className="text-gray-500 text-center mt-2">
              Invite more friends while you wait!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
