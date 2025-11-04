"use client";

import { GamePlayer, Round } from "@/lib/types";
import { UserResource } from "@clerk/types";

interface PlayersListProps {
  players: GamePlayer[];
  currentRound: Round;
  currentUserId: string | undefined;
  currentUser: UserResource | null | undefined;
}

const StarIcon = () => <span className="text-2xl">⭐</span>;

export default function PlayersList({
  players,
  currentRound,
  currentUserId,
  currentUser,
}: PlayersListProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Players ({players.length})
      </h2>
      <div className="flex overflow-x-auto space-x-3 pb-4">
        {players.map((item) => (
          <div
            key={item.id}
            className={`
              flex items-center px-4 py-3 rounded-2xl
              ${
                item.user_id === currentRound?.judge_user_id
                  ? "bg-yellow-100 border border-yellow-400"
                  : item.user_id === currentUserId
                  ? "bg-blue-100 border border-blue-400"
                  : "bg-gray-100 border border-gray-300"
              }
              flex-shrink-0 transition-all hover:shadow-md
            `}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">
                {item.user?.full_name || item.profile?.full_name || "Unknown"}
              </span>
              {item.user_id === currentUserId && (
                <span className="text-blue-600 font-bold">(You)</span>
              )}
              {item.user_id === currentRound?.judge_user_id && (
                <StarIcon />
              )}
              <div className="bg-white px-2 py-1 rounded-full ml-2">
                <span className="text-gray-700 font-bold text-xs">
                  {item.score || 0} Pts
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

