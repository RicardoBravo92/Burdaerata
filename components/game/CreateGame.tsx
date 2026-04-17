"use client";

import { useCreateGame } from "@/hooks/useCreateGame";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export default function CreateGame() {
  const {
    showSettings,
    toggleSettings,
    ButtonComponent,
    SettingsComponent,
  } = useCreateGame();

  return (
    <Item variant="outline" className="rounded-3xl p-8 md:p-4 shadow-lg bg-white">
      <ItemContent>
        <ItemTitle>Create New Game</ItemTitle>
        <ItemDescription>
          Start a new game session and invite your friends to join the fun!
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <Button
          variant="outline"
          onClick={toggleSettings}
          aria-expanded={showSettings}
        >
          {showSettings ? "Hide Settings" : "Game Settings"}
        </Button>
        {ButtonComponent}
      </ItemActions>

      {SettingsComponent}
    </Item>
  );
}