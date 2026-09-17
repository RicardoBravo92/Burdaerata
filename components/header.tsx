import React from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

function header() {
  return (
    <header className='sticky top-0 z-50 flex justify-between items-center p-4 gap-4 h-12 md:h-16 bg-felt/90 backdrop-blur text-felt-foreground border-b border-white/10 shrink-0'>
      <h1 className='text-base md:text-xl font-bold my-2 text-start text-white'>
        Burdaerata
      </h1>
      <div className='items-end flex gap-2'>
        <SignedOut>
          <SignInButton>
            <button className='text-felt-foreground bg-white/10 rounded-full font-medium text-sm h-6 md:h-8 px-2 md:px-4 hover:bg-white/20 transition-colors shadow-sm border border-white/15'>
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className='text-white bg-primary rounded-full font-medium text-sm h-6 md:h-8 px-2 md:px-4 hover:bg-primary/90 transition-colors shadow-sm'>
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton appearance={{ variables: { colorPrimary: '#c92f42' } }} />
        </SignedIn>
      </div>
    </header>
  );
}

export default header;