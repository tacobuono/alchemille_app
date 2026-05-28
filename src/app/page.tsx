import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

/**
 * Marketing-side landing for the student app.
 * Authenticated students see "Open dashboard"; unauthenticated visitors
 * see a quiet letter and the door in.
 *
 * Voice: practitioner-researcher. Outcome first, method second.
 * No guru language. Like a letter, not a landing page.
 */
export default async function Home() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-forest"
        >
          The Alchemille
        </Link>
        <nav className="text-sm text-sage-grey">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="hover:text-forest transition-colors"
            >
              Open dashboard →
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hover:text-forest transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <section className="px-6 sm:px-10 flex-1 flex items-center">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.18em] text-sage-grey mb-6">
            The Post-Practice State
          </p>
          <h1 className="font-serif text-display-1 text-forest text-balance leading-[1.02]">
            Practice. Window. Garden.
          </h1>
          <p className="mt-8 text-body-lg text-forest-dark text-pretty max-w-xl">
            The student app for the premier course. Track your practice,
            catch what arrives in the post-practice window, and watch the garden
            of your work fill in — one herb at a time.
          </p>
          <div className="mt-10 flex gap-4 items-center">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center h-11 px-6 bg-forest text-cream rounded text-sm tracking-wide hover:bg-forest-deep transition-colors"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-11 px-6 bg-forest text-cream rounded text-sm tracking-wide hover:bg-forest-deep transition-colors"
                >
                  Enter
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center h-11 px-6 text-forest text-sm tracking-wide hover:text-gold transition-colors"
                >
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-8 text-xs text-sage-grey">
        <p>
          The Alchemille teaches yoga for the artist, the academic, and the
          serious practitioner — weaving the soul of the tradition with the
          neuroscience of its fruits.
        </p>
      </footer>
    </main>
  );
}
