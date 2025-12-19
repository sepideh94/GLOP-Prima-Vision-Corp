
const appTheme = {
  colors: {
    // Base
    backgroundLight: "#F1F5F9",
    backgroundDark: "#050816",
    backgroundDarkAlt: "#0B1220",
    surfaceDark: "#0F172A",

    // Text
    textPrimary: "#F9FAFB",
    textSecondary: "#CBD5F5",
    textMuted: "#9CA3AF",

    // Accents
    accentGreen: "#A3E635",
    accentCyan: "#22D3EE",
    danger: "#FCA5A5",

    // Borders
    borderSoft: "rgba(148,163,184,0.5)",
    borderDark: "#1F2937",
  },

  gradients: {
    pageBackground: `
      radial-gradient(circle at 20% 30%, rgba(163, 230, 53, 0.25), transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.20), transparent 55%),
      linear-gradient(135deg, #F1F5F9, #CBD5E1)
    `,

    darkPanel: "linear-gradient(135deg, #050816, #0B1220)",

    darkPanelSoft:
      "linear-gradient(145deg, #050816 0%, #0F172A 40%, #0B1220 100%)",

    accentVertical:
      "linear-gradient(180deg, #22D3EE, #A3E635)",

    primaryButton:
      "linear-gradient(90deg, #22D3EE 0%, #A3E635 50%, #22D3EE 100%)",
  },

  shadows: {
    xl: "0 24px 80px rgba(0,0,0,0.7)",
    button: "0 10px 30px rgba(34,211,238,0.35)",
    card: "0 12px 30px rgba(0,0,0,0.35)",
  },

  radius: {
    sm: "8px",
    md: "12px",
    lg: "24px",
    pill: "999px",
  },

  typography: {
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    titleWeight: 800,
    sectionTitleWeight: 700,
    textWeight: 400,
  },
};

export default appTheme;
