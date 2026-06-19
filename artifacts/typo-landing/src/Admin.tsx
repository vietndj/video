import { useState, useEffect, useCallback } from "react";
import { Theme, PRESETS, loadTheme, saveTheme, deriveTextColors, contrastRatio, computeTypeScale } from "./theme";
import { PageContent, DEFAULT_CONTENT, loadContent, saveContent } from "./content";

const NOE = "'Noe Display', Georgia, serif";
const AEONIK = "'Aeonik', 'Inter', sans-serif";
const MONO = "'JetBrains Mono', Consolas, monospace";

const A = {
  bg: "#08080a", panel: "#0f0f12", card: "#141417",
  border: "#2a2a34", text: "#e8e8ec", muted: "#9595a8", accent: "#00F0FF",
};

type Tab = "themes" | "content" | "colors" | "typography" | "effects";

interface FontGroup { family: string; files: { filename: string; weight: string; style: string }[] }

// ─── Shared UI components ─────────────────────────────────────
function Swatch({ color, size = 20 }: { color: string; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, border: "1.5px solid #2a2a32", flexShrink: 0 }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, color: "#7070a0", fontFamily: MONO, margin: "16px 0 10px", letterSpacing: "0.1em" }}>── {children} ──</div>;
}

function ContrastBadge({ ratio, label }: { ratio: number; label: string }) {
  const pass = ratio >= 4.5;
  const passAaa = ratio >= 7;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "6px 10px", borderRadius: 6, marginBottom: 8,
      background: pass ? "#0a2a14" : "#2a0a0a",
      border: `1px solid ${pass ? "#1a5a2a" : "#5a1a1a"}`,
    }}>
      <span style={{ fontSize: 11, color: A.muted, fontFamily: MONO }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: pass ? "#7effc0" : "#ff7e7e" }}>
          {ratio.toFixed(2)}:1
        </span>
        <span style={{
          fontSize: 9, padding: "2px 5px", borderRadius: 3, fontFamily: MONO, fontWeight: 700,
          background: passAaa ? "#1a5a2a" : pass ? "#1a3a1a" : "#5a1a1a",
          color: passAaa ? "#7effc0" : pass ? "#4adf84" : "#ff7e7e",
        }}>
          {passAaa ? "AAA" : pass ? "AA ✓" : "FAIL"}
        </span>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange, bg }: {
  label: string; value: string; onChange: (v: string) => void; bg?: string;
}) {
  const ratio = bg ? contrastRatio(value, bg) : null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ratio !== null && ratio < 4.5 ? 4 : 0 }}>
        <span style={{ fontSize: 12, color: A.muted, fontFamily: MONO }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 28, height: 28 }}>
            <input type="color" value={value.length === 7 ? value : "#000000"} onChange={(e) => onChange(e.target.value)}
              style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer", border: "none" }} />
            <Swatch color={value} size={28} />
          </div>
          <input type="text" value={value} maxLength={9}
            onChange={(e) => { if (/^#[0-9a-fA-F]{0,8}$/.test(e.target.value)) onChange(e.target.value); }}
            style={{ width: 86, background: A.card, border: `1px solid ${A.border}`, borderRadius: 6, color: A.text, padding: "5px 8px", fontSize: 12, fontFamily: MONO, outline: "none" }} />
        </div>
      </div>
      {ratio !== null && ratio < 4.5 && (
        <div style={{ fontSize: 10, color: "#ff6b6b", fontFamily: MONO, paddingLeft: 4 }}>
          ⚠ Contrast {ratio.toFixed(2)}:1 — min 4.5:1 (WCAG AA)
        </div>
      )}
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: A.muted, fontFamily: MONO }}>{label}</span>
        <span style={{ fontSize: 12, color: A.text, fontFamily: MONO, fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: A.accent, cursor: "pointer" }} />
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: A.muted, fontFamily: MONO }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer", background: value ? A.accent : "#2a2a32", position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </div>
    </div>
  );
}

function RadioRow({ label, options, value, onChange }: {
  label: string; options: { v: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map((o) => (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            flex: 1, padding: "6px 4px", borderRadius: 6, border: "none",
            background: value === o.v ? A.accent : A.card,
            color: value === o.v ? "#06181b" : A.muted,
            fontFamily: MONO, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Theme mini card ──────────────────────────────────────────
function ThemeCard({ theme, isActive, onClick }: { theme: Theme; isActive: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: theme.bg, border: `2px solid ${isActive ? theme.accent : hov ? "#444" : "#2a2a32"}`, borderRadius: 12, padding: "12px 10px", cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
      {isActive && <div style={{ position: "absolute", top: 6, right: 6, background: theme.accent, color: theme.accentText, fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 3, fontFamily: MONO }}>ON</div>}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[theme.accent, theme.card, theme.bg].map((c, i) => <Swatch key={i} color={c} size={14} />)}
      </div>
      <div style={{ fontFamily: NOE, fontWeight: theme.heroWeight, fontSize: 10, color: "#fff", textTransform: theme.heroTransform, marginBottom: 4, letterSpacing: theme.heroLetterSpacing }}>
        TYPE DISPLAY
      </div>
      <div style={{ width: "100%", height: 1.5, background: theme.accent, marginBottom: 4, borderRadius: 1 }} />
      <div style={{
        background: theme.accent, color: theme.accentText,
        fontSize: 7, fontWeight: 700, padding: "3px 8px",
        borderRadius: theme.btnRadius, display: "inline-block", fontFamily: AEONIK, marginBottom: 8,
      }}>CTA</div>
      <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: AEONIK }}>{theme.emoji} {theme.name}</div>
        <div style={{ fontSize: 8, color: "#555", fontFamily: MONO, marginTop: 1 }}>{theme.tagline}</div>
      </div>
    </div>
  );
}

// ─── Content Editor Accordion ─────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: open ? A.card : "transparent", border: `1px solid ${open ? A.border : "transparent"}`,
        borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: A.text, fontFamily: MONO,
        fontSize: 11, fontWeight: 700, transition: "all 0.15s",
      }}>
        {title}
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: A.muted }}>▾</span>
      </button>
      {open && <div style={{ padding: "12px 4px 4px" }}>{children}</div>}
    </div>
  );
}

