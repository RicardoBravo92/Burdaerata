import React from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

function header() {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center p-4 gap-4 h-16 bg-[#444573]   shadow-sm shrink-0">
      <h1 className="text-3xl md:text-xl font-bold text-white my-2 text-start">
        Burdaerata
      </h1>
      <div className="items-end flex gap-2">
        <SignedOut>
          <SignInButton>
            <button className="text-[#6c47ff] bg-white rounded-full font-medium text-sm h-8 px-4 md:px-2 hover:bg-white/90 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-white text-[#6c47ff] rounded-full font-medium text-sm h-8 px-4 md:px-2 hover:bg-white/90 transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton appearance={{ variables: { colorPrimary: "#6c47ff" } }} />
        </SignedIn>
      </div>
    </header>
  );
}

export default header;
