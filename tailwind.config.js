/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05070d",
        panel: "#0b1220",
        "panel-edge": "#16243a",
        grid: "#0e2a3d",
        cyan: {
          DEFAULT: "#00f0ff",
          dim: "#0aa7b8",
        },
        magenta: {
          DEFAULT: "#ff2bd6",
          dim: "#b81fa0",
        },
        amber: "#ffb800",
        healthy: "#19ffb0",
        danger: "#ff3b5c",
      },
      fontFamily: {
        display: ["Chakra Petch", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(0,240,255,0.55), 0 0 32px rgba(0,240,255,0.25)",
        "glow-magenta": "0 0 12px rgba(255,43,214,0.55), 0 0 32px rgba(255,43,214,0.25)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at center, rgba(0,240,255,0.07) 0%, rgba(5,7,13,0) 70%)",
      },
    },
  },
  plugins: [],
};
