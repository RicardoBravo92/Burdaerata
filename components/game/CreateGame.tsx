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
    <Item
      variant="outline"
      className="bg-card card-face rounded-[1.75rem] p-6 md:p-7 border-none shadow-2xl shadow-black/40"
    >
      <ItemContent>
        <ItemTitle className="text-felt text-xl">Create New Game</ItemTitle>
        <ItemDescription className="text-felt/60">
          Start a new game session and invite your friends to join the fun!
        </ItemDescription>
      </ItemContent>

      <ItemActions className="flex-wrap">
        <Button
          variant="outline"
          onClick={toggleSettings}
          aria-expanded={showSettings}
          className="border-felt/20 text-felt hover:bg-felt/5"
        >
          {showSettings ? "Hide Settings" : "Game Settings"}
        </Button>
        {ButtonComponent}
      </ItemActions>

      {SettingsComponent}
    </Item>
  );
}