function FieldInput({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string;
}) {
  const baseStyle: React.CSSProperties = {
    width: "100%", background: "#0a0a0e", border: `1px solid ${A.border}`, borderRadius: 6,
    color: A.text, padding: "8px 10px", fontSize: 12, fontFamily: AEONIK, outline: "none",
    resize: multiline ? "vertical" : "none", boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 5, letterSpacing: "0.06em" }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={baseStyle} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle} />}
      {hint && <div style={{ fontSize: 9, color: "#555", fontFamily: MONO, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 6 }}>{label}</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <textarea value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} rows={2}
            style={{ flex: 1, background: "#0a0a0e", border: `1px solid ${A.border}`, borderRadius: 6, color: A.text, padding: "6px 8px", fontSize: 11, fontFamily: AEONIK, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          <button onClick={() => { const n = [...items]; n.splice(i, 1); onChange(n); }}
            style={{ flexShrink: 0, padding: "0 8px", background: "#2a0a0a", border: "1px solid #5a1a1a", borderRadius: 6, color: "#ff7e7e", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])}
        style={{ width: "100%", padding: "6px", background: "transparent", border: `1px dashed ${A.border}`, borderRadius: 6, color: A.muted, cursor: "pointer", fontFamily: MONO, fontSize: 10, marginTop: 4 }}>
        + Thêm mục
      </button>
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────
function LivePreview({ theme }: { theme: Theme }) {
  const scale = computeTypeScale(theme.typeScaleBase, theme.typeScaleRatio);
  return (
    <div style={{ background: theme.bg, minHeight: "100%", padding: "40px 48px", overflowY: "auto", color: "#fff", fontFamily: AEONIK }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontSize: 10, fontFamily: MONO, color: theme.accent, letterSpacing: "0.2em", marginBottom: 24, textTransform: "uppercase" }}>// Live Preview</div>

        {/* Type Scale */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: A.muted, letterSpacing: "0.15em", marginBottom: 20, textTransform: "uppercase" }}>01 — TYPE SCALE</div>
          <div style={{ fontFamily: NOE, fontWeight: theme.heroWeight, fontSize: theme.heroFontSize, lineHeight: 1.08, letterSpacing: theme.heroLetterSpacing, textTransform: theme.heroTransform, marginBottom: 8 }}>
            Typography<br /><span style={{ color: theme.accent, textShadow: theme.accentGlow ? `0 0 40px ${theme.accent}66` : "none" }}>không phải cảm tính</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: A.muted, marginBottom: 28 }}>
            → {theme.fontDisplay.split("'")[1] ?? "Noe Display"} {theme.heroWeight} · {theme.heroFontSize} · {theme.heroTransform}
          </div>

          {/* Type Scale System */}
          <div style={{ background: "#111", border: `1px solid #222`, borderRadius: 10, padding: "16px 20px", marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontFamily: MONO, color: A.muted, marginBottom: 12 }}>TYPE SCALE — base {theme.typeScaleBase}px × {theme.typeScaleRatio}</div>
            {Object.entries(scale).map(([name, size]) => (
              <div key={name} style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: "#555", width: 52, textAlign: "right", flexShrink: 0 }}>{name}</span>
                <span style={{ fontSize: size, fontFamily: AEONIK, lineHeight: 1.1, color: theme.accent, fontWeight: name === "display" || name === "3xl" ? 700 : 400 }}>Aa</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: "#444" }}>{size}px</span>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: NOE, fontWeight: theme.h2Weight, fontSize: theme.h2FontSize, lineHeight: 1.18, marginBottom: 8 }}>Đây là Section Heading</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: A.muted, marginBottom: 28 }}>→ Noe Display {theme.h2Weight} · {theme.h2FontSize}</div>

          <blockquote style={{ borderLeft: `3px solid ${theme.accent}`, paddingLeft: 20, margin: "0 0 24px", fontFamily: "'GT Sectra', Georgia, serif", fontStyle: "italic", fontSize: "clamp(18px, 2.2vw, 22px)", color: "#c0c0c0", lineHeight: 1.7 }}>
            "Đây là chữ nghiêng GT Sectra — dùng cho blockquote và italic accent."
          </blockquote>
          <div style={{ fontFamily: MONO, fontSize: 10, color: A.muted, marginBottom: 28 }}>→ GT Sectra Italic · clamp(18px, 2.2vw, 22px)</div>

          <p style={{ fontSize: theme.bodyFontSize, lineHeight: theme.bodyLineHeight, color: "#b0b0b0", marginBottom: 8 }}>
            Đây là nội dung body text sử dụng font Aeonik Regular. Aeonik có độ khả đọc cao, tỷ lệ x-height tốt cho màn hình digital.
          </p>
          <div style={{ fontFamily: MONO, fontSize: 10, color: A.muted }}>→ Aeonik Regular · {theme.bodyFontSize} · line-height {theme.bodyLineHeight}</div>
        </section>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${theme.line}, transparent)`, marginBottom: 48 }} />

        {/* Colors */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: A.muted, letterSpacing: "0.15em", marginBottom: 20, textTransform: "uppercase" }}>02 — COLOR PALETTE</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            {[{ label: "BG", color: theme.bg }, { label: "CARD", color: theme.card }, { label: "CARD 2", color: theme.card2 }, { label: "ACCENT", color: theme.accent }, { label: "LINE", color: theme.line }, { label: "DANGER", color: theme.danger }].map((sw) => (
              <div key={sw.label} style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: sw.color, border: "1px solid #333", marginBottom: 6 }} />
                <div style={{ fontFamily: MONO, fontSize: 9, color: A.muted }}>{sw.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#555" }}>{sw.color}</div>
              </div>
            ))}
          </div>
          {/* Contrast checks in preview */}
          <ContrastBadge ratio={contrastRatio(theme.accent, theme.bg)} label="accent on bg" />
          <ContrastBadge ratio={contrastRatio(theme.accentText, theme.accent)} label="accentText on accent (button)" />
          <ContrastBadge ratio={contrastRatio("#ffffff", theme.bg)} label="white text on bg" />
        </section>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${theme.line}, transparent)`, marginBottom: 48 }} />

        {/* Components — Button variants */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: A.muted, letterSpacing: "0.15em", marginBottom: 20, textTransform: "uppercase" }}>03 — BUTTON VARIANTS</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            {/* Solid */}
            <div style={{ background: theme.accent, color: theme.accentText, fontWeight: 800, fontSize: 13, letterSpacing: "0.03em", padding: `${theme.btnPaddingY}px ${theme.btnPaddingX}px`, borderRadius: theme.btnRadius, fontFamily: AEONIK, boxShadow: theme.accentGlow ? `0 0 32px -2px ${theme.accent}66` : "none", cursor: "default", border: `${theme.btnBorderWidth}px solid transparent` }}>ĐĂNG KÝ NGAY</div>
            {/* Outline */}
            <div style={{ background: "transparent", color: theme.accent, fontWeight: 700, fontSize: 13, padding: `${theme.btnPaddingY - 2}px ${theme.btnPaddingX - 8}px`, borderRadius: theme.btnRadius, border: `2px solid ${theme.accent}`, fontFamily: AEONIK, cursor: "default" }}>Xem thêm</div>
            {/* Ghost */}
            <div style={{ background: "transparent", color: "#fff", fontWeight: 700, fontSize: 13, padding: `${theme.btnPaddingY}px ${theme.btnPaddingX}px`, borderRadius: theme.btnRadius, fontFamily: AEONIK, cursor: "default", opacity: 0.7 }}>Ghost</div>
          </div>
          {/* Card */}
          <div style={{ background: theme.card, border: `1px solid ${theme.line}`, borderRadius: theme.cardRadius, padding: "20px 18px" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: theme.accent, letterSpacing: "0.12em", marginBottom: 8 }}>LABEL BADGE</div>
            <div style={{ fontFamily: NOE, fontWeight: theme.h2Weight, fontSize: 18, marginBottom: 10 }}>Card Heading — radius {theme.cardRadius}px</div>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "#999" }}>Card sample với card radius {theme.cardRadius}px, button radius {theme.btnRadius}px.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN ───────────────────────────────────────────────
