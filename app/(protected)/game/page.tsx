'use client';
import { createGame, joinGame } from '@/services/gameService';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';
import { showToast } from '@/components/Toast';
import { getErrorMessage, logError } from '@/lib/errorHandler';
import { validateGameCode, sanitizeGameCode } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import JoinGameModal from '@/components/modals/joinGameModal';

export default function HomeTab() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [scoreToWin, setScoreToWin] = useState(10);
  const [showSettings, setShowSettings] = useState(false);

  async function handleCreateGame() {
    setLoading(true);
    try {
      if (!user) {
        showToast('Usuario no encontrado. Por favor, inicia sesión.', 'error');
        return;
      }
      const newGame = await createGame(user.id, maxPlayers, scoreToWin);
      if (newGame) {
        showToast('¡Juego creado exitosamente!', 'success');
        router.push(`/game/${newGame.id}`);
        setLoading(false);
      } else {
        showToast('No se pudo crear el juego. Intenta de nuevo.', 'error');
        setLoading(false);
      }
    } catch (error: any) {
      logError(error, 'handleCreateGame');
      showToast(getErrorMessage(error), 'error');
    }
  }

  async function handleJoinGame() {
    const sanitizedCode = sanitizeGameCode(code);
    const validation = validateGameCode(sanitizedCode);

    if (!validation.valid) {
      showToast(validation.error || 'Código de juego inválido', 'warning');
      setCode(sanitizedCode);
      return;
    }

    setJoinLoading(true);
    try {
      if (!user) {
        showToast('Usuario no encontrado. Por favor, inicia sesión.', 'error');
        return;
      }
      const joinedGame = await joinGame(user.id, sanitizedCode);
      if (joinedGame) {
        showToast('¡Te uniste al juego exitosamente!', 'success');
        router.push(`/game/${joinedGame.id}`);
      } else {
        showToast('No se pudo unir al juego. Verifica el código.', 'error');
      }
    } catch (error: any) {
      logError(error, 'handleJoinGame');
      showToast(getErrorMessage(error), 'error');
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading || joinLoading) {
    return (
      <div className='flex flex-col space-y-3 items-center justify-center p-6 '>
        <Skeleton className='h-[276px] w-[340px] md:w-[720px] rounded-xl' />
        <Skeleton className='h-[216px] w-[340px] md:w-[720px] rounded-xl' />
      </div>
    );
  }

  return (
    <div className='h-lvh   items-center justify-center p-6 '>
      <div className='w-full max-w-md md:max-w-2xl lg:max-w-2xl mx-auto'>
        <div className='bg-white rounded-3xl p-8 md:p-2 shadow-lg mb-8 md:mb-4'>
          <div className='text-center mb-6 md:mb-2'>
            <h2 className='text-3xl md:text-xl font-bold text-gray-800 mb-1'>
              Create New Game
            </h2>
            <p className='text-gray-600 text-lg md:text-base leading-6'>
              Start a new game session and invite your friends to join the fun!
            </p>
          </div>

          {/* Game Settings */}
          {showSettings && (
            <div className='mb-6 space-y-4 p-4 bg-gray-50 rounded-2xl'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Max Players: {maxPlayers}
                </label>
                <input
                  type='range'
                  min='3'
                  max='12'
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Score to Win: {scoreToWin}
                </label>
                <input
                  type='range'
                  min='5'
                  max='20'
                  value={scoreToWin}
                  onChange={(e) => setScoreToWin(parseInt(e.target.value))}
                  className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                />
              </div>
            </div>
          )}

          <div className='space-y-4 md:space-y-3 text-center my-2'>
            <Button
              size='lg'
              className={`
                block mx-auto  rounded-2xl text-white
                font-semibold text-lg md:text-sm transition-all duration-200
                ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                }
              `}
              onClick={handleCreateGame}
              disabled={loading}
            >
              {loading ? (
                <div className='flex items-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Creating Game...
                </div>
              ) : (
                'Create Game'
              )}
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowSettings(!showSettings)}
              className=' py-3 md:py-2 text-gray-600 hover:text-gray-800 font-medium'
            >
              {showSettings ? 'Hide Settings' : 'Game Settings'}
            </Button>
          </div>
        </div>

        <div className='bg-white rounded-3xl p-8 md:p-4 shadow-lg'>
          <div className='text-center mb-6 md:mb-2'>
            <h2 className='text-3xl md:text-xl font-bold text-gray-800 mb-2'>
              Join Game
            </h2>
            <p className='text-gray-600 text-lg md:text-base leading-6'>
              Enter a game code
            </p>
          </div>
          <JoinGameModal
            code={code}
            setCode={setCode}
            handleJoinGame={handleJoinGame}
            joinLoading={joinLoading}
          />
        </div>
      </div>
    </div>
  );
}
