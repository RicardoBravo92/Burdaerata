"use client";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <div className="w-full h-full md:h-dvh  py-2 ">
      <div className="  max-w-sm md:max-w-2xl lg:max-w-2xl mx-auto bg-linear-to-b from-[#f8f9fa] to-[#e9ecef] rounded-3xl px-6 py-4 ">
        {/* Hero Section */}
        <div className="text-center mb-5 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-[#99184e] mb-4">
            ¡Bienvenido a Burdaerata!
          </h1>
          <p className=" text-md md:text-md text-gray-600 max-w-2xl mx-auto">
            Rolitranco de juego para armar un desnalgue venezolano.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
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
            <div
              key={i}
              className="bg-white p-3 rounded-2xl shadow-lg text-center"
            >
              <div className="text-2xl mb-4">{feature.icon}</div>
              <h3 className="text-xs font-bold mb-2 text-[#6c47ff]">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        {!isSignedIn && (
          <div className="bg-[#99184e] text-white rounded-3xl p-4 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para jugar?</h2>
            <p className="text-lg mb-6 max-w-xl mx-auto">
              Regístrate gratis y comienza a disfrutar de la experiencia
              Burdaerata
            </p>

            <div className="flex justify-center gap-4">
              <SignUpButton>
                <button className="bg-white text-[#99184e] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                  Crear cuenta
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition">
                  Iniciar sesión
                </button>
              </SignInButton>
            </div>
          </div>
        )}
        {isSignedIn && redirect("/game")}
      </div>
    </div>
  );
}
