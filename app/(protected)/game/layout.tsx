import Header from '@/components/header';

export default function GamePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Header /> */}
      {children}
    </>
  );
}
