import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { sanitizeGameCode } from '@/lib/validation';

function joinGameModal({
  code,
  setCode,
  handleJoinGame,
  joinLoading,
}: {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  handleJoinGame: () => void;
  joinLoading: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='block mx-auto  my-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold    md:text-sm rounded-2xl transition-all duration-200 hover:scale-105'>
          Join with Code
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Enter Game Code</DialogTitle>
          <DialogDescription>
            Ask your friend for the 6-character game code
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center gap-2'>
          <div className='grid flex-1 gap-2'>
            <Input
              id='link'
              className='max-w-sm'
              onChange={(e) => {
                const sanitized = sanitizeGameCode(e.target.value);
                setCode(sanitized);
              }}
              value={code}
            />
          </div>
        </div>
        <DialogFooter className='sm:justify-start'>
          <Button
            type='button'
            variant='secondary'
            onClick={handleJoinGame}
            disabled={!code.trim() || code.length !== 6 || joinLoading}
            className={`
                  flex-1 py-3 text-white font-semibold rounded-2xl transition-all
                  ${
                    !code.trim() || code.length !== 6 || joinLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }
                `}
          >
            {joinLoading ? (
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Joining...
              </div>
            ) : (
              'Join Game'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default joinGameModal;