export default function Admin() {
  const [theme, setTheme] = useState<Theme>(() => deriveTextColors(PRESETS[0]));
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [tab, setTab] = useState<Tab>("themes");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [fonts, setFonts] = useState<FontGroup[]>([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [expandedContent, setExpandedContent] = useState<string | null>("hero");

  useEffect(() => {
    Promise.all([loadTheme(), loadContent()]).then(([t, c]) => {
      setTheme(t);
      setContent(c);
    });
  }, []);

  const loadFonts = useCallback(async () => {
    if (fonts.length > 0 || fontsLoading) return;
    setFontsLoading(true);
    try {
      const res = await fetch("/api/fonts");
      const data = await res.json() as { fonts: FontGroup[] };
      setFonts(data.fonts ?? []);
    } catch { setFonts([]); }
    finally { setFontsLoading(false); }
  }, [fonts.length, fontsLoading]);

  useEffect(() => { if (tab === "typography") loadFonts(); }, [tab, loadFonts]);

  const updateTheme = (patch: Partial<Theme>) => { setTheme((p) => ({ ...p, ...patch })); setStatus("idle"); };
  const updateContent = (patch: Partial<PageContent>) => { setContent((p) => ({ ...p, ...patch })); setStatus("idle"); };

  const handleSave = async () => {
    setStatus("saving");
    try {
      await Promise.all([saveTheme(theme), saveContent(content)]);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleDownload = () => {
    const data = { theme, content, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "typo-config.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "themes", label: `${PRESETS.length} Themes` },
    { id: "content", label: "Nội dung" },
    { id: "colors", label: "Màu sắc" },
    { id: "typography", label: "Chữ" },
    { id: "effects", label: "Hiệu ứng" },
  ];

  const toggleSection = (id: string) => setExpandedContent((p) => p === id ? null : id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: A.bg, color: A.text, fontFamily: AEONIK }}>

      {/* ─── HEADER ─── */}
      <header style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: `1px solid ${A.border}`, flexShrink: 0, background: A.panel }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: NOE, fontWeight: 900, fontSize: 18 }}>FEDU<span style={{ color: A.accent }}>.</span>DESIGN</div>
          <div style={{ width: 1, height: 20, background: A.border }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: A.muted, letterSpacing: "0.1em" }}>CMS ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/" style={{ fontFamily: MONO, fontSize: 11, color: A.muted, textDecoration: "none", padding: "6px 10px", border: `1px solid ${A.border}`, borderRadius: 6 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = A.muted; }}>
            ⟵ Trang chính
          </a>
          <a href="/editor" style={{ fontFamily: MONO, fontSize: 11, color: A.accent, textDecoration: "none", padding: "6px 12px", border: `1px solid ${A.accent}55`, borderRadius: 6, fontWeight: 700 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${A.accent}18`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}>
            ✏ Visual Editor
          </a>
          <button onClick={handleDownload} style={{ background: "transparent", border: `1px solid ${A.border}`, borderRadius: 6, padding: "6px 12px", color: A.muted, fontFamily: MONO, fontSize: 11, cursor: "pointer" }}
            title="Tải xuống config JSON">
            ⬇ Tải xuống
          </button>
          <button onClick={handleSave} style={{
            background: status === "saved" ? "#1a6b40" : A.accent, color: status === "saved" ? "#7effc0" : "#06181b",
            border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 800, fontSize: 13, fontFamily: AEONIK, cursor: "pointer", transition: "all 0.2s",
          }}>
            {status === "saved" ? "✓ Đã lưu" : "💾 Lưu & Áp dụng"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ─── LEFT PANEL ─── */}
        <aside style={{ width: 320, flexShrink: 0, background: A.panel, borderRight: `1px solid ${A.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${A.border}`, flexShrink: 0 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "9px 0", border: "none",
                background: tab === t.id ? A.card : "transparent",
                color: tab === t.id ? A.text : A.muted,
                fontFamily: MONO, fontSize: 9, cursor: "pointer",
                borderBottom: tab === t.id ? `2px solid ${A.accent}` : "2px solid transparent",
                fontWeight: tab === t.id ? 700 : 400, transition: "all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Tab content — scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>

            {/* ── THEMES TAB ── */}
            {tab === "themes" && (
              <div>
                <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 12, letterSpacing: "0.08em" }}>
                  CHỌN THEME — click để preview, Lưu để áp dụng
                </div>
                {/* Group by category */}
                <SectionTitle>ORIGINAL (7)</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {PRESETS.slice(0, 7).map((p) => (
                    <ThemeCard key={p.id} theme={p} isActive={theme.id === p.id} onClick={() => updateTheme({ ...p })} />
                  ))}
                </div>
                <SectionTitle>DESIGN SYSTEMS (5)</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {PRESETS.slice(7).map((p) => (
                    <ThemeCard key={p.id} theme={p} isActive={theme.id === p.id} onClick={() => updateTheme({ ...p })} />
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "10px 12px", background: A.card, borderRadius: 8, border: `1px solid ${A.border}` }}>
                  <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 4 }}>ACTIVE THEME</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>{theme.emoji} {theme.name}</div>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: MONO }}>{theme.tagline}</div>
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: "#444", fontFamily: MONO, textAlign: "center" }}>
                  Nhấn «Lưu & Áp dụng» để landing page phản ánh thay đổi
                </div>
              </div>
            )}

            {/* ── CONTENT TAB ── */}
            {tab === "content" && (
              <div>
                <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 12 }}>CHỈNH NỘI DUNG — thay đổi text trên trang</div>

                <Accordion title="💰 Giá & Nút CTA" defaultOpen={true}>
                  <FieldInput label="GIÁ" value={content.price} onChange={(v) => updateContent({ price: v })} hint="Ví dụ: 249.000" />
                  <FieldInput label="GIÁ TRỊ (strikethrough)" value={content.value} onChange={(v) => updateContent({ value: v })} />
                  <FieldInput label="BUTTON HERO CTA" value={content.heroCta} onChange={(v) => updateContent({ heroCta: v })} />
                  <FieldInput label="BUTTON GIỮA TRANG" value={content.midCta} onChange={(v) => updateContent({ midCta: v })} />
                  <FieldInput label="BUTTON BONUSES" value={content.bonusesCta} onChange={(v) => updateContent({ bonusesCta: v })} />
                  <FieldInput label="THANH KHẨN CẤP (dùng {PRICE})" value={content.urgencyBar} onChange={(v) => updateContent({ urgencyBar: v })} />
                  <FieldInput label="BẢO CHỨNG" value={content.guarantee} onChange={(v) => updateContent({ guarantee: v })} multiline />
                </Accordion>

                <Accordion title="🦸 Hero" defaultOpen={expandedContent === "hero"}>
                  <FieldInput label="BADGE TEXT" value={content.heroBadge} onChange={(v) => updateContent({ heroBadge: v })} />
                  <FieldInput label="HEADLINE DÒNG 1" value={content.heroHeadline1} onChange={(v) => updateContent({ heroHeadline1: v })} />
                  <FieldInput label="HEADLINE DÒNG 2" value={content.heroHeadline2} onChange={(v) => updateContent({ heroHeadline2: v })} />
                  <FieldInput label="DÒNG ACCENT (màu nổi bật)" value={content.heroAccentLine} onChange={(v) => updateContent({ heroAccentLine: v })} />
                  <FieldInput label="ĐOẠN MÔ TẢ" value={content.heroSub} onChange={(v) => updateContent({ heroSub: v })} multiline />
                </Accordion>

                <Accordion title="😫 Điểm đau">
                  <FieldInput label="LABEL" value={content.painLabel} onChange={(v) => updateContent({ painLabel: v })} />
                  <FieldInput label="TIÊU ĐỀ" value={content.painHeading} onChange={(v) => updateContent({ painHeading: v })} multiline />
                  <FieldInput label="BLOCKQUOTE" value={content.painBlockquote} onChange={(v) => updateContent({ painBlockquote: v })} />
                  <FieldInput label="ĐOẠN VĂN" value={content.painPara} onChange={(v) => updateContent({ painPara: v })} multiline />
                  <FieldInput label="TIÊU ĐỀ DANH SÁCH" value={content.painListHeading} onChange={(v) => updateContent({ painListHeading: v })} />
                  <ListEditor label="CÁC MỤC BẾ TẮC" items={content.painList} onChange={(v) => updateContent({ painList: v })} />
                </Accordion>

                <Accordion title="🔄 Vòng lặp thất bại">
                  <FieldInput label="LABEL" value={content.cycleLabel} onChange={(v) => updateContent({ cycleLabel: v })} />
                  <FieldInput label="TIÊU ĐỀ (dùng \n cho xuống dòng)" value={content.cycleHeading} onChange={(v) => updateContent({ cycleHeading: v })} multiline />
                  <FieldInput label="ĐOẠN VĂN" value={content.cyclePara} onChange={(v) => updateContent({ cyclePara: v })} />
                  <FieldInput label="KẾT LUẬN" value={content.cycleConclusion} onChange={(v) => updateContent({ cycleConclusion: v })} multiline />
                  <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>CÁC MỤC CỐ GẮNG (fail → why)</div>
                  {content.cycleItems.map((item, i) => (
                    <div key={i} style={{ background: "#0a0a0e", border: `1px solid ${A.border}`, borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
                      <FieldInput label={`[${i + 1}] Cố gắng`} value={item.fail} onChange={(v) => { const n = [...content.cycleItems]; n[i] = { ...n[i], fail: v }; updateContent({ cycleItems: n }); }} />
                      <FieldInput label="Kết quả" value={item.why} onChange={(v) => { const n = [...content.cycleItems]; n[i] = { ...n[i], why: v }; updateContent({ cycleItems: n }); }} />
                    </div>
                  ))}
                </Accordion>

                <Accordion title="💡 Giải pháp">
                  <FieldInput label="LABEL" value={content.solutionLabel} onChange={(v) => updateContent({ solutionLabel: v })} />
                  <FieldInput label="TIÊU ĐỀ" value={content.solutionHeading} onChange={(v) => updateContent({ solutionHeading: v })} multiline />
                  <FieldInput label="MÔ TẢ" value={content.solutionSub} onChange={(v) => updateContent({ solutionSub: v })} multiline />
                  <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>LỢI ÍCH (title → mô tả)</div>
                  {content.benefits.map((b, i) => (
                    <div key={i} style={{ background: "#0a0a0e", border: `1px solid ${A.border}`, borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
                      <FieldInput label="Tiêu đề" value={b.title} onChange={(v) => { const n = [...content.benefits]; n[i] = { ...n[i], title: v }; updateContent({ benefits: n }); }} />
                      <FieldInput label="Mô tả" value={b.desc} onChange={(v) => { const n = [...content.benefits]; n[i] = { ...n[i], desc: v }; updateContent({ benefits: n }); }} />
                    </div>
                  ))}
                </Accordion>

                <Accordion title="🛠 4 Kỹ năng">
                  <FieldInput label="LABEL" value={content.skillsLabel} onChange={(v) => updateContent({ skillsLabel: v })} />
                  <FieldInput label="TIÊU ĐỀ" value={content.skillsHeading} onChange={(v) => updateContent({ skillsHeading: v })} multiline />
                  {content.skillCards.map((s, i) => (
                    <div key={i} style={{ background: "#0a0a0e", border: `1px solid ${A.border}`, borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
                      <FieldInput label={`[${s.n}] Tên kỹ năng`} value={s.title} onChange={(v) => { const n = [...content.skillCards]; n[i] = { ...n[i], title: v }; updateContent({ skillCards: n }); }} />
                      <FieldInput label="Mô tả" value={s.desc} onChange={(v) => { const n = [...content.skillCards]; n[i] = { ...n[i], desc: v }; updateContent({ skillCards: n }); }} />
                      <FieldInput label="Cảnh báo (đỏ)" value={s.warn} onChange={(v) => { const n = [...content.skillCards]; n[i] = { ...n[i], warn: v }; updateContent({ skillCards: n }); }} />
                    </div>
                  ))}
                </Accordion>

                <Accordion title="🎁 Quà tặng & Bonus">
                  <FieldInput label="LABEL" value={content.bonusesLabel} onChange={(v) => updateContent({ bonusesLabel: v })} />
                  <FieldInput label="TIÊU ĐỀ" value={content.bonusesHeading} onChange={(v) => updateContent({ bonusesHeading: v })} multiline />
                  <FieldInput label="TIÊU ĐỀ BONUS" value={content.bonusesTitle} onChange={(v) => updateContent({ bonusesTitle: v })} />
                  {content.bonuses.map((b, i) => (
                    <div key={i} style={{ background: "#0a0a0e", border: `1px solid ${A.border}`, borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
                      <FieldInput label={`[${i + 1}] Tên bonus`} value={b.title} onChange={(v) => { const n = [...content.bonuses]; n[i] = { ...n[i], title: v }; updateContent({ bonuses: n }); }} />
                      <FieldInput label="Mô tả" value={b.desc} onChange={(v) => { const n = [...content.bonuses]; n[i] = { ...n[i], desc: v }; updateContent({ bonuses: n }); }} multiline />
                    </div>
                  ))}
                </Accordion>

                <Accordion title="📈 Trước & Sau">
                  <FieldInput label="LABEL TRƯỚC" value={content.beforeLabel} onChange={(v) => updateContent({ beforeLabel: v })} />
                  <ListEditor label="CÁC MỤC TRƯỚC" items={content.beforeItems} onChange={(v) => updateContent({ beforeItems: v })} />
                  <FieldInput label="LABEL SAU" value={content.afterLabel} onChange={(v) => updateContent({ afterLabel: v })} />
                  <ListEditor label="CÁC MỤC SAU" items={content.afterItems} onChange={(v) => updateContent({ afterItems: v })} />
                </Accordion>

                <Accordion title="🗺 Lộ trình (6 chặng)">
                  {content.stages.map((s, i) => (
                    <div key={i} style={{ background: "#0a0a0e", border: `1px solid ${A.border}`, borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
                      <FieldInput label={`${s.n} — Tên chặng`} value={s.title} onChange={(v) => { const n = [...content.stages]; n[i] = { ...n[i], title: v }; updateContent({ stages: n }); }} />
                      <FieldInput label="Chương" value={s.sub} onChange={(v) => { const n = [...content.stages]; n[i] = { ...n[i], sub: v }; updateContent({ stages: n }); }} />
                      <FieldInput label="Mô tả" value={s.desc} onChange={(v) => { const n = [...content.stages]; n[i] = { ...n[i], desc: v }; updateContent({ stages: n }); }} multiline />
                    </div>
                  ))}
                </Accordion>

                <Accordion title="👨‍🏫 Giảng viên">
                  <FieldInput label="TÊN" value={content.instructorName} onChange={(v) => updateContent({ instructorName: v })} />
                  <FieldInput label="VIẾT TẮT (hiển thị avatar)" value={content.instructorInitials} onChange={(v) => updateContent({ instructorInitials: v })} />
                  <FieldInput label="CHỨC DANH" value={content.instructorTitle} onChange={(v) => updateContent({ instructorTitle: v })} />
                  <ListEditor label="BIO (từng dòng)" items={content.instructorBio} onChange={(v) => updateContent({ instructorBio: v })} />
                </Accordion>

                <Accordion title="📌 Footer">
                  <FieldInput label="BRAND NAME" value={content.footerBrand} onChange={(v) => updateContent({ footerBrand: v })} />
                  <FieldInput label="DOT SEPARATOR" value={content.footerDot} onChange={(v) => updateContent({ footerDot: v })} />
                  <FieldInput label="TAGLINE" value={content.footerTagline} onChange={(v) => updateContent({ footerTagline: v })} />
                  <FieldInput label="COPYRIGHT" value={content.footerCopyright} onChange={(v) => updateContent({ footerCopyright: v })} />
                  <ListEditor label="LINKS" items={content.footerLinks} onChange={(v) => updateContent({ footerLinks: v })} />
                </Accordion>

                <div style={{ marginTop: 16, padding: "10px 12px", background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 8, fontSize: 10, color: "#4adf84", fontFamily: MONO }}>
                  💡 Nhấn «Lưu & Áp dụng» để áp dụng thay đổi lên trang chính
                </div>
              </div>
            )}

            {/* ── COLORS TAB ── */}
            {tab === "colors" && (
              <div>
                <div style={{ fontSize: 11, color: A.muted, fontFamily: MONO, marginBottom: 12, letterSpacing: "0.08em" }}>TINH CHỈNH MÀU SẮC</div>
                <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Swatch color={theme.accent} size={12} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: A.text }}>{theme.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: A.muted, marginLeft: "auto" }}>{theme.id}</span>
                </div>

                <SectionTitle>WCAG CONTRAST CHECK</SectionTitle>
                <ContrastBadge ratio={contrastRatio(theme.accent, theme.bg)} label="accent on bg" />
                <ContrastBadge ratio={contrastRatio(theme.accentText, theme.accent)} label="btn text on btn bg" />
                <ContrastBadge ratio={contrastRatio("#ffffff", theme.bg)} label="white text on bg" />
                <div style={{ fontSize: 9, color: "#555", fontFamily: MONO, marginBottom: 14 }}>
                  AA = 4.5:1 · AAA = 7:1 (WCAG 2.1)
                </div>

                <SectionTitle>CORE COLORS</SectionTitle>
                <ColorRow label="--accent" value={theme.accent} bg={theme.bg} onChange={(v) => updateTheme({ accent: v })} />
                <ColorRow label="--accent-text" value={theme.accentText} bg={theme.accent} onChange={(v) => updateTheme({ accentText: v })} />
                <ColorRow label="--bg" value={theme.bg} onChange={(v) => updateTheme({ bg: v })} />
                <ColorRow label="--card" value={theme.card} onChange={(v) => updateTheme({ card: v })} />
                <ColorRow label="--card2" value={theme.card2} onChange={(v) => updateTheme({ card2: v })} />
                <ColorRow label="--line" value={theme.line} onChange={(v) => updateTheme({ line: v })} />
                <SectionTitle>FEEDBACK</SectionTitle>
                <ColorRow label="--danger" value={theme.danger} onChange={(v) => updateTheme({ danger: v })} />
              </div>
            )}

            {/* ── TYPOGRAPHY TAB ── */}
            {tab === "typography" && (
              <div>
                <div style={{ fontSize: 11, color: A.muted, fontFamily: MONO, marginBottom: 12 }}>FONT & TYPE SCALE</div>

                {/* Font Scanner */}
                <SectionTitle>FONT FAMILIES</SectionTitle>
                {fontsLoading && <div style={{ fontSize: 11, color: A.muted, fontFamily: MONO, marginBottom: 12 }}>⏳ Đang quét font...</div>}
                {!fontsLoading && fonts.length === 0 && (
                  <div style={{ fontSize: 10, color: "#555", fontFamily: MONO, marginBottom: 12, padding: "8px 10px", background: "#111", borderRadius: 6 }}>
                    Không tìm thấy font. Upload .ttf/.otf/.woff2 vào /public/fonts/ để thêm.
                  </div>
                )}
                {fonts.length > 0 && (
                  <>
                    {[
                      { label: "Display / Heading", key: "fontDisplay" as const, current: theme.fontDisplay },
                      { label: "Body", key: "fontBody" as const, current: theme.fontBody },
                      { label: "Monospace", key: "fontMono" as const, current: theme.fontMono },
                      { label: "Accent / Quote", key: "fontAccent" as const, current: theme.fontAccent },
                    ].map(({ label, key, current }) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 6 }}>{label}</div>
                        <select value={current} onChange={(e) => updateTheme({ [key]: e.target.value })}
                          style={{ width: "100%", background: A.card, border: `1px solid ${A.border}`, borderRadius: 6, color: A.text, padding: "7px 10px", fontSize: 12, fontFamily: AEONIK, outline: "none" }}>
                          <option value={current}>{current.split("'")[1] ?? current} (hiện tại)</option>
                          {fonts.map((f) => (
                            <option key={f.family} value={`'${f.family}', sans-serif`}>{f.family}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <button onClick={loadFonts} style={{ width: "100%", padding: "6px", background: "transparent", border: `1px dashed ${A.border}`, borderRadius: 6, color: A.muted, cursor: "pointer", fontFamily: MONO, fontSize: 10, marginBottom: 12 }}>
                      🔄 Quét lại font
                    </button>
                  </>
                )}

                <SectionTitle>BLOCKQUOTE / TRÍCH DẪN</SectionTitle>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 6 }}>Font chữ</div>
                  <select
                    value={theme.blockquoteFontFamily ?? theme.fontAccent}
                    onChange={(e) => updateTheme({ blockquoteFontFamily: e.target.value })}
                    style={{ width: "100%", background: A.card, border: `1px solid ${A.border}`, borderRadius: 6, color: A.text, padding: "7px 10px", fontSize: 12, fontFamily: AEONIK, outline: "none" }}>
                    <option value={theme.fontAccent}>Accent / Quote (mặc định)</option>
                    <option value={theme.fontDisplay}>Display / Heading</option>
                    <option value={theme.fontBody}>Body</option>
                    <option value={theme.fontMono}>Monospace</option>
                    {fonts.map((f) => (
                      <option key={f.family} value={`'${f.family}', sans-serif`}>{f.family} (custom)</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: A.muted, fontFamily: MONO, marginBottom: 6 }}>Cỡ chữ</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["clamp(15px, 2vw, 18px)", "clamp(18px, 2.5vw, 24px)", "clamp(20px, 2.8vw, 28px)", "clamp(22px, 3vw, 32px)"].map((sz) => {
                      const active = (theme.blockquoteFontSize ?? "clamp(18px, 2.5vw, 24px)") === sz;
                      return (
                        <button key={sz} onClick={() => updateTheme({ blockquoteFontSize: sz })}
                          style={{ flex: 1, padding: "4px 2px", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: MONO, fontSize: 9, background: active ? A.accent : A.card, color: active ? "#06181b" : A.muted }}>
                          {sz.match(/(\d+px)$/)?.[1]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <RadioRow label="Kiểu" options={[{ v: "italic", label: "Nghiêng" }, { v: "normal", label: "Thẳng" }]}
                  value={theme.blockquoteFontStyle ?? "italic"}
                  onChange={(v) => updateTheme({ blockquoteFontStyle: v })} />
                <RadioRow label="Độ đậm" options={[{ v: "300", label: "Light" }, { v: "400", label: "Normal" }, { v: "700", label: "Bold" }]}
                  value={String(theme.blockquoteFontWeight ?? 400)}
                  onChange={(v) => updateTheme({ blockquoteFontWeight: Number(v) })} />

                <SectionTitle>TYPE SCALE SYSTEM</SectionTitle>
                <SliderRow label="Base size" value={theme.typeScaleBase} min={12} max={24} unit="px" onChange={(v) => updateTheme({ typeScaleBase: v })} />
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>Tỷ lệ (ratio)</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {[
                      { label: "1.2", name: "Minor 3rd", value: 1.2 },
                      { label: "1.25", name: "Major 3rd", value: 1.25 },
                      { label: "1.33", name: "Perfect 4th", value: 1.333 },
                      { label: "1.5", name: "Perfect 5th", value: 1.5 },
                      { label: "1.618", name: "Golden", value: 1.618 },
                    ].map((r) => (
                      <button key={r.value} onClick={() => updateTheme({ typeScaleRatio: r.value })}
                        title={r.name}
                        style={{
                          padding: "5px 8px", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: MONO, fontSize: 10,
                          background: Math.abs(theme.typeScaleRatio - r.value) < 0.001 ? A.accent : A.card,
                          color: Math.abs(theme.typeScaleRatio - r.value) < 0.001 ? "#06181b" : A.muted,
                        }}>{r.label}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: "#555", fontFamily: MONO, marginTop: 6 }}>
                    Scale: {Object.entries(computeTypeScale(theme.typeScaleBase, theme.typeScaleRatio)).map(([n, s]) => `${n}:${s}px`).join(" · ")}
                  </div>
                </div>

                <SectionTitle>WEIGHTS & SIZES</SectionTitle>
                <RadioRow label="Hero weight" options={[{ v: "700", label: "Bold 700" }, { v: "900", label: "Black 900" }]} value={String(theme.heroWeight)} onChange={(v) => updateTheme({ heroWeight: parseInt(v) as 700 | 900 })} />
                <RadioRow label="H2 weight" options={[{ v: "700", label: "Bold 700" }, { v: "900", label: "Black 900" }]} value={String(theme.h2Weight)} onChange={(v) => updateTheme({ h2Weight: parseInt(v) as 700 | 900 })} />
                <RadioRow label="Hero transform" options={[{ v: "none", label: "Normal" }, { v: "uppercase", label: "CAPS" }]} value={theme.heroTransform} onChange={(v) => updateTheme({ heroTransform: v as "none" | "uppercase" })} />

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>Hero font size</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["clamp(30px, 5.5vw, 60px)", "clamp(32px, 5.8vw, 64px)", "clamp(34px, 6.2vw, 68px)", "clamp(38px, 7vw, 80px)"].map((v) => (
                      <button key={v} onClick={() => updateTheme({ heroFontSize: v })}
                        style={{ flex: 1, padding: "5px 2px", border: "none", borderRadius: 5, background: theme.heroFontSize === v ? A.accent : A.card, color: theme.heroFontSize === v ? "#06181b" : A.muted, fontFamily: MONO, fontSize: 9, cursor: "pointer" }}>
                        {v.match(/(\d+px)$/)?.[1]}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>H2 font size</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["clamp(22px, 3.5vw, 36px)", "clamp(24px, 3.8vw, 40px)", "clamp(26px, 4vw, 44px)", "clamp(28px, 4.5vw, 50px)"].map((v) => (
                      <button key={v} onClick={() => updateTheme({ h2FontSize: v })}
                        style={{ flex: 1, padding: "5px 2px", border: "none", borderRadius: 5, background: theme.h2FontSize === v ? A.accent : A.card, color: theme.h2FontSize === v ? "#06181b" : A.muted, fontFamily: MONO, fontSize: 9, cursor: "pointer" }}>
                        {v.match(/(\d+px)$/)?.[1]}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>Body font size</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["14px", "15px", "16px", "17px", "18px"].map((v) => (
                      <button key={v} onClick={() => updateTheme({ bodyFontSize: v })}
                        style={{ flex: 1, padding: "5px 2px", border: "none", borderRadius: 5, background: theme.bodyFontSize === v ? A.accent : A.card, color: theme.bodyFontSize === v ? "#06181b" : A.muted, fontFamily: MONO, fontSize: 10, cursor: "pointer" }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <SliderRow label="Body line height" value={theme.bodyLineHeight} min={1.3} max={2.2} step={0.05} onChange={(v) => updateTheme({ bodyLineHeight: v })} />
                <SliderRow label="Hero letter-spacing" value={parseFloat(theme.heroLetterSpacing) || 0} min={-0.05} max={0.1} step={0.005} unit="em" onChange={(v) => updateTheme({ heroLetterSpacing: `${v}em` })} />
              </div>
            )}

            {/* ── EFFECTS TAB ── */}
            {tab === "effects" && (
              <div>
                <div style={{ fontSize: 11, color: A.muted, fontFamily: MONO, marginBottom: 12 }}>BUTTON & CARD CONTROLS</div>

                <SectionTitle>BUTTON STYLE</SectionTitle>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: A.muted, fontFamily: MONO, marginBottom: 8 }}>Kiểu nút</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[
                      { v: "solid", label: "■ Đặc" },
                      { v: "outline", label: "□ Viền" },
                      { v: "ghost", label: "◌ Trong" },
                    ].map((o) => (
                      <button key={o.v} onClick={() => updateTheme({ btnVariant: o.v as Theme["btnVariant"] })}
                        style={{ flex: 1, padding: "8px 4px", borderRadius: 6, border: "none", background: theme.btnVariant === o.v ? A.accent : A.card, color: theme.btnVariant === o.v ? "#06181b" : A.muted, fontFamily: MONO, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <SliderRow label="Border radius" value={theme.btnRadius} min={0} max={32} unit="px" onChange={(v) => updateTheme({ btnRadius: v })} />
                <SliderRow label="Border width" value={theme.btnBorderWidth} min={0} max={4} unit="px" onChange={(v) => updateTheme({ btnBorderWidth: v })} />
                <SliderRow label="Padding ngang" value={theme.btnPaddingX} min={12} max={60} unit="px" onChange={(v) => updateTheme({ btnPaddingX: v })} />
                <SliderRow label="Padding dọc" value={theme.btnPaddingY} min={6} max={28} unit="px" onChange={(v) => updateTheme({ btnPaddingY: v })} />

                {/* Live button preview */}
                <div style={{ padding: "16px", background: "#111", borderRadius: 10, marginBottom: 14, textAlign: "center" }}>
                  <div style={{
                    display: "inline-block",
                    background: theme.btnVariant === "solid" ? theme.accent : "transparent",
                    color: theme.btnVariant === "solid" ? theme.accentText : theme.accent,
                    border: theme.btnVariant !== "ghost" ? `${Math.max(theme.btnBorderWidth, theme.btnVariant === "outline" ? 2 : 0)}px solid ${theme.accent}` : "none",
                    padding: `${theme.btnPaddingY}px ${theme.btnPaddingX}px`,
                    borderRadius: theme.btnRadius,
                    fontWeight: 800, fontSize: 13, fontFamily: AEONIK, cursor: "default",
                    letterSpacing: "0.03em",
                    boxShadow: theme.accentGlow ? `0 0 24px -4px ${theme.accent}88` : "none",
                  }}>
                    XEM TRƯỚC NÚT
                  </div>
                </div>

                <button onClick={() => {
                  const preset = PRESETS.find((p) => p.id === theme.id) ?? PRESETS[0];
                  updateTheme({ btnRadius: preset.btnRadius, btnBorderWidth: preset.btnBorderWidth, btnPaddingX: preset.btnPaddingX, btnPaddingY: preset.btnPaddingY, btnVariant: preset.btnVariant });
                }} style={{ width: "100%", padding: "7px", background: "transparent", border: `1px solid ${A.border}`, borderRadius: 6, color: A.muted, cursor: "pointer", fontFamily: MONO, fontSize: 10, marginBottom: 16 }}>
                  ↺ Reset về giá trị mặc định của theme
                </button>

                <SectionTitle>CARD & GLOW</SectionTitle>
                <SliderRow label="Card border radius" value={theme.cardRadius} min={0} max={32} unit="px" onChange={(v) => updateTheme({ cardRadius: v })} />
                <ToggleRow label="Accent glow effect" value={theme.accentGlow} onChange={(v) => updateTheme({ accentGlow: v })} />
              </div>
            )}

          </div>
        </aside>

        {/* ─── RIGHT: LIVE PREVIEW ─── */}
        <main style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ height: 40, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: `1px solid ${A.border}`, background: A.panel, fontSize: 10, fontFamily: MONO, gap: 8, color: A.muted }}>
            <span style={{ color: theme.accent }}>●</span>
            LIVE PREVIEW
            <span style={{ color: "#333", marginLeft: 4 }}>— {theme.name} · {theme.emoji} {theme.tagline}</span>
          </div>
          <div style={{ height: "calc(100% - 40px)", overflow: "hidden" }}>
            <LivePreview theme={theme} />
          </div>
        </main>

      </div>
    </div>
  );
}
