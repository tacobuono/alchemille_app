# The Alchemille — Student App

Next.js 15 app for **The Post-Practice State** premier course.
Tracks each student's practice, opens the post-practice window, grows a garden
of herbs, and surfaces Alison's voice notes at milestones.

> The Alchemille teaches yoga for the artist, the academic, and the serious
> practitioner — weaving the soul of the tradition with the neuroscience of its
> fruits.

## Stack

| Layer        | Choice                                |
| ------------ | ------------------------------------- |
| Framework    | Next.js 15 (App Router) + TypeScript  |
| Styling      | Tailwind CSS + Alchemille palette     |
| Typography   | Georgia (serif) + Inter (sans)        |
| Auth         | Clerk                                 |
| Database     | Supabase (Postgres + RLS + Storage)   |
| Forms        | react-hook-form + Zod                 |
| Animation    | Framer Motion                         |
| Email        | Resend                                |
| Charts       | Recharts (teacher dashboard)          |
| Hosting      | Vercel (`alchemilleapp.vercel.app`)   |

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# fill in Clerk, Supabase, and Resend keys

# 3. Run the Supabase migration
#    Studio → SQL Editor → paste supabase/migrations/0001_initial.sql → Run
#    Or with the Supabase CLI:
#    npx supabase db push

# 4. Create Storage buckets in Supabase Studio:
#    - profile-photos    (public)
#    - practice-spaces   (public)
#    - voice-notes       (private, signed URLs)
#    - module-videos     (private, signed URLs)

# 5. Configure Clerk:
#    - Create application
#    - Set fallback redirect URLs (see .env.local.example)
#    - Webhooks → add <APP_URL>/api/webhooks/clerk
#      events: user.created, user.updated, user.deleted

# 6. Run dev server
npm run dev
```

App lives at <http://localhost:3000>.

## Project layout

```
src/
├── app/
│   ├── (app)/                # Authenticated shell (spine + header)
│   │   ├── layout.tsx        # Resolves stage, gates onboarding
│   │   └── dashboard/        # Window + garden + begin-practice
│   ├── api/webhooks/clerk/   # Clerk → Supabase user sync
│   ├── onboarding/           # Outside (app) — fresh sign-ups land here
│   ├── sign-in/[[...sign-in]]/
│   ├── sign-up/[[...sign-up]]/
│   ├── layout.tsx            # ClerkProvider + Inter
│   ├── globals.css           # Stage CSS vars + base typography
│   └── page.tsx              # Public landing letter
├── components/layout/        # AlchemicalSpine + AppHeader
├── lib/
│   ├── herbs.ts              # Curriculum-ordered herb catalog
│   ├── stage.ts              # Nigredo / Albedo / Rubedo logic
│   ├── schemas/              # Zod schemas (shared client+server)
│   └── supabase/             # client / server / admin / types
├── middleware.ts             # Clerk route protection
└── ...

supabase/
└── migrations/0001_initial.sql   # Tables, enums, RLS policies
```

## Build order (matches the original brief)

| Week | Scope                                                  |
| ---- | ------------------------------------------------------ |
| 1    | Auth, onboarding, schema, Tailwind, layout shell ✅    |
| 2    | Practice session UI (timer, video, capture form)       |
| 3    | Journal flow (auto-open, time stamps, window detection)|
| 4    | Dashboard polish (window animation, garden viz, spine) |
| 5    | Voice notes, encouragement triggers, teacher dashboard |
| 6    | Community garden, letters drawer, opt-in, polish       |

## Brand voice — do not drift

- Practitioner-researcher. Not wellness teacher.
- No guru posture, no mystical overpromise.
- Outcome first, method second.
- "When in doubt: make it feel like a letter, not a landing page."

## Five experience principles

1. **Window opens visually** on the dashboard after each completed practice
2. **Alchemical spine nav** — UI saturation increases with progress
3. **Garden, not bar** — herbs accumulate
4. **Journal auto-opens** post-practice; entries flagged in/outside window
5. **Community is quiet** — letters drawer, no feed, no likes

## Restart policy

Students who fall off never reset. Garden persists. No streak counter shown.
When they return: "your garden is waiting. let's add the next plant."
