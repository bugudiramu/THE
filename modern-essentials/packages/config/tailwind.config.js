/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          fixed: "#17252A",
          "fixed-dim": "#2B7A78",
          container: "#0b201f",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          fixed: "#3AAFA9",
          "fixed-dim": "#DEF2F1",
          container: "#112a28",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Modern Essentials Vibrant & Fresh Tokens
        "surface-bright": "#feffff",
        "surface-container-highest": "#def2f1",
        "surface": "#feffff",
        "surface-container-low": "#f4fafb",
        "surface-container-high": "#e6f4f3",
        "surface-variant": "#def2f1",
        "surface-container-lowest": "#feffff",
        "surface-container": "#f0f9f8",
        "surface-dim": "#def2f1",
        "on-surface": "#17252A",
        "on-surface-variant": "#2B7A78",
        "outline-variant": "#def2f1",
        "outline": "#2B7A78",
        "on-primary-fixed": "#feffff",
        "on-primary-fixed-variant": "#3AAFA9",
        "on-primary-container": "#feffff",
        "on-secondary-fixed": "#17252A",
        "on-secondary-fixed-variant": "#2B7A78",
        "on-secondary-container": "#feffff",
        "inverse-surface": "#112a28",
        "inverse-on-surface": "#dbe9ee",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        headline: ["var(--font-serif)", "Fraunces", "serif"],
        serif: ["var(--font-serif)", "Fraunces", "serif"],
        body: ["var(--font-sans)", "Space Grotesk", "sans-serif"],
        label: ["var(--font-sans)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-sans)", "Space Grotesk", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
