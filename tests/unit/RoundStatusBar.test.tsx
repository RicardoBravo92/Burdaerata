import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RoundStatusBar from "@/components/play/RoundStatusBar";
import type { Round } from "@/lib/types";

const finishedRound = {
  id: "r1",
  game_id: "g1",
  judge_user_id: "p1",
  question_card_id: "q1",
  round_number: 2,
  status: "finished",
  winning_answer_id: null,
} as Round;

const playingRound = {
  ...finishedRound,
  status: "playing",
  winning_answer_id: "ans1",
} as Round;

describe("RoundStatusBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the round number and status label", () => {
    render(<RoundStatusBar currentRound={playingRound} />);
    expect(screen.getByText(/Round 2/)).toBeInTheDocument();
    expect(screen.getByText(/playing/)).toBeInTheDocument();
  });

  it("shows the winner badge when a winner was selected and the round is not finished", () => {
    render(<RoundStatusBar currentRound={playingRound} />);
    expect(screen.getByText("Winner Selected!")).toBeInTheDocument();
  });

  it("does not show the badge on a finished round", () => {
    render(<RoundStatusBar currentRound={finishedRound} />);
    expect(screen.queryByText("Winner Selected!")).not.toBeInTheDocument();
  });

  it("counts down and triggers the next round for the host", () => {
    const onNextRound = vi.fn();
    render(
      <RoundStatusBar
        currentRound={finishedRound}
        isHost
        onNextRound={onNextRound}
      />
    );

    expect(screen.getByText(/Next round in 3s/)).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText(/Next round in 2s/)).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText(/Next round in 0s/)).toBeInTheDocument();
    expect(onNextRound).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(10000));
    expect(onNextRound).toHaveBeenCalledTimes(1);
  });

  it("does not trigger the next round for non-host players", () => {
    const onNextRound = vi.fn();
    render(<RoundStatusBar currentRound={finishedRound} onNextRound={onNextRound} />);

    act(() => vi.advanceTimersByTime(5000));

    expect(onNextRound).not.toHaveBeenCalled();
    expect(screen.getByText(/Next round in 0s/)).toBeInTheDocument();
  });

  it("does not start the countdown for an active round", () => {
    render(<RoundStatusBar currentRound={playingRound} />);
    expect(screen.queryByText(/Next round in/)).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText(/Next round in/)).not.toBeInTheDocument();
  });
});