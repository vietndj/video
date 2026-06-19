import { createContext, useContext, useState, useEffect, createElement } from "react";
import type { ReactNode } from "react";

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  tagline: string;

  // Core colors
  bg: string;
  card: string;
  card2: string;
  accent: string;
  accentText: string;
  line: string;
  danger: string;

  // Typography weights & transform
  heroWeight: 700 | 900;
  h2Weight: 700 | 900;
  heroTransform: "uppercase" | "none";
  heroLetterSpacing: string;

  // Font sizes
  heroFontSize: string;
  h2FontSize: string;
  bodyFontSize: string;
  bodyLineHeight: number;

  // Font families (for font scanner)
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  fontAccent: string;

  // Type Scale system
  typeScaleBase: number;   // px, e.g. 16
  typeScaleRatio: number;  // e.g. 1.25 = Major Third

  // Button tokens
  btnRadius: number;       // border-radius px
  btnBorderWidth: number;  // border px
  btnPaddingX: number;     // horizontal padding px
  btnPaddingY: number;     // vertical padding px
  btnVariant: "solid" | "outline" | "ghost";

  // Effects
  accentGlow: boolean;
  cardRadius: number;

  // Text colors — auto-computed from bg luminance if absent
  textBase?: string;   // headings / price display
  textBody?: string;   // body paragraphs
  textMuted?: string;  // secondary / metadata

  // Blockquote style overrides
  blockquoteFontFamily?: string;
  blockquoteFontSize?: string;
  blockquoteFontStyle?: string;
  blockquoteFontWeight?: number;
}

const FONTS = {
  display: "'Noe Display', Georgia, serif",
  body: "'Aeonik', 'Inter', sans-serif",
  mono: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
  accent: "'GT Sectra', Georgia, serif",
};

const BTN_DEFAULTS = {
  btnRadius: 12,
  btnBorderWidth: 0,
  btnPaddingX: 44,
  btnPaddingY: 20,
  btnVariant: "solid" as const,
};

const SCALE_DEFAULTS = {
  typeScaleBase: 16,
  typeScaleRatio: 1.25,
};

