import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PlayersListModal from "@/components/play/PlayersList";
import type { GamePlayer, Round } from "@/lib/types";

const players = [
  {
    id: "p1",
    game_id: "g1",
    user_id: "u1",
    score: 10,
    user: { full_name: "Alice" },
  },
  {
    id: "p2",
    game_id: "g1",
    user_id: "u2",
    score: 5,
    profile: { full_name: "Bob" },
  },
  {
    id: "p3",
    game_id: "g1",
    user_id: "u3",
    score: 0,
  },
] as GamePlayer[];

const round = {
  id: "r1",
  game_id: "g1",
  judge_user_id: "u2",
  question_card_id: "q1",
  round_number: 1,
  status: "playing",
  winning_answer_id: null,
} as Round;

describe("PlayersListModal", () => {
  it("opens the dialog and shows the players with scores", async () => {
    const user = userEvent.setup();
    render(
      <PlayersListModal
        players={players}
        currentRound={round}
        currentUserId="u1"
      />
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Players (3)")).toBeInTheDocument();
    expect(screen.getByText("Current scores")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("10 pts")).toBeInTheDocument();
    expect(screen.getByText("5 pts")).toBeInTheDocument();
  });

  it("marks the current player and the judge", async () => {
    const user = userEvent.setup();
    render(
      <PlayersListModal
        players={players}
        currentRound={round}
        currentUserId="u1"
      />
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("(You)")).toBeInTheDocument();
    const you = screen.getByText("(You)").closest("div");
    expect(you).not.toBeNull();
  });

  it("highlights the judge row", async () => {
    const user = userEvent.setup();
    render(
      <PlayersListModal
        players={players}
        currentRound={round}
        currentUserId="u1"
      />
    );

    await user.click(screen.getByRole("button"));

    const bobRow = screen.getByText("Bob").closest("div")?.parentElement;
    expect(bobRow).not.toBeNull();
    expect(bobRow).toHaveClass("bg-gold/10");
  });
});