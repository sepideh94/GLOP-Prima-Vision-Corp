// src/common/theme/appTheme.js
const appTheme = {
  colors: {
    dark: "#1E293B",
    darkSoft: "#334155",

    light: "#F8FAFC",

    textPrimary: "#F9FAFB",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",

    cyan: "#22D3EE",
    green: "#A3E635",
    violet: "#A78BFA",
    yellow: "#facc15", 
  },

  gradients: {
    page: `
      radial-gradient(circle at 15% 25%, rgba(34,211,238,0.18), transparent 40%),
      radial-gradient(circle at 85% 70%, rgba(167,139,250,0.18), transparent 45%),
      linear-gradient(135deg, #F8FAFC, #E2E8F0)
    `,
    sidebar: "linear-gradient(180deg, #1E293B, #020617)",
    navbar: "linear-gradient(90deg, #22D3EE, #A3E635)",
    card: "linear-gradient(180deg, #1E293B, #020617)",
  },

  shadows: {
    card: "0 20px 40px rgba(0,0,0,0.35)",
    glowCyan: "0 0 0 2px rgba(34,211,238,0.3)",
  },

  radius: {
    lg: "22px",
    pill: "999px",
  },

  typography: {
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export default appTheme;
