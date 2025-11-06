import { Game, GamePlayer } from '@/lib/types';
import { startGame } from '@/services/gameService';
import { FaUser, FaStar } from 'react-icons/fa';
import Image from 'next/image';
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getErrorMessage, logError } from '@/lib/errorHandler';
import { Button } from './ui/button';
import { CopyIcon, ShareIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';

export default function LobbyView({
  game,
  players,
}: {
  game: Game;
  players: GamePlayer[];
}) {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const isHost = game?.host_player_id === user?.id;

  async function handleCopyCode() {
    if (game?.code) {
      await navigator.clipboard.writeText(game.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShareGame() {
    if (game?.code) {
      try {
        await navigator.share({
          title: 'Join my game!',
          text: `Join my game using this code: ${game.code}`,
        });
        toast.success('Game code shared successfully!', { richColors: true });
      } catch (error) {
        // User cancelled sharing or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          logError(error, 'handleShareGame');
          toast.error(getErrorMessage(error), { richColors: true });
        }
      }
    }
  }

  async function handleStartGame() {
    if (players && players.length < 2) {
      toast.warning('Necesitas al menos 2 jugadores para iniciar el juego', {
        richColors: true,
      });
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        toast.error('Usuario no encontrado', { richColors: true });
        return;
      }
      if (!game?.id) {
        toast.error('Juego no encontrado', { richColors: true });
        return;
      }
      await startGame(user.id, game.id as string);
      toast.success('¡Juego iniciado!', { richColors: true });
    } catch (error: any) {
      logError(error, 'handleStartGame');
      toast.error(getErrorMessage(error), { richColors: true });
    } finally {
      setLoading(false);
    }
  }
  console.log('player', players);

  return (
    <div className='flex-1  md:max-w-xl mx-auto px-6 h-screen flex flex-col gap-2'>
      {/* Header */}
      <div className='items-center mb-8 md:mb-4'>
        <div className='text-3xl font-bold text-white text-center mb-4 py-2 bg-[#99184e]/90 rounded-lg'>
          Game Lobby
        </div>
        <div className='text-white/80 text-lg text-center mt-2 italic'>
          Waiting for players to join...
        </div>
      </div>

      <Item
        variant='outline'
        className='bg-white rounded-3xl p-8 md:p-4 shadow-lg'
      >
        <ItemContent>
          <ItemTitle>Share this code with friends</ItemTitle>
          <ItemDescription>{game?.code}</ItemDescription>
        </ItemContent>
        <ItemActions className='flex flex-col md:flex-row gap-2 '>
          <Button
            variant='outline'
            className={`p-3 rounded-2xl ${
              copied
                ? 'bg-green-100'
                : 'border-sky-600 text-sky-600 hover:bg-sky-600/10 focus-visible:border-sky-600 focus-visible:ring-sky-600/20 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/40'
            }`}
            onClick={handleCopyCode}
          >
            <CopyIcon />
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
          <Button
            variant='outline'
            className={`p-3 rounded-2xl border-sky-600 text-sky-600 hover:bg-sky-600/10 focus-visible:border-sky-600 focus-visible:ring-sky-600/20 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/40'
              }`}
            onClick={handleShareGame}
          >
            <ShareIcon />
            Share
          </Button>
        </ItemActions>
      </Item>

      <div className='bg-white rounded-3xl p-6 shadow-lg mb-6 md:mb-2 flex-1'>
        <div className='flex-row justify-between items-center mb-2'>
          <div className='text-xl font-bold text-gray-800'>
            Players ({players?.length || 0})
          </div>
          {players && players.length < 2 && (
            <div className='bg-amber-100 px-3 py-1 rounded-full'>
              <div className='text-amber-800 text-sm font-medium'>
                Need {3 - players.length} more
              </div>
            </div>
          )}
        </div>

        {players && players.length > 0 ? (
          players.map((item: GamePlayer) => (
            <div
              className='flex-row justify-between items-center px-4 py-2 bg-gray-50 rounded-2xl mb-3'
              key={item.id}
            >
              <div className=' items-center flex flex-row'>
                <div className='w-5 h-5 bg-[#99184e] rounded-full flex items-center justify-center mr-1'>
                  {item.profile?.avatar_url &&
                  item.profile?.avatar_url !== '' ? (
                    <Image
                      src={item.profile?.avatar_url}
                      alt='Profile'
                      className='w-5 h-5 rounded-full'
                      width={20}
                      height={20}
                    />
                  ) : (
                    <FaUser className='text-base text-white' />
                  )}
                </div>
                <div className=' font-semibold text-gray-800 text-base'>
                  {item.profile?.full_name ||
                    item.user?.full_name ||
                    'Unknown Player'}
                  {item.id === user?.id && (
                    <span className='text-[#99184e]'> (You)</span>
                  )}
                </div>
              </div>
              {item.id === game?.host_player_id && (
                <div className='flex-row items-center bg-[#99184e] px-3 py-1 rounded-full'>
                  <FaStar />
                  <div className='text-white text-sm font-bold ml-1'>Host</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='items-center justify-center py-12'>
            <div className='text-gray-500 text-lg font-medium mt-4'>
              No players yet
            </div>
            <div className='text-gray-400 text-center mt-2'>
              Share the game code to invite friends!
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isHost ? (
        <Item
          variant='outline'
          className='bg-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-around'
        >
          <ItemContent className='items-center '>
            <ItemActions>
              <Button
                className={`
              py-4 rounded-2xl items-center
              ${
                players && players.length >= 2 && !loading
                  ? 'bg-[#99184e]'
                  : 'bg-gray-300 hover:bg-gray-200'
              }
            `}
                onClick={handleStartGame}
                disabled={loading || !players || players.length < 3}
              >
                {loading ? (
                  <div className='flex-row items-center'>
                    <div className='text-white text-lg font-bold ml-2'>
                      Starting Game...
                    </div>
                  </div>
                ) : (
                  <div className='flex-row items-center'>
                    <div className='text-white text-lg font-bold mx-2'>
                      {players.length < 3
                        ? 'Need at least 3 players'
                        : 'Start Game'}
                    </div>
                  </div>
                )}
              </Button>
            </ItemActions>

            {players && players.length < 2 && (
              <ItemDescription className='text-amber-600 text-sm text-center mt-3 font-medium'>
                Invite {3 - players.length} more player
                {players.length === 1 ? '' : 's'} to start
              </ItemDescription>
            )}
          </ItemContent>
        </Item>
      ) : (
        <Item variant='outline' className='bg-white rounded-3xl p-6 shadow-lg'>
          <ItemContent className='items-center'>
            <ItemTitle className='text-gray-700 text-lg font-semibold text-center mt-2'>
              Waiting for host to start the game
            </ItemTitle>
            <ItemDescription className='text-gray-500 text-center mt-2'>
              Invite more friends while you wait!
            </ItemDescription>
          </ItemContent>
        </Item>
      )}
    </div>
  );
}