export const PRESETS: Theme[] = [
  // ── 1. Type Lab ──────────────────────────────────────────────
  {
    id: "type-lab",
    name: "Type Lab",
    emoji: "⚡",
    tagline: "Blueprint + Neon Cyan",
    bg: "#0b0b0d",
    card: "#141417",
    card2: "#0f0f12",
    accent: "#00F0FF",
    accentText: "#06181b",
    line: "#1d1d22",
    danger: "#e0563b",
    heroWeight: 900,
    h2Weight: 900,
    heroTransform: "uppercase",
    heroLetterSpacing: "-0.015em",
    heroFontSize: "clamp(34px, 6.2vw, 68px)",
    h2FontSize: "clamp(26px, 4vw, 44px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.85,
    accentGlow: true,
    cardRadius: 16,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    ...SCALE_DEFAULTS,
    ...BTN_DEFAULTS,
  },
  // ── 2. Ink & Gold ─────────────────────────────────────────────
  {
    id: "ink-gold",
    name: "Ink & Gold",
    emoji: "✦",
    tagline: "Luxury Editorial",
    bg: "#0a0806",
    card: "#13100a",
    card2: "#0e0c08",
    accent: "#D4AF37",
    accentText: "#0a0806",
    line: "#231e14",
    danger: "#c0392b",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.02em",
    heroFontSize: "clamp(32px, 5.8vw, 64px)",
    h2FontSize: "clamp(24px, 3.8vw, 42px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.9,
    accentGlow: false,
    cardRadius: 12,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    ...SCALE_DEFAULTS,
    ...BTN_DEFAULTS,
    btnRadius: 8,
  },
  // ── 3. Chalk Studio ───────────────────────────────────────────
  {
    id: "chalk-studio",
    name: "Chalk Studio",
    emoji: "◻",
    tagline: "Pure Monochrome",
    bg: "#050505",
    card: "#101010",
    card2: "#0a0a0a",
    accent: "#ffffff",
    accentText: "#050505",
    line: "#222222",
    danger: "#cc2222",
    heroWeight: 900,
    h2Weight: 900,
    heroTransform: "uppercase",
    heroLetterSpacing: "-0.02em",
    heroFontSize: "clamp(32px, 5.8vw, 64px)",
    h2FontSize: "clamp(24px, 3.8vw, 42px)",
    bodyFontSize: "15px",
    bodyLineHeight: 1.8,
    accentGlow: false,
    cardRadius: 8,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    ...SCALE_DEFAULTS,
    ...BTN_DEFAULTS,
    btnRadius: 4,
  },
  // ── 4. Electric Navy ──────────────────────────────────────────
  {
    id: "electric-navy",
    name: "Electric Navy",
    emoji: "◈",
    tagline: "Deep Tech Blue",
    bg: "#060c18",
    card: "#0c1525",
    card2: "#081020",
    accent: "#4DA6FF",
    accentText: "#060c18",
    line: "#142033",
    danger: "#e05050",
    heroWeight: 900,
    h2Weight: 900,
    heroTransform: "uppercase",
    heroLetterSpacing: "-0.015em",
    heroFontSize: "clamp(34px, 6.2vw, 68px)",
    h2FontSize: "clamp(26px, 4vw, 44px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.85,
    accentGlow: true,
    cardRadius: 16,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    ...SCALE_DEFAULTS,
    ...BTN_DEFAULTS,
  },
  // ── 5. Rouge Luxe ─────────────────────────────────────────────
  {
    id: "rouge-luxe",
    name: "Rouge Luxe",
    emoji: "◆",
    tagline: "Fashion & High Impact",
    bg: "#0a0608",
    card: "#140b0d",
    card2: "#0e0809",
    accent: "#E63946",
    accentText: "#fff",
    line: "#261418",
    danger: "#E63946",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.02em",
    heroFontSize: "clamp(30px, 5.6vw, 62px)",
    h2FontSize: "clamp(24px, 3.8vw, 40px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.85,
    accentGlow: false,
    cardRadius: 20,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    ...SCALE_DEFAULTS,
    ...BTN_DEFAULTS,
    btnRadius: 24,
    btnPaddingX: 40,
  },
  // ── 6. Sage Noir ──────────────────────────────────────────────
  {
    id: "sage-noir",
    name: "Sage Noir",
    emoji: "◉",
    tagline: "Natural Premium",
    bg: "#060c09",
    card: "#0c1510",
    card2: "#08110c",
    accent: "#7BC8A4",
    accentText: "#060c09",
    line: "#152218",
    danger: "#e07050",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.02em",
    heroFontSize: "clamp(30px, 5.5vw, 60px)",
    h2FontSize: "clamp(24px, 3.8vw, 40px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.9,
    accentGlow: false,
    cardRadius: 20,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    ...SCALE_DEFAULTS,
    ...BTN_DEFAULTS,
    btnRadius: 20,
  },
  // ── 7. Amber Craft ────────────────────────────────────────────
  {
    id: "amber-craft",
    name: "Amber Craft",
    emoji: "◑",
    tagline: "Creative & Warm",
    bg: "#09080a",
    card: "#13100f",
    card2: "#0e0c0a",
    accent: "#FF9B2F",
    accentText: "#09080a",
    line: "#252018",
    danger: "#e0563b",
    heroWeight: 900,
    h2Weight: 900,
    heroTransform: "uppercase",
    heroLetterSpacing: "-0.015em",
    heroFontSize: "clamp(34px, 6.2vw, 68px)",
    h2FontSize: "clamp(26px, 4vw, 44px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.85,
    accentGlow: true,
    cardRadius: 16,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    ...SCALE_DEFAULTS,
    ...BTN_DEFAULTS,
  },
  // ── 8. Apple HIG ──────────────────────────────────────────────
  {
    id: "apple-hig",
    name: "Apple HIG",
    emoji: "◎",
    tagline: "iOS · Clean System",
    bg: "#1c1c1e",
    card: "#2c2c2e",
    card2: "#242426",
    accent: "#0A84FF",
    accentText: "#ffffff",
    line: "#38383a",
    danger: "#FF453A",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.03em",
    heroFontSize: "clamp(32px, 5.6vw, 62px)",
    h2FontSize: "clamp(24px, 3.8vw, 40px)",
    bodyFontSize: "17px",
    bodyLineHeight: 1.75,
    accentGlow: false,
    cardRadius: 18,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 17,
    typeScaleRatio: 1.2,
    ...BTN_DEFAULTS,
    btnRadius: 14,
    btnPaddingX: 36,
    btnPaddingY: 18,
  },
  // ── 9. Linear ─────────────────────────────────────────────────
  {
    id: "linear",
    name: "Linear",
    emoji: "▲",
    tagline: "Dev Tool · Sharp Purple",
    bg: "#0f0f12",
    card: "#16161f",
    card2: "#121219",
    accent: "#5E6AD2",
    accentText: "#ffffff",
    line: "#25253a",
    danger: "#e05555",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.025em",
    heroFontSize: "clamp(32px, 5.6vw, 62px)",
    h2FontSize: "clamp(24px, 3.8vw, 40px)",
    bodyFontSize: "15px",
    bodyLineHeight: 1.75,
    accentGlow: false,
    cardRadius: 10,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 15,
    typeScaleRatio: 1.25,
    ...BTN_DEFAULTS,
    btnRadius: 8,
    btnPaddingX: 32,
    btnPaddingY: 14,
  },
  // ── 10. Vercel ────────────────────────────────────────────────
  {
    id: "vercel",
    name: "Vercel",
    emoji: "▼",
    tagline: "Radical Minimal · Black/White",
    bg: "#000000",
    card: "#111111",
    card2: "#0a0a0a",
    accent: "#ededed",
    accentText: "#000000",
    line: "#1a1a1a",
    danger: "#e55",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.04em",
    heroFontSize: "clamp(32px, 6vw, 72px)",
    h2FontSize: "clamp(24px, 4vw, 48px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.7,
    accentGlow: false,
    cardRadius: 8,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 16,
    typeScaleRatio: 1.333,
    ...BTN_DEFAULTS,
    btnRadius: 6,
    btnPaddingX: 28,
    btnPaddingY: 14,
  },
  // ── 11. IBM Carbon ────────────────────────────────────────────
  {
    id: "ibm-carbon",
    name: "IBM Carbon",
    emoji: "■",
    tagline: "Structured · Enterprise",
    bg: "#0d0d0d",
    card: "#161616",
    card2: "#111111",
    accent: "#0F62FE",
    accentText: "#ffffff",
    line: "#262626",
    danger: "#da1e28",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.01em",
    heroFontSize: "clamp(30px, 5.2vw, 58px)",
    h2FontSize: "clamp(22px, 3.6vw, 38px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.75,
    accentGlow: false,
    cardRadius: 0,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 16,
    typeScaleRatio: 1.2,
    ...BTN_DEFAULTS,
    btnRadius: 0,
    btnPaddingX: 32,
    btnPaddingY: 16,
  },
  // ── 12. Stripe Night ──────────────────────────────────────────
  {
    id: "stripe-night",
    name: "Stripe Night",
    emoji: "◐",
    tagline: "Premium Payment · Deep Navy",
    bg: "#0a0c1b",
    card: "#12162a",
    card2: "#0e1222",
    accent: "#6772E5",
    accentText: "#ffffff",
    line: "#1e2240",
    danger: "#e55858",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.025em",
    heroFontSize: "clamp(30px, 5.5vw, 60px)",
    h2FontSize: "clamp(24px, 3.8vw, 40px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.8,
    accentGlow: true,
    cardRadius: 14,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 16,
    typeScaleRatio: 1.25,
    ...BTN_DEFAULTS,
    btnRadius: 6,
    btnPaddingX: 36,
    btnPaddingY: 18,
  },
  // ── 13. Warm Paper (Light) ────────────────────────────────────
  {
    id: "warm-paper",
    name: "Warm Paper",
    emoji: "📜",
    tagline: "Tờ giấy ấm · Cổ điển",
    bg: "#faf8f4",
    card: "#f0ebe2",
    card2: "#e5dece",
    accent: "#c0392b",
    accentText: "#ffffff",
    line: "#d4c9b8",
    danger: "#c0392b",
    heroWeight: 900,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.02em",
    heroFontSize: "clamp(36px, 6.5vw, 84px)",
    h2FontSize: "clamp(24px, 4vw, 44px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.78,
    accentGlow: false,
    cardRadius: 10,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 16,
    typeScaleRatio: 1.333,
    ...BTN_DEFAULTS,
    btnRadius: 8,
    btnPaddingX: 40,
    btnPaddingY: 18,
  },
  // ── 14. Sky Blue (Light) ──────────────────────────────────────
  {
    id: "sky-blue",
    name: "Bầu Trời",
    emoji: "🌤",
    tagline: "Bầu trời xanh · Tươi sáng",
    bg: "#f0f5fb",
    card: "#e2ecf7",
    card2: "#cdddf0",
    accent: "#2563eb",
    accentText: "#ffffff",
    line: "#b4c8e0",
    danger: "#dc2626",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.025em",
    heroFontSize: "clamp(34px, 6vw, 78px)",
    h2FontSize: "clamp(24px, 4vw, 44px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.72,
    accentGlow: false,
    cardRadius: 14,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 16,
    typeScaleRatio: 1.25,
    ...BTN_DEFAULTS,
    btnRadius: 12,
    btnPaddingX: 44,
    btnPaddingY: 18,
  },
  // ── 15. Matcha Milk (Light) ───────────────────────────────────
  {
    id: "matcha-milk",
    name: "Matcha Milk",
    emoji: "🍵",
    tagline: "Trà Matcha · Xanh mịn nhẹ",
    bg: "#f4f8f2",
    card: "#e8f2e4",
    card2: "#d6eacf",
    accent: "#2d6a4f",
    accentText: "#ffffff",
    line: "#b2ceaa",
    danger: "#c0392b",
    heroWeight: 700,
    h2Weight: 700,
    heroTransform: "none",
    heroLetterSpacing: "-0.02em",
    heroFontSize: "clamp(34px, 6vw, 80px)",
    h2FontSize: "clamp(24px, 4vw, 44px)",
    bodyFontSize: "16px",
    bodyLineHeight: 1.75,
    accentGlow: false,
    cardRadius: 12,
    fontDisplay: FONTS.display,
    fontBody: FONTS.body,
    fontMono: FONTS.mono,
    fontAccent: FONTS.accent,
    typeScaleBase: 16,
    typeScaleRatio: 1.25,
    ...BTN_DEFAULTS,
    btnRadius: 10,
    btnPaddingX: 40,
    btnPaddingY: 18,
  },
];

