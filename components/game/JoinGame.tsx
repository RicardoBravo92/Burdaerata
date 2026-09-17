"use client";

import { useJoinGame } from "@/hooks/useJoinGame";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export default function JoinGame() {
  const { Component } = useJoinGame();

  return (
    <Item
      variant="outline"
      className="bg-card card-face rounded-[1.75rem] p-6 md:p-7 border-none shadow-2xl shadow-black/40"
    >
      <ItemContent>
        <ItemTitle className="text-felt text-xl">Join Game</ItemTitle>
        <ItemDescription className="text-felt/60">
          Enter a game code to join an existing game
        </ItemDescription>
      </ItemContent>
      <ItemActions className="flex-wrap">{Component}</ItemActions>
    </Item>
  );
}