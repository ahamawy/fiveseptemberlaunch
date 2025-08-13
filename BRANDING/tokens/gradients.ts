/**
 * Equitie Gradient Tokens
 * Brand gradients for backgrounds, buttons, and effects
 */

export const gradients = {
  // Brand gradients
  brand: {
    primary: 'linear-gradient(135deg, #C898FF 0%, #9B7AC1 100%)',
    primaryReverse: 'linear-gradient(135deg, #9B7AC1 0%, #C898FF 100%)',
    hero: 'linear-gradient(145deg, #C898FF 0%, #66D0FF 100%)',
    heroRadial: 'radial-gradient(circle at 30% 30%, #C898FF 0%, #66D0FF 50%, #040210 100%)',
    sunset: 'linear-gradient(135deg, #FF9A62 0%, #FF62E3 50%, #C898FF 100%)',
    ocean: 'linear-gradient(135deg, #0B5B7D 0%, #66D0FF 50%, #62FF7F 100%)',
  },

  // Background gradients
  background: {
    dark: 'linear-gradient(180deg, #0B071A 0%, #040210 100%)',
    darkReverse: 'linear-gradient(180deg, #040210 0%, #0B071A 100%)',
    surface: 'linear-gradient(120deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
    radial: 'radial-gradient(1000px 600px at 20% -10%, rgba(200, 152, 255, 0.25), transparent)',
    mesh: `
      radial-gradient(at 40% 20%, rgba(200, 152, 255, 0.3) 0px, transparent 50%),
      radial-gradient(at 80% 0%, rgba(102, 208, 255, 0.2) 0px, transparent 50%),
      radial-gradient(at 10% 50%, rgba(98, 255, 127, 0.2) 0px, transparent 50%),
      radial-gradient(at 80% 80%, rgba(255, 154, 98, 0.2) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(255, 98, 227, 0.2) 0px, transparent 50%)
    `,
  },

  // Glass morphism gradients
  glass: {
    light: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    medium: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
    strong: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
    purple: 'linear-gradient(135deg, rgba(200, 152, 255, 0.15) 0%, rgba(200, 152, 255, 0.05) 100%)',
  },

  // Button gradients
  button: {
    primary: 'linear-gradient(135deg, #C898FF 0%, #B47FE5 100%)',
    primaryHover: 'linear-gradient(135deg, #D9B7FF 0%, #C898FF 100%)',
    success: 'linear-gradient(135deg, #62FF7F 0%, #22C55E 100%)',
    warning: 'linear-gradient(135deg, #FFD166 0%, #F59E0B 100%)',
    danger: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
    info: 'linear-gradient(135deg, #66D0FF 0%, #3B82F6 100%)',
  },

  // Card gradients
  card: {
    purple: 'linear-gradient(135deg, rgba(200, 152, 255, 0.1) 0%, rgba(200, 152, 255, 0.05) 100%)',
    green: 'linear-gradient(135deg, rgba(98, 255, 127, 0.1) 0%, rgba(98, 255, 127, 0.05) 100%)',
    blue: 'linear-gradient(135deg, rgba(102, 208, 255, 0.1) 0%, rgba(102, 208, 255, 0.05) 100%)',
    orange: 'linear-gradient(135deg, rgba(255, 154, 98, 0.1) 0%, rgba(255, 154, 98, 0.05) 100%)',
    mixed: 'linear-gradient(135deg, rgba(200, 152, 255, 0.1) 0%, rgba(102, 208, 255, 0.05) 100%)',
  },

  // Border gradients
  border: {
    purple: 'linear-gradient(135deg, #C898FF, #9B7AC1)',
    rainbow: 'linear-gradient(135deg, #C898FF, #66D0FF, #62FF7F, #FFD166, #FF9A62)',
    subtle: 'linear-gradient(135deg, rgba(200, 152, 255, 0.5), rgba(200, 152, 255, 0.1))',
  },

  // Text gradients
  text: {
    purple: 'linear-gradient(135deg, #C898FF 0%, #9B7AC1 100%)',
    hero: 'linear-gradient(135deg, #C898FF 0%, #66D0FF 100%)',
    rainbow: 'linear-gradient(135deg, #C898FF, #66D0FF, #62FF7F)',
  },

  // Overlay gradients
  overlay: {
    dark: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%)',
    light: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    purple: 'linear-gradient(180deg, rgba(200, 152, 255, 0.2) 0%, transparent 100%)',
  },
} as const;

export type GradientToken = typeof gradients;