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
    <div className="min-h-screen bg-[#99184e] flex flex-col">
      {children}
    </div>
  );
}