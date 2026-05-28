"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

export function SignOutButton() {
  return (
    <ClerkSignOutButton redirectUrl="/">
      <button
        type="button"
        className="inline-flex items-center justify-center h-11 px-5 rounded-cta border border-sage/40 text-forest text-small hover:bg-sage-tint transition-colors"
      >
        Sign out
      </button>
    </ClerkSignOutButton>
  );
}
