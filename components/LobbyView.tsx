"use client";

import { Game, GamePlayer } from "@/lib/types";
import { useLobby, useLobbyValidation } from "@/hooks/useLobby";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Users, Crown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LobbyViewProps {
  game: Game;
  players: GamePlayer[];
}

export default function LobbyView({ game, players }: LobbyViewProps) {
  const {
    isHost,
    copied,
    loading,
    handleCopyCode,
    handleShareGame,
    handleStartGame,
  } = useLobby(game, players);
  const { canStart, missingPlayers } = useLobbyValidation(players);

  return (
    <div className="bg-felt text-felt-foreground min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fade-in duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Game Lobby
          </h1>
          <p className="text-felt-foreground/80 text-base md:text-lg font-medium">
            Share the code and get the party started
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Left column — Players */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-card/90 backdrop-blur rounded-[1.75rem] shadow-2xl shadow-black/40 p-6 flex-1 min-h-[400px]">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-felt/5 text-felt rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-felt">Players</h2>
                  <p className="text-sm text-felt/50 font-medium">
                    {players?.length || 0} joined
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto pr-2 custom-scrollbar max-h-[52vh]">
                {players && players.length > 0 ? (
                  players.map((item: GamePlayer) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-felt/5 border border-felt/10 transition-all hover:border-felt/25"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm shrink-0">
                          <AvatarImage src={item?.avatar_url || ""} />
                          <AvatarFallback className="bg-felt/10 text-felt font-bold">
                            {
                              (item.profile?.full_name ||
                                item.user?.full_name ||
                                "U")[0]
                            }
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-felt text-base max-w-[120px] truncate">
                          {item.profile?.full_name ||
                            item.user?.full_name ||
                            "Unknown"}
                        </span>
                      </div>
                      {item.user_id === game?.host_player_id && (
                        <div className="flex items-center gap-1.5 bg-gold/15 px-3 py-1.5 rounded-full border border-gold/40 ml-auto shrink-0">
                          <Crown className="w-3.5 h-3.5 text-gold"
                            fill="currentColor" />
                          <span className="text-gold-foreground text-xs font-bold uppercase tracking-wider">
                            Host
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-full opacity-60 flex-1">
                    <Users className="w-12 h-12 text-felt/30 mb-3" />
                    <h3 className="text-felt/50 text-lg font-medium">
                      No players yet
                    </h3>
                    <p className="text-felt/40 text-sm mt-1">
                      Share the code to invite friends!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column — Actions */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Invite code */}
            <div className="bg-card/90 backdrop-blur rounded-[1.75rem] shadow-2xl shadow-black/40 p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold via-primary to-gold" />

              <h2 className="text-xl font-bold text-felt mb-1 mt-1">
                Invite Friends
              </h2>
              <p className="text-felt/50 mb-6 font-medium">
                Share this room code with others
              </p>

              <div className="bg-felt/5 w-full py-6 rounded-3xl border border-felt/10 mb-6 shadow-inner relative overflow-hidden">
                <span className="text-5xl md:text-6xl font-black text-felt tracking-[0.2em] font-mono drop-shadow-sm select-all">
                  {game?.code || "------"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <Button
                  variant={copied ? "default" : "outline"}
                  className={`flex-1 h-12 rounded-xl text-base font-bold transition-all ${
                    copied
                      ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                      : "border-felt/20 text-felt hover:bg-felt/5"
                  }`}
                  onClick={handleCopyCode}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-felt/20 text-felt hover:bg-felt/5 text-base font-bold transition-all"
                  onClick={handleShareGame}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>

            {/* Start game */}
            <div className="bg-card/90 backdrop-blur rounded-[1.75rem] shadow-2xl shadow-black/40 p-8 text-center flex flex-col items-center justify-center flex-1">
              {isHost ? (
                <>
                  <Button
                    className="w-full max-w-sm h-16 rounded-2xl text-xl font-black shadow-lg shadow-primary/40 bg-primary hover:bg-primary/90 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:bg-muted disabled:shadow-none disabled:hover:translate-y-0"
                    onClick={handleStartGame}
                    disabled={loading || !players || players.length < 3}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        STARTING...
                      </>
                    ) : (
                      "START GAME"
                    )}
                  </Button>

                  {players && !canStart && (
                    <div className="mt-6 flex flex-col items-center">
                      <div className="bg-gold/10 text-gold-foreground px-4 py-2.5 rounded-xl border border-gold/30 text-sm font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
                        Invite {missingPlayers} more player
                        {missingPlayers === 1 ? "" : "s"} to start
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="w-16 h-16 border-4 border-white/10 border-t-gold rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-felt mb-2">
                    Waiting for Host
                  </h3>
                  <p className="text-felt/50 font-medium">
                    Sit tight! The host will start the game soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}