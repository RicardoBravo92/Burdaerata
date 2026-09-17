'use client';

import { ItemGroup } from '@/components/ui/item';
import CreateGame from '@/components/game/CreateGame';
import JoinGame from '@/components/game/JoinGame';
import Header from '@/components/header';
export default function HomeTab() {
  return (
    <>
      <Header />
      <div className='bg-felt min-h-screen'>
        <div className='max-w-2xl mx-auto px-4 py-10 md:py-14'>
          <div className='text-center mb-8 animate-fade-in'>
            <h1 className='text-3xl md:text-4xl font-black text-white mb-2'>
              Game Night
            </h1>
            <p className='text-felt-foreground/80 text-base md:text-lg font-medium'>
              Start a new game or join your friends at the table
            </p>
          </div>
          <ItemGroup className='flex flex-col gap-5'>
            <CreateGame />
            <JoinGame />
          </ItemGroup>
        </div>
      </div>
    </>
  );
}
