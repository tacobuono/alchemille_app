"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Mobile-first bottom tab nav. Lives at the bottom of the (app) shell.
 * Four tabs: Today / Reflect / Library / You.
 *
 * Tap targets are >= 44px. Safe-area inset is handled by the parent
 * .pb-shell utility on scrollable content; the nav itself sits above it.
 */
const TABS = [
  { href: "/dashboard", label: "Today", icon: TodayIcon },
  { href: "/reflect", label: "Reflect", icon: ReflectIcon },
  { href: "/library", label: "Library", icon: LibraryIcon },
  { href: "/you", label: "You", icon: YouIcon },
] as const;

export function MobileNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-30 bg-cream/95 backdrop-blur border-t border-sage/30"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto max-w-md grid grid-cols-4">
        {TABS.map((tab) => {
          const active =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center justify-center gap-1 py-2.5 min-h-tap-target text-xs transition-colors",
                  active
                    ? "text-forest"
                    : "text-forest/55 hover:text-forest",
                ].join(" ")}
              >
                <Icon active={active} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ----- Line icons (minimal, botanical-leaning) ------------------------

interface IconProps {
  active: boolean;
}

function TodayIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3c-3 5-5 8.5-5 12a5 5 0 0 0 10 0c0-3.5-2-7-5-12z" />
    </svg>
  );
}

function ReflectIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
    </svg>
  );
}

function LibraryIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 5h7v14H4zM13 5h7v14h-7zM6 9h3M15 9h3M6 13h3M15 13h3" />
    </svg>
  );
}

function YouIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}
