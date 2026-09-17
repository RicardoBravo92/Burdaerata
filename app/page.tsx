"use client";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Header from "@/components/header";
import { Sparkles, Users, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Creative Cards",
    desc: "More than 200 unique combinations to create the funniest phrases",
  },
  {
    icon: Users,
    title: "Multiplayer",
    desc: "Play with friends in real time from any device",
  },
  {
    icon: Trophy,
    title: "Competitive",
    desc: "Scoring system and ranking for the most creative",
  },
];

export default function Home() {
  return (
    <div className="bg-felt min-h-screen text-felt-foreground">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Welcome to Burdaerata!
          </h1>
          <p className="text-felt-foreground/80 text-lg md:text-xl font-medium max-w-xl mx-auto">
            The card game that turns any friend group into a beautiful mess.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-card card-face p-5 text-center flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-gold/15 text-gold-foreground rounded-2xl">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-felt uppercase tracking-wide">
                {f.title}
              </h3>
              <p className="text-felt/60 text-sm leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-card card-face p-8 text-center rounded-[1.75rem]">
          <h2 className="text-2xl font-bold text-felt mb-2">Ready to play?</h2>
          <p className="text-felt/60 mb-6 max-w-md mx-auto">
            Sign up for free and start enjoying the Burdaerata experience
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <SignUpButton>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Create account
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button
                size="lg"
                variant="secondary"
                className="bg-felt/5 text-white hover:bg-felt/10"
              >
                Sign in
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
}