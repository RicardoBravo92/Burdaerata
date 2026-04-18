"use client";

import { Game, GamePlayer } from "@/lib/types";
import { useLobby, useLobbyValidation } from "@/hooks/useLobby";
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button"
import { CopyIcon, ShareIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface LobbyViewProps {
  game: Game;
  players: GamePlayer[];
}

export default function LobbyView({ game, players }: LobbyViewProps) {
  const { isHost, copied, loading, handleCopyCode, handleShareGame, handleStartGame } =
    useLobby(game, players);
  const { canStart, missingPlayers } = useLobbyValidation(players);

  return (
    <div className="w-full mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500 max-w-6xl" style={{ zoom: 0.9 }}>
      
      {/* Header */}
      <div className="text-center mb-10 w-full flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-sm mb-3">Game Lobby</h1>
        <p className="text-white/90 text-lg md:text-xl font-medium">Waiting for players to join...</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        
        {/* Left Column: Players */}
        <div className="lg:col-span-4 block flex-col">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/10 p-6 h-full flex flex-col min-h-[400px]">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Players</h2>
                <p className="text-sm text-slate-500 font-medium">{players?.length || 0} joined</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {players && players.length > 0 ? (
                players.map((item: GamePlayer) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={item?.avatar_url || ""} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                          {(item.profile?.full_name || item.user?.full_name || "U")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-700 text-base max-w-[120px] truncate">
                        {item.profile?.full_name || item.user?.full_name || "Unknown"}
                      </span>
                    </div>
                    {item.user_id === game?.host_player_id && (
                      <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-200 shadow-sm ml-auto">
                        <FaStar size={12} className="text-yellow-600" />
                        <span className="text-yellow-700 text-xs font-bold uppercase tracking-wider">Host</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full opacity-60">
                  <UsersIcon className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-slate-500 text-lg font-medium">No players yet</h3>
                  <p className="text-slate-400 text-sm mt-1">Share the code to invite friends!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Share Code Card */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/10 p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-1 mt-2">Invite Friends</h2>
            <p className="text-slate-500 mb-6 font-medium">Share this room code with others</p>
            
            <div className="bg-slate-50 w-full py-6 rounded-3xl border border-slate-100 mb-6 shadow-inner">
              <span className="text-5xl md:text-6xl font-black text-indigo-600 tracking-[0.2em] font-mono drop-shadow-sm ml-4 select-all">
                {game?.code || "------"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <Button
                variant={copied ? "default" : "outline"}
                className={`flex-1 h-12 rounded-xl text-base font-bold transition-all ${
                  copied 
                    ? "bg-green-500 hover:bg-green-600 text-white border-green-500" 
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-sm"
                }`}
                onClick={handleCopyCode}
              >
                <CopyIcon className="w-5 h-5 mr-2" />
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 text-base font-bold transition-all shadow-sm"
                onClick={handleShareGame}
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                Share Link
              </Button>
            </div>
          </div>

          {/* Start Game Card */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/10 p-8 text-center flex flex-col items-center justify-center flex-1">
            {isHost ? (
              <>
                <Button
                  className="w-full max-w-sm h-16 rounded-2xl text-xl font-black shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none transition-all hover:-translate-y-1"
                  onClick={handleStartGame}
                  disabled={loading || !players || players.length < 3}
                >
                  {loading ? "STARTING..." : "START GAME 🔥"}
                </Button>
                
                {players && !canStart && (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="bg-amber-50 text-amber-700 px-4 py-2.5 rounded-xl border border-amber-200 text-sm font-bold flex items-center gap-2 shadow-sm">
                       <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                       Invite {missingPlayers} more player{missingPlayers === 1 ? "" : "s"} to start
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Waiting for Host</h3>
                <p className="text-slate-500 font-medium">Sit tight! The host will start the game soon.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}