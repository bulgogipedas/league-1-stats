export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        bg: "#FFFFFF",
        panel: "#F4F4F4",
        card: "#FFFFFF",
        border: "#E0E0E0",
        strong: "#161616",
        teal: "#0F62FE",
        amber: "#F1C21B",
        text: "#161616",
        muted: "#525252",
        subtle: "#8C8C8C",
        win: "#24A148",
        draw: "#8D8D8D",
        loss: "#DA1E28",
        pitch: "#F4F4F4",
        pitchLine: "#C6C6C6",
      },
    },
  },
  plugins: [],
};