// ─── File-based helpers (replaces localStorage) ───────────────

export function deriveTextColors(base: Theme): Theme {
  const isLight = relativeLuminance(base.bg) > 0.35;
  return {
    ...base,
    textBase: isLight ? "#111111" : "#f0f0f0",
    textBody: isLight ? "#374151" : "#b0b0b0",
    textMuted: isLight ? "#6b7280" : "#888888",
  };
}

export async function loadTheme(): Promise<Theme> {
  try {
    const res = await fetch("/api/theme?_=" + Date.now());
    if (!res.ok) return deriveTextColors(PRESETS[0]);
    const data = (await res.json()) as Partial<Theme>;
    const preset = data.id ? (PRESETS.find((p) => p.id === data.id) ?? PRESETS[0]) : PRESETS[0];
    return deriveTextColors({ ...preset, ...data });
  } catch {
    return deriveTextColors(PRESETS[0]);
  }
}

export async function saveTheme(theme: Theme): Promise<void> {
  const res = await fetch("/api/save-theme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(theme),
  });
  if (!res.ok) throw new Error("Failed to save theme");
}

// ─── Type scale helper ────────────────────────────────────────
export function computeTypeScale(base: number, ratio: number) {
  const r = (n: number) => Math.round(base * Math.pow(ratio, n));
  return {
    xs: r(-2),
    sm: r(-1),
    base: r(0),
    md: r(1),
    lg: r(2),
    xl: r(3),
    "2xl": r(4),
    "3xl": r(5),
    display: r(6),
  };
}

// ─── WCAG contrast checker ────────────────────────────────────
function hexToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return 0.2126 * hexToLinear(r) + 0.7152 * hexToLinear(g) + 0.0722 * hexToLinear(b);
}
export function contrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = relativeLuminance(hex1);
    const l2 = relativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch { return 1; }
}

// ─── React context ────────────────────────────────────────────
const ThemeCtx = createContext<Theme>(deriveTextColors(PRESETS[0]));

export function useTheme(): Theme {
  return useContext(ThemeCtx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => deriveTextColors(PRESETS[0]));

  useEffect(() => {
    loadTheme().then(setTheme);
  }, []);

  return createElement(ThemeCtx.Provider, { value: theme }, children);
}
