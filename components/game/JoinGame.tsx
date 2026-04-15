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
      className="bg-white rounded-3xl p-8 md:p-4 shadow-lg"
    >
      <ItemContent>
        <ItemTitle>Join Game</ItemTitle>
        <ItemDescription>
          Enter a game code to join an existing game
        </ItemDescription>
      </ItemContent>
      <ItemActions>{Component}</ItemActions>
    </Item>
  );
}