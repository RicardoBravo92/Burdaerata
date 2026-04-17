"use client";

import { Game, GamePlayer } from "@/lib/types";
import { useLobby, useLobbyValidation } from "@/hooks/useLobby";
import { FaStar } from "react-icons/fa";
import Image from "next/image";
import { Button } from "./ui/button";
import { CopyIcon, ShareIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  ItemGroup,
} from "@/components/ui/item";
import { Card, CardTitle, CardHeader } from "./ui/card";

interface LobbyViewProps {
  game: Game;
  players: GamePlayer[];
}

export default function LobbyView({ game, players }: LobbyViewProps) {
  const { isHost, copied, loading, handleCopyCode, handleShareGame, handleStartGame } =
    useLobby(game, players);
  const { canStart, missingPlayers } = useLobbyValidation(players);

  return (
    <div className=" md:max-w-xl mx-auto px-6 pt-8 flex flex-col gap-4 ">
      <Item variant={"outline"} className="rounded-3xl  shadow-lg">
        <ItemContent>
          <ItemTitle>Game Lobby</ItemTitle>
          <ItemDescription className="text-center  italic">
            Waiting for players to join...
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" className="rounded-3xl  shadow-lg">
        <ItemContent>
          <ItemTitle>Share this code with friends</ItemTitle>
          <ItemDescription>{game?.code}</ItemDescription>
        </ItemContent>
        <ItemActions className="flex flex-col md:flex-row gap-2 ">
          <Button
            variant="outline"
            className={`p-3 rounded-2xl ${
              copied
                ? "bg-green-100"
                : "border-sky-600 text-sky-600 hover:bg-sky-600/10 focus-visible:border-sky-600 focus-visible:ring-sky-600/20 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/40"
            }`}
            onClick={handleCopyCode}
          >
            <CopyIcon />
            {copied ? "Copied!" : "Copy Code"}
          </Button>
          <Button
            variant="outline"
            className={`p-3 rounded-2xl border-sky-600 text-sky-600 hover:bg-sky-600/10 focus-visible:border-sky-600 focus-visible:ring-sky-600/20 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/40'`}
            onClick={handleShareGame}
          >
            <ShareIcon />
            Share
          </Button>
        </ItemActions>
      </Item>
      <Card className="rounded-3xl shadow-lg gap-1">
        <CardHeader className="text-xl font-bold text-gray-800 ">
          <CardTitle>Players ({players?.length || 0})</CardTitle>
        </CardHeader>

        <ItemGroup className="px-4 flex flex-col gap-2 ">
          {players && players.length > 0 ? (
            players.map((item: GamePlayer) => (
              <Item className=" bg-secondary rounded-2xl flex flex-row items-center justify-between p-3" key={item.id}>
                <ItemContent className="flex flex-row items-center gap-3">
                  <Item className="rounded-full flex items-center justify-center">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src={item?.avatar_url || ""} />
                      <AvatarFallback>
                        {item.profile?.full_name ||
                          item.user?.full_name ||
                          "Unknown Player"}
                      </AvatarFallback>
                    </Avatar>
                  </Item>
                  <span className=" font-semibold text-gray-800 text-base ">
                    {item.profile?.full_name ||
                      item.user?.full_name ||
                      "Unknown Player"}
                  </span>
                </ItemContent>
                {item.user_id === game?.host_player_id && (
                  <Item className="flex-row items-center bg-[#99184e] px-3 py-3 rounded-full">
                    <FaStar size={10} className="text-black" />
                    <div className="text-white text-xs font-bold ml-1">
                      Host
                    </div>
                  </Item>
                )}
              </Item>
            ))
          ) : (
            <Item className="items-center justify-center py-12">
              <ItemTitle className="text-gray-500 text-lg font-medium mt-4">
                No players yet
              </ItemTitle>
              <ItemDescription className="text-gray-400 text-center mt-2">
                Share the game code to invite friends!
              </ItemDescription>
            </Item>
          )}
        </ItemGroup>
      </Card>
      {isHost ? (
        <Item
          variant="outline"
          className="bg-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-around"
        >
          <ItemContent className="items-center ">
            <ItemActions>
              <Button
                variant="secondary"
                className="py-4 rounded-2xl items-center"
                onClick={handleStartGame}
                disabled={loading || !players || players.length < 3}
              >
                {loading ? (
                  <Item className="flex-row items-center">
                    <ItemTitle className="text-lg font-bold ml-2">
                      Starting Game...
                    </ItemTitle>
                  </Item>
                ) : (
                  "Start Game"
                )}
              </Button>
            </ItemActions>

            {players && !canStart && (
              <ItemDescription className="text-primary text-sm text-center mt-3 font-medium">
                Invite {missingPlayers} more player
                {missingPlayers === 1 ? "" : "s"} to start
              </ItemDescription>
            )}
          </ItemContent>
        </Item>
      ) : (
        <Item variant="outline" className="rounded-3xl shadow-lg">
          <ItemContent className="items-center">
            <ItemTitle>Waiting for host to start the game</ItemTitle>
            <ItemDescription>
              Invite more friends while you wait!
            </ItemDescription>
          </ItemContent>
        </Item>
      )}
    </div>
  );
}