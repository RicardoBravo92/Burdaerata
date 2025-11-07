import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

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
        <Button
          size='lg'
          className='block mx-auto  my-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold    md:text-sm rounded-2xl transition-all duration-200 hover:scale-105'
        >
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
          <div className='mx-auto'>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              pattern={REGEXP_ONLY_DIGITS}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
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
