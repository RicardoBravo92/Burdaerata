# Burdaerata

Web application for **Burdaerata** — a Cards Against Humanity style party game with Venezuelan flavor, played in real time with friends.

- 👉 **Backend Repository:** [github.com/RicardoBravo92/BurdaerataBackend](https://github.com/RicardoBravo92/BurdaerataBackend)
- 👉 **Mobile App:** [github.com/RicardoBravo92/Burdaerataexpo](https://github.com/RicardoBravo92/Burdaerataexpo)

## Tech Stack

- **Next.js 16 (App Router, Turbopack)** — React framework
- **Tailwind CSS v4** — styling (felt-table game theme)
- **Clerk** — authentication
- **WebSockets** — real-time game state and chat
- **Sonner** — toast notifications
- **lucide-react / react-icons** — icons

## Features

- Create a game (with configurable max players and score-to-win) or join one with a 6-digit code
- Real-time lobby with player list, invite code, copy/share actions, and host start control
- Round-based gameplay: question card → pick answer cards → judge selects the funniest
- Score leaderboard, winner podium, and round transitions
- Persistent in-game chat
- Auto-reconnect to the WebSocket with full state resync on reconnect

## Getting Started

### Prerequisites

- Node.js 20+
- The backend running locally (see the [backend README](../Backend/README.md))
- A [Clerk](https://clerk.com) application

### Setup

```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY,
# and NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `http://localhost:8000`, or `https://burdaeratabackend.onrender.com` in production) |

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # start the production build
npm run lint     # ESLint (flat config)
```

## Project Structure

```
app/
├── page.tsx                  # Public landing page
├── (protected)/game/         # Game menu + live game screens
├── layout.tsx                # Clerk + GameProvider + Toaster
components/
├── game/                     # Create / Join / Settings
├── play/                     # RoundHeader, CardSelector, AnswersList, chat, players
├── ui/                       # shadcn-style primitives
├── LobbyView.tsx             # Pre-game lobby
├── PlayView.tsx              # In-game board
├── RoundTransition.tsx       # Round transition overlay
hooks/                        # useGameScreen, usePlay, useLobby, ...
lib/                          # API client, WebSocket client, types, actions
providers/                    # GameProvider (global game state)
services/                     # API + card services
```

## Deployment

Deployed on **Vercel**. The Clerk properties are configured in the Vercel environment variables, and `proxy.ts` protects all routes except landing and auth pages.

## License

MIT