import { User, Game } from '@/lib/types';
import { startGame } from '@/services/gameService';

import { useState } from 'react';

export default function LobbyView({
  user,
  game,
  players,
}: {
  user: User;
  game: Game;
  players: any;
}) {
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
      } catch (error) {
        console.error('Error sharing game:', error);
      }
    }
  }

  async function handleStartGame() {
    if (players && players.length < 2) {
      return;
    }

    setLoading(true);
    try {
      if (!game?.id) {
        return;
      }
      await startGame(user.id, game.id as string);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex-1 bg-[#99184e] p-6'>
      {/* Header */}
      <div className='items-center mb-8'>
        <div className='bg-white/20 p-4 rounded-2xl mb-4'></div>
        <div className='div-3xl font-bold div-white div-center'>Game Lobby</div>
        <div className='div-white/80 div-lg div-center mt-2'>
          Waiting for players to join...
        </div>
      </div>

      {/* Game Code Card */}
      <div className='bg-white rounded-3xl p-6 shadow-lg mb-6'>
        <div className='div-gray-600 div-base font-medium mb-3'>
          Share this code with friends:
        </div>
        <div className='flex-row justify-between items-center mb-4'>
          <div className='div-4xl font-bold div-[#99184e] tracking-widest'>
            {game?.code}
          </div>
          <div className='flex-row space-x-2'>
            <button
              className={`p-3 rounded-2xl ${
                copied ? 'bg-green-100' : 'bg-gray-100'
              }`}
              onClick={handleCopyCode}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              className='p-3 rounded-2xl bg-gray-100'
              onClick={handleShareGame}
            >
              Share
            </button>
          </div>
        </div>
        {copied && (
          <div className='div-green-600 div-sm font-medium div-center'>
            ✓ Copied to clipboard!
          </div>
        )}
      </div>

      {/* Players Card */}
      <div className='bg-white rounded-3xl p-6 shadow-lg mb-6 flex-1'>
        <div className='flex-row justify-between items-center mb-4'>
          <div className='div-xl font-bold div-gray-800'>
            Players ({players?.length || 0})
          </div>
          {players && players.length < 2 && (
            <div className='bg-amber-100 px-3 py-1 rounded-full'>
              <div className='div-amber-800 div-sm font-medium'>
                Need {2 - players.length} more
              </div>
            </div>
          )}
        </div>

        {players && players.length > 0 ? (
          players.map((item: any) => (
            <div
              className='flex-row justify-between items-center p-4 bg-gray-50 rounded-2xl mb-3'
              key={item.id}
            >
              <div className='flex-row items-center flex-1'>
                <div className='w-10 h-10 bg-[#99184e] rounded-full items-center justify-center mr-3'>
                  person logo
                </div>
                <div className='div-lg font-semibold div-gray-800'>
                  {item.profile?.full_name || 'Unknown Player'}
                  {item.id === user?.id && (
                    <div className='div-[#99184e]'> (You)</div>
                  )}
                </div>
              </div>
              {item.id === game?.host_player_id && (
                <div className='flex-row items-center bg-[#99184e] px-3 py-1 rounded-full'>
                  star logo
                  <div className='div-white div-sm font-bold ml-1'>Host</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='items-center justify-center py-12'>
            <div className='div-gray-500 div-lg font-medium mt-4'>
              No players yet
            </div>
            <div className='div-gray-400 div-center mt-2'>
              Share the game code to invite friends!
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isHost ? (
        <div className='bg-white rounded-3xl p-6 shadow-lg'>
          <button
            className={`
              py-4 rounded-2xl items-center
              ${
                players && players.length >= 2 && !loading
                  ? 'bg-[#99184e]'
                  : 'bg-gray-300'
              }
            `}
            onClick={handleStartGame}
            disabled={loading || !players || players.length < 2}
          >
            {loading ? (
              <div className='flex-row items-center'>
                <div className='div-white div-lg font-bold ml-2'>
                  Starting Game...
                </div>
              </div>
            ) : (
              <div className='flex-row items-center'>
                <div className='div-white div-lg font-bold ml-2'>
                  Start Game
                </div>
              </div>
            )}
          </button>

          {players && players.length < 2 && (
            <div className='div-amber-600 div-sm div-center mt-3 font-medium'>
              Invite {2 - players.length} more player
              {players.length === 1 ? '' : 's'} to start
            </div>
          )}
        </div>
      ) : (
        <div className='bg-white rounded-3xl p-6 shadow-lg'>
          <div className='items-center'>
            <div className='div-gray-700 div-lg font-semibold div-center mt-2'>
              Waiting for host to start the game
            </div>
            <div className='div-gray-500 div-center mt-2'>
              Invite more friends while you wait!
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className='flex-row justify-center space-x-6 mt-6'>
        <button
          className='flex-row items-center bg-white/20 px-4 py-3 rounded-2xl'
          onClick={handleCopyCode}
        >
          <div className='div-white font-semibold ml-2'>Copy Code</div>
        </button>
        <button
          className='flex-row items-center bg-white/20 px-4 py-3 rounded-2xl'
          onClick={handleShareGame}
        >
          <div className='div-white font-semibold ml-2'>Share</div>
        </button>
      </div>
    </div>
  );
}
