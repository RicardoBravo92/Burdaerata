'use client';

import { ItemGroup } from '@/components/ui/item';
import CreateGame from '@/components/game/CreateGame';
import JoinGame from '@/components/game/JoinGame';
import Header from '@/components/header';
export default function HomeTab() {
  return (
    <>
      <Header />
      <div className='items-center justify-center p-6 bg-[#99184e] min-h-screen'>
        <ItemGroup className='w-full max-w-md md:max-w-2xl lg:max-w-2xl mx-auto flex flex-col gap-6'>
          <CreateGame />
          <JoinGame />
        </ItemGroup>
      </div>
    </>
  );
}
