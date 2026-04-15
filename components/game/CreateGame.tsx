"use client";

import { useCreateGame } from "@/hooks/useCreateGame";
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
    <Item variant="outline" className="rounded-3xl p-8 md:p-4 shadow-lg">
      <ItemContent>
        <ItemTitle>Create New Game</ItemTitle>
        <ItemDescription>
          Start a new game session and invite your friends to join the fun!
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <button
          variant="outline"
          onClick={toggleSettings}
          className="h-10 rounded-md px-6 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
          aria-expanded={showSettings}
        >
          {showSettings ? "Hide Settings" : "Game Settings"}
        </button>
        {ButtonComponent}
      </ItemActions>

      {SettingsComponent}
    </Item>
  );
}