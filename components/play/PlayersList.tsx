"use client";

import { GamePlayer, Round } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Users, Crown } from "lucide-react";

interface PlayersListProps {
  players: GamePlayer[];
  currentRound: Round;
  currentUserId: string | undefined;
}

export default function PlayersListModal({
  players,
  currentRound,
  currentUserId,
}: PlayersListProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 bg-white/10 text-felt-foreground border-white/20 hover:bg-white/20 lg:hidden"
        >
          <Users className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Players ({players.length})</DialogTitle>
          <DialogDescription>Current scores</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3 pb-4">
          {players.map((item) => {
            const isJudge = item.user_id === currentRound?.judge_user_id;
            const isMe = item.user_id === currentUserId;
            return (
              <div
                key={item.id}
                className={`flex items-center px-4 py-3 rounded-2xl border ${
                  isJudge
                    ? "bg-gold/10 border-gold/40"
                    : isMe
                      ? "bg-felt/5 border-felt/20"
                      : "bg-muted border-transparent"
                } transition-all`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-felt truncate">
                    {item.user?.full_name || item.profile?.full_name || "Unknown"}
                  </span>
                  {isMe && <span className="font-bold text-xs text-gold-foreground">(You)</span>}
                  {isJudge && (
                    <Crown className="w-4 h-4 text-gold shrink-0 fill-current" />
                  )}
                  <div className="bg-white px-2 py-1 rounded-full ml-2 shadow-sm">
                    <span className="text-felt/70 font-bold text-xs">
                      {item.score || 0} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}