import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Burdaerata - Game',
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {children}
    </div>
  );
}