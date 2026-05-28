import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

/**
 * Marketing-side landing.
 *
 * Alchemille is a school. The Post-Practice State (PPS) is a method
 * taught inside it. The app supplements the course; it does not replace
 * pen-and-paper or the desktop course.
 */
export default async function Home() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <main className="min-h-screen flex flex-col bg-cream">
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-forest"
        >
          Alchemille
        </Link>
        <nav className="text-small text-forest/70">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="hover:text-forest transition-colors"
            >
              Open the app →
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

      <section className="px-5 sm:px-8 flex-1 flex items-center">
        <div className="max-w-md w-full mx-auto sm:mx-0">
          <p className="text-small uppercase tracking-[0.18em] text-sage-deep mb-4">
            The Alchemille School
          </p>
          <h1 className="font-display text-display text-forest text-balance leading-[1.05]">
            A quiet companion for the window after practice.
          </h1>
          <p className="mt-6 text-body text-forest-soft text-pretty">
            Log a routine. Mark what the window opened into. Take two minutes,
            close the app, and live your day. The school&rsquo;s desktop course
            and your paper journal stay primary.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center h-12 px-7 rounded-cta bg-terracotta text-cream font-medium shadow-cta hover:bg-terracotta-deep transition-colors"
              >
                Open the app
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-cta bg-terracotta text-cream font-medium shadow-cta hover:bg-terracotta-deep transition-colors"
                >
                  Make an account
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-cta text-forest font-medium hover:text-terracotta transition-colors"
                >
                  I already have one
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="px-5 sm:px-8 py-6 text-small text-sage-deep">
        <p className="text-balance">
          Alchemille is a school. The Post-Practice State is one of the
          methods we teach inside it.
        </p>
      </footer>
    </main>
  );
}
