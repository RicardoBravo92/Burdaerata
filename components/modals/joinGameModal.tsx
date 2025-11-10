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
        <Button size='lg'>Join with Code</Button>
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
        <DialogFooter className='justify-end'>
          <Button
            size={'sm'}
            type='button'
            onClick={handleJoinGame}
            disabled={!code.trim() || code.length !== 6 || joinLoading}
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
