'use client';
import { createGame, joinGame } from '@/services/gameService';
import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';

export default function HomeTab() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  async function handleCreateGame() {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }
      const newGame = await createGame(user.id);

      router.push(`/game/${newGame.id}`);
    } catch (error: any) {
      console.error('Error creating game:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame() {
    setJoinLoading(true);

    try {
      if (!user) {
        throw new Error('User not found');
      }
      const joinedGame = await joinGame(user.id, code);
      router.push(`/game/${joinedGame.id}`);
    } catch (error: any) {
      console.error('Error joining game:', error);
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <div className='flex-1 bg-[#99184e] tems-center justify-center p-6'>
      {/* Header Section */}
      <div className='items-center mb-12'>
        <div className='bg-white/20 p-6 rounded-full mb-4'></div>
        <div className='text-5xl font-bold text-white text-center mb-2'>
          Burdaerata
        </div>
        <div className='text-xl text-white/80 text-center'>
          The Ultimate Word Game
        </div>
      </div>

      {/* Main Actions Container */}
      <div className='w-full max-w-md  mx-auto p-6'>
        {/* Create Game Card */}
        <div className='bg-white rounded-3xl p-6 shadow-lg mb-6'>
          <div className='flex-row items-center mb-4'>
            <div className='text-2xl font-bold text-gray-800'>
              Create New Game
            </div>
          </div>
          <div className='text-gray-600 text-lg mb-6 leading-6'>
            Start a new game session and invite your friends to join the fun!
          </div>
          <button
            className={`
              flex-row items-center justify-center py-4 rounded-2xl hover:bg-green-300
              ${loading ? 'bg-green-400' : 'bg-green-500'}
            `}
            onClick={handleCreateGame}
            disabled={loading}
          >
            {loading ? (
              <div className='flex-row items-center justify-center mx-2'>
                loadding...
              </div>
            ) : (
              <>
                <div className='flex-row items-center justify-center'>
                  <div className='text-white text-lg font-semibold mx-2'>
                    Create Game
                  </div>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className='flex-row items-center my-6'>
          <div className='flex-1 h-px bg-white/30' />
          <div className='text-white/70 mx-4 text-lg font-semibold'>OR</div>
          <div className='flex-1 h-px bg-white/30' />
        </div>

        {/* Join Game Card */}
        <div className='bg-white rounded-3xl p-6 shadow-lg'>
          <div className='flex-row items-center mb-4'>
            <div className='bg-blue-500 p-3 rounded-full mr-4'></div>
            <div className='text-2xl font-bold text-gray-800'>Join Game</div>
          </div>
          <div className='text-gray-600 text-lg mb-4 leading-6'>
            Enter a game code to join your friends game session
          </div>

          <input
            className='
              border-2 border-gray-200 p-4 rounded-2xl
              text-lg mb-6 bg-gray-50
              text-center font-semibold
              tracking-widest
            '
            placeholder='ENTER CODE'
            value={code}
            autoCapitalize='characters'
            maxLength={6}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />

          <button
            className={`
              flex-row items-center justify-center py-4 rounded-2xl
              ${!code.trim() || joinLoading ? 'bg-blue-400' : 'bg-blue-500'}
            `}
            onClick={handleJoinGame}
            disabled={!code.trim() || joinLoading}
          >
            {joinLoading ? (
              <div className='flex-row items-center justify-center mx-2'>
                loadding...
              </div>
            ) : (
              <>
                <div className='text-white text-lg font-semibold mx-2'>
                  Join Game
                </div>
              </>
            )}
          </button>
        </div>

        {/* Quick Tips */}
        <div className='mt-8 p-4 bg-white/10 rounded-2xl'>
          <div className='text-white/90 text-center text-sm mb-2'>
            💡 Pro tip: Share the game code with friends to play together!
          </div>
          <div className='text-white/70 text-center text-xs'>
            Game codes are 6 characters long
          </div>
        </div>
      </div>
    </div>
  );
}
