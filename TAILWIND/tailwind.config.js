/** TAILWIND THEME BRIDGE (example) */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        'equitie-purple': '#C18AFF',
        'equitie-red': '#F87171',
        'equitie-blue': '#66D0FF',
        'equitie-surface': '#0F0B22',
        'equitie-elevated': '#160F33'
      },
      boxShadow: {
        'equitie-glow': '0 0 32px rgba(200,152,255,0.35)'
      }
    }
  },
  plugins: []
};
