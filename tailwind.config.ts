import type { Config } from "tailwindcss";

/**
 * The Alchemille — design tokens
 *
 * Palette per Alison's Vision Doc Volume III (authoritative).
 * Coral is single-use: CTAs and moments of emphasis only, never body text.
 *
 * Typography: Georgia for serif/headers/pull-quotes,
 * Inter for sans body/UI. Loaded via next/font in src/app/layout.tsx.
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
        // Primary palette (authoritative — Vision Doc Vol. III)
        forest: {
          DEFAULT: "#2F4F3A", // primary forest green
          deep: "#243E2D",
          dark: "#1F2A24", // dark ink — body text on light, darkest bg
        },
        gold: {
          DEFAULT: "#A8874C", // alchemical gold — accent
          light: "#D4A74B", // window-light gold
        },
        cream: {
          DEFAULT: "#FBF7EE", // pull-quote bg, highlight
          deep: "#F4EDDB", // alternating table rows
        },
        sage: {
          DEFAULT: "#8FA89A", // mid-sage — quiet borders
          grey: "#6B7A72", // muted meta text
        },
        coral: "#C9533A", // single-use accent — CTAs only

        // Stage-saturation tokens (alchemical spine)
        // Used by the layout shell to desaturate Nigredo → brighten Albedo → bloom Rubedo
        stage: {
          nigredo: {
            bg: "#E8E5DE", // bone — desaturated cream
            fg: "#3A4239", // desaturated forest
          },
          albedo: {
            bg: "#FBF7EE", // cream
            fg: "#2F4F3A", // forest
          },
          rubedo: {
            bg: "#FBF7EE",
            fg: "#2F4F3A",
            accent: "#C9533A", // coral blooms in here
          },
        },

        // Background/foreground CSS vars for stage-driven theming
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
      },
      fontFamily: {
        // Georgia first per Vision Doc — pairs with Inter for UI
        serif: [
          "Georgia",
          "var(--font-georgia-fallback)",
          "ui-serif",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
        sans: [
          "var(--font-inter)",
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
        // Editorial scale — generous, restrained
        "display-1": ["clamp(3rem, 1rem + 7vw, 6.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-2": ["clamp(2.25rem, 1rem + 4vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "headline": ["clamp(1.5rem, 0.9rem + 1.5vw, 2.25rem)", { lineHeight: "1.2" }],
        "body-lg": ["clamp(1.0625rem, 0.95rem + 0.4vw, 1.1875rem)", { lineHeight: "1.6" }],
      },
      spacing: {
        section: "clamp(4rem, 3rem + 5vw, 9rem)",
      },
      borderRadius: {
        // Restrained — no novelty radii
        DEFAULT: "0.25rem",
        lg: "0.5rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        window: "5400000ms", // 90 min — the post-practice window dim animation
      },
      keyframes: {
        "window-open": {
          "0%": { opacity: "0", filter: "brightness(0.6)" },
          "10%": { opacity: "1", filter: "brightness(1.15)" },
          "100%": { opacity: "1", filter: "brightness(1.0)" },
        },
      },
      animation: {
        "window-open": "window-open 2.4s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
