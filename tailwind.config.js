export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        bg: "var(--bg-primary)",
        panel: "var(--bg-secondary)",
        card: "var(--bg-card)",
        border: "var(--border)",
        strong: "var(--border-strong)",
        teal: "var(--accent-primary)",
        amber: "var(--accent-secondary)",
        text: "var(--text-primary)",
        muted: "var(--text-secondary)",
        subtle: "var(--text-subtle)",
        win: "var(--win)",
        draw: "var(--draw)",
        loss: "var(--loss)",
        pitch: "var(--pitch-green)",
        pitchLine: "var(--pitch-lines)",
      },
    },
  },
  plugins: [],
};
