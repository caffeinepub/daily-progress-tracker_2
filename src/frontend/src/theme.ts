export const theme = {
  colors: {
    bg: "#0B0C0D",
    surface: "#1A1C1F",
    surfaceHover: "#222529",
    border: "#2A2D31",
    text: "#F4F6F8",
    textMuted: "#A7ADB5",
    textDim: "#7A808A",
    accent: "#2F7DF6",
    teal: "#22C7C9",
    orange: "#F2A23A",
    pink: "#FF4D6D",
    success: "#30D158",
  },
  radius: { sm: "8px", md: "14px", lg: "20px", pill: "9999px" },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "40px" },
  font: {
    xs: "11px",
    sm: "13px",
    md: "15px",
    lg: "20px",
    xl: "28px",
    xxl: "36px",
  },
  anim: { fast: "120ms", normal: "220ms", slow: "380ms" },
} as const;

export type Theme = typeof theme;
