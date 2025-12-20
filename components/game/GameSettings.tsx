import { memo } from 'react';
import { Label } from '@/components/ui/label';
import { ItemFooter } from '@/components/ui/item';
import { GAME_CONSTANTS } from '@/constants/gamesettings';

export interface GameSettings {
  maxPlayers: number;
  scoreToWin: number;
}

interface GameSettingsProps {
  settings: GameSettings;
  updateSetting: (key: keyof GameSettings, value: number) => void;
}

export const GameSettingsSection = memo(({ settings, updateSetting }: GameSettingsProps) => (
  <ItemFooter className='mb-6 p-4 bg-gray-50 rounded-2xl'>
    <div>
      <Label className='block text-sm font-medium text-gray-700 mb-2'>
        Max Players: {settings.maxPlayers}
      </Label>
      <input
        type='range'
        min={GAME_CONSTANTS.MIN_PLAYERS}
        max={GAME_CONSTANTS.MAX_PLAYERS}
        value={settings.maxPlayers}
        onChange={(e) => updateSetting('maxPlayers', parseInt(e.target.value))}
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
        aria-label='Maximum players'
        aria-valuemin={GAME_CONSTANTS.MIN_PLAYERS}
        aria-valuemax={GAME_CONSTANTS.MAX_PLAYERS}
        aria-valuenow={settings.maxPlayers}
      />
      <div className='flex justify-between text-xs text-gray-500 mt-1'>
        <span>{GAME_CONSTANTS.MIN_PLAYERS}</span>
        <span>{GAME_CONSTANTS.MAX_PLAYERS}</span>
      </div>
    </div>
    <div className='mt-4'>
      <Label className='block text-sm font-medium text-gray-700 mb-2'>
        Score to Win: {settings.scoreToWin}
      </Label>
      <input
        type='range'
        min={GAME_CONSTANTS.MIN_SCORE}
        max={GAME_CONSTANTS.MAX_SCORE}
        value={settings.scoreToWin}
        onChange={(e) => updateSetting('scoreToWin', parseInt(e.target.value))}
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
        aria-label='Score to win'
        aria-valuemin={GAME_CONSTANTS.MIN_SCORE}
        aria-valuemax={GAME_CONSTANTS.MAX_SCORE}
        aria-valuenow={settings.scoreToWin}
      />
      <div className='flex justify-between text-xs text-gray-500 mt-1'>
        <span>{GAME_CONSTANTS.MIN_SCORE}</span>
        <span>{GAME_CONSTANTS.MAX_SCORE}</span>
      </div>
    </div>
  </ItemFooter>
));

GameSettingsSection.displayName = 'GameSettingsSection';
