"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="px-4 py-4 md:py-10 bg-[#99184e] min-h-screen">
      <Card className="max-w-md md:max-w-2xl lg:max-w-2xl mx-auto bg-linear-to-br from-violet-50 to-fuchsia-50 border-none shadow-xl rounded-3xl px-6 md:py-4 ">
        {/* Hero Section */}
        <Item className="text-center">
          <ItemTitle className="text-2xl font-bold text-[#99184e]">
            ¡Welcome to Burdaerata!
          </ItemTitle>
          <ItemDescription className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Game of cards to create a Venezuelan mess.
          </ItemDescription>
        </Item>

        {/* Features Grid */}
        <ItemGroup className="grid md:grid-cols-3 gap-3  ">
          {[
            {
              icon: "🎴",
              title: "Creative Cards",
              desc: "More than 200 unique combinations to create the funniest phrases",
            },
            {
              icon: "👥",
              title: "Multiplayer",
              desc: " Play with friends in real time from any device",
            },
            {
              icon: "🏆",
              title: "Competitive",
              desc: "Scoring system and ranking for the most creative",
            },
          ].map((feature, i) => (
            <Item
              key={i}
              className="bg-white rounded-2xl shadow-lg text-center"
            >
              <ItemTitle className="text-2xl">{feature.icon}</ItemTitle>
              <ItemTitle className="text-xs font-bold  text-[#6c47ff]">
                {feature.title}
              </ItemTitle>
              <ItemDescription className="text-gray-600">
                {feature.desc}
              </ItemDescription>
            </Item>
          ))}
        </ItemGroup>

        {/* CTA Section */}
        <Item
          variant="outline"
          className="rounded-3xl p-6 md:p-2 text-center border-2 border-[#99184e]"
        >
          <ItemContent className="gap-1">
            <ItemTitle className="text-xl md:text-xl font-bold mx-auto">
              Ready to play?
            </ItemTitle>
            <ItemDescription className=" max-w-xl mx-auto">
              Sign up for free and start enjoying the Burdaerata experience
            </ItemDescription>

            <ItemGroup className="flex flex-col md:flex-row justify-center gap-2 md:gap-6">
              <SignUpButton>
                <Button size="sm" variant="default">
                  Create account
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button size="sm" variant="secondary">
                  Sign in
                </Button>
              </SignInButton>
            </ItemGroup>
          </ItemContent>
        </Item>
      </Card>
    </div>
  );
}
