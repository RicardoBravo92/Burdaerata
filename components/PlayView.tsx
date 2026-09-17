"use client";

import { usePlay, UsePlayProps } from "@/hooks/usePlay";
import { useGame } from "@/providers/GameProvider";
import RoundHeader from "./play/RoundHeader";
import CardSelector from "./play/CardSelector";
import RoundStatusMessages from "./play/RoundStatusMessages";
import AnswersList from "./play/AnswersList";
import PlayersListModal from "./play/PlayersList";
import RoundStatusBar from "./play/RoundStatusBar";
import { Crown } from "lucide-react";
import ChatGame from "./play/ChatGame";
import ChatModal from "./play/ChatModal";

export default function PlayView(props: UsePlayProps) {
  const { myCards, chatMessages, setChatMessages } = useGame();
  const {
    loading,
    submittingAnswer,
    selectedCards,
    questionText,
    blankCount,
    isJudge,
    hasSubmitted,
    canSubmit,
    userId,
    onCardSelect,
    handleSubmitAnswer,
    handleSelectWinner,
    handleStartNextRound,
    isHost,
  } = usePlay(props);

  const { currentRound, players, answers } = props;

  return (
    <div className="bg-felt text-felt-foreground min-h-screen">
      <div className="flex gap-3 px-4 pt-3 lg:hidden">
        <PlayersListModal
          players={players}
          currentRound={currentRound}
          currentUserId={userId || ""}
        />
        <ChatModal
          messages={chatMessages}
          setMessages={setChatMessages}
          currentUserId={userId || ""}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <RoundHeader
          currentRound={currentRound}
          isJudge={isJudge}
          questionText={questionText}
          players={players}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left — Players */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-2">
            <p className="px-1 text-sm font-bold uppercase tracking-widest text-felt-foreground/60">
              Table
            </p>
            {players.map((item) => {
              const isCurrentJudge =
                item.user_id === currentRound?.judge_user_id;
              const isMe = item.user_id === userId;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    isCurrentJudge
                      ? "bg-gold/15 border-gold/50"
                      : isMe
                        ? "bg-white/10 border-white/20"
                        : "bg-white/5 border-white/10"
                  }`}
                >
                  <span
                    className={`font-semibold truncate min-w-0 ${
                      isMe ? "text-white" : "text-felt-foreground/90"
                    }`}
                  >
                    {item.user?.full_name ||
                      item.profile?.full_name ||
                      "Unknown"}
                  </span>
                  {isMe && (
                    <span className="text-gold-foreground text-xs font-bold">
                      (You)
                    </span>
                  )}
                  {isCurrentJudge && (
                    <Crown className="w-4 h-4 text-gold shrink-0 fill-current" />
                  )}
                  <span className="bg-white/10 text-felt-foreground px-2 py-0.5 rounded-full ml-auto whitespace-nowrap text-xs font-bold">
                    {item.score || 0} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center — The Table */}
          <div className="lg:col-span-6 flex flex-col gap-4 min-w-0">
            <div className="bg-card/90 backdrop-blur rounded-[1.75rem] shadow-2xl shadow-black/40 p-4 md:p-6">
              {canSubmit && (
                <CardSelector
                  myCards={myCards}
                  selectedCards={selectedCards}
                  onCardSelect={onCardSelect}
                  requiredCards={blankCount}
                  onSubmit={handleSubmitAnswer}
                  submitting={submittingAnswer}
                />
              )}

              <RoundStatusMessages
                hasSubmitted={hasSubmitted}
                isJudge={isJudge}
                answersCount={answers.length}
                playersCount={players.length}
                currentRound={currentRound}
              />

              {(hasSubmitted || isJudge) && (
                <AnswersList
                  answers={answers}
                  isJudge={isJudge}
                  currentRound={currentRound}
                  loading={loading}
                  onSelectWinner={handleSelectWinner}
                  playersCount={players.length}
                  currentUserId={userId || ""}
                  players={players}
                />
              )}

              <RoundStatusBar
                currentRound={currentRound}
                isHost={isHost}
                onNextRound={handleStartNextRound}
              />
            </div>
          </div>

          {/* Right — Chat */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-2 h-[540px]">
            <ChatGame
              messages={chatMessages}
              setMessages={setChatMessages}
              currentUserId={userId || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}