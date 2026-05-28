import type { Config } from "tailwindcss";

/**
 * Alchemille v1 — design tokens
 *
 * Palette (authoritative, exact hexes from the v1 brief):
 *   Warm Cream    #F4EFE3   primary background, paper-like
 *   Deep Forest   #2E4332   primary text, structure, navigation
 *   Terracotta    #C06B47   primary action color (CTAs, daily check-in)
 *   Soft Gold     #C9A24B   ACHIEVEMENT ONLY — streak, milestones
 *   Sage          #8FA37E   secondary & calm states, texture chips
 *
 * Typography:
 *   Cormorant Garamond — headings and display moments only
 *   Inter              — body, data labels, charts (legibility wins)
 *
 * Loaded via next/font/google in src/app/layout.tsx; CSS variables
 * --font-display and --font-sans are wired into the families below.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F4EFE3", // primary background
          deep: "#EDE6D3", // hover surface, alt rows
        },
        forest: {
          DEFAULT: "#2E4332", // primary text / nav
          deep: "#1F2E22", // header/footer surface
          soft: "#3F5644", // body text alternate
        },
        terracotta: {
          DEFAULT: "#C06B47", // primary action color
          deep: "#A45638", // pressed/hover
          tint: "#E9C8B8", // surface tint for terracotta states
        },
        gold: {
          DEFAULT: "#C9A24B", // ACHIEVEMENT ONLY
          deep: "#A88534",
        },
        sage: {
          DEFAULT: "#8FA37E", // secondary, calm
          deep: "#6F8460",
          tint: "#D8E0CF", // texture-chip surface
        },

        // CSS var-backed tokens (for theme-aware utilities)
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        action: "rgb(var(--action) / <alpha-value>)",
        achievement: "rgb(var(--achievement) / <alpha-value>)",
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Cormorant Garamond",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        sans: [
          "var(--font-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // Mobile-first; clamp scales gracefully without media queries
        display: ["clamp(2rem, 1.4rem + 2.5vw, 3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        headline: ["clamp(1.375rem, 1rem + 1vw, 1.875rem)", { lineHeight: "1.15" }],
        title: ["1.125rem", { lineHeight: "1.3", fontWeight: "500" }],
        body: ["1rem", { lineHeight: "1.55" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        chip: ["0.875rem", { lineHeight: "1", letterSpacing: "0.01em" }],
      },
      spacing: {
        // Bottom-nav safe-area padding for one-handed mobile use
        "tap-target": "2.75rem", // 44px minimum tap target
        "bottom-nav": "4.5rem",
      },
      borderRadius: {
        // Rounded and soft per brief; nothing sharp
        DEFAULT: "0.625rem", // 10px
        chip: "999px",
        card: "1rem",
        cta: "0.875rem",
      },
      boxShadow: {
        // Soft, paper-like
        card: "0 1px 2px rgb(46 67 50 / 0.04), 0 8px 24px -12px rgb(46 67 50 / 0.08)",
        cta: "0 1px 2px rgb(192 107 71 / 0.18), 0 6px 18px -8px rgb(192 107 71 / 0.28)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
