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
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <div className="px-4">
      <Card className="max-w-md md:max-w-2xl lg:max-w-2xl mx-auto bg-linear-to-b from-[#f8f9fa] to-[#e9ecef] rounded-3xl px-6 py-4 ">
        {/* Hero Section */}
        <Item className="text-center">
          <ItemTitle className="text-2xl font-bold text-[#99184e]">
            ¡Bienvenido a Burdaerata!
          </ItemTitle>
          <ItemDescription className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Rolitranco de juego para armar un desnalgue venezolano.
          </ItemDescription>
        </Item>

        {/* Features Grid */}
        <ItemGroup className="grid md:grid-cols-3 gap-3  ">
          {[
            {
              icon: "🎴",
              title: "Cartas Creativas",
              desc: "Más de 200 combinaciones únicas para crear las frases más divertidas",
            },
            {
              icon: "👥",
              title: "Multijugador",
              desc: "Juega con amigos en tiempo real desde cualquier dispositivo",
            },
            {
              icon: "🏆",
              title: "Competitivo",
              desc: "Sistema de puntuación y ranking para los más creativos",
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
        {!isSignedIn && (
          <Item
            variant="outline"
            className="rounded-3xl p-6 md:p-2 text-center border-2 border-[#99184e]"
          >
            <ItemContent className="gap-1">
              <ItemTitle className="text-xl md:text-xl font-bold mx-auto">
                ¿Listo para jugar?
              </ItemTitle>
              <ItemDescription className=" max-w-xl mx-auto">
                Regístrate gratis y comienza a disfrutar de la experiencia
                Burdaerata
              </ItemDescription>

              <ItemGroup className="flex flex-col md:flex-row justify-center gap-2 md:gap-6">
                <SignUpButton>
                  <Button size="sm" variant="default">
                    Crear cuenta
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button size="sm" variant="secondary">
                    Iniciar sesión
                  </Button>
                </SignInButton>
              </ItemGroup>
            </ItemContent>
          </Item>
        )}
        {isSignedIn && redirect("/game")}
      </Card>
    </div>
  );
}
