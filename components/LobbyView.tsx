import { Game, GamePlayer } from "@/lib/types";
import { startGame } from "@/services/gameService";
import { FaUser, FaStar } from "react-icons/fa";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

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
      } catch (error) {
        console.error("Error sharing game:", error);
      }
    }
  }

  async function handleStartGame() {
    if (players && players.length < 2) {
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        return;
      }
      if (!game?.id) {
        return;
      }
      await startGame(user.id, game.id as string);
    } catch (error: any) {
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
        <div className="div-gray-600  font-medium mb-3 md:mb-1">
          Share this code with friends:
        </div>
        <div className=" justify-between items-center mb-4 md:mb-1 flex flex-col md:flex-row gap-4 ">
          <div className="div-4xl font-bold div-[#99184e] tracking-widest">
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
          <div className="div-green-600 div-sm font-medium div-center">
            ✓ Copied to clipboard!
          </div>
        )}
      </div>

      {/* Players Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 md:mb-2 flex-1">
        <div className="flex-row justify-between items-center mb-2">
          <div className="div-xl font-bold div-gray-800">
            Players ({players?.length || 0})
          </div>
          {players && players.length < 2 && (
            <div className="bg-amber-100 px-3 py-1 rounded-full">
              <div className="div-amber-800 div-sm font-medium">
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
                <div className=" font-semibold div-gray-800 text-base">
                  {item.profile?.full_name ||
                    item.user?.full_name ||
                    "Unknown Player"}
                  {item.id === user?.id && (
                    <div className="div-[#99184e]"> (You)</div>
                  )}
                </div>
              </div>
              {item.id === game?.host_player_id && (
                <div className="flex-row items-center bg-[#99184e] px-3 py-1 rounded-full">
                  <FaStar />
                  <div className="div-white div-sm font-bold ml-1">Host</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="items-center justify-center py-12">
            <div className="div-gray-500 div-lg font-medium mt-4">
              No players yet
            </div>
            <div className="div-gray-400 div-center mt-2">
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
            disabled={loading || !players || players.length < 2}
          >
            {loading ? (
              <div className="flex-row items-center">
                <div className="div-white div-lg font-bold ml-2">
                  Starting Game...
                </div>
              </div>
            ) : (
              <div className="flex-row items-center">
                <div className="div-white div-lg font-bold mx-2">
                  Start Game
                </div>
              </div>
            )}
          </button>

          {players && players.length < 2 && (
            <div className="div-amber-600 div-sm div-center mt-3 font-medium">
              Invite {3 - players.length} more player
              {players.length === 1 ? "" : "s"} to start
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="items-center">
            <div className="div-gray-700 div-lg font-semibold div-center mt-2">
              Waiting for host to start the game
            </div>
            <div className="div-gray-500 div-center mt-2">
              Invite more friends while you wait!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
