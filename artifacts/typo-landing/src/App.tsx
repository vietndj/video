import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme";
import { useContent } from "./content";

// ─── Font stacks (theme-driven via t.fontDisplay etc.) ───
const NOE = "'Noe Display', Georgia, serif";
const SECTRA = "'GT Sectra', Georgia, serif";
const AEONIK = "'Aeonik', 'Inter', sans-serif";
const MONO = "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace";

// ─── Intersection observer hook ───
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Render multi-line text (splits on \n) ───
function NL({ str }: { str: string }) {
  return (
    <>
      {str.split("\n").map((p, i) => (
        <span key={i}>{i > 0 && <br />}{p}</span>
      ))}
    </>
  );
}

// ─── Countdown Timer ───
function Countdown() {
  const t = useTheme();
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 });
  useEffect(() => {
    const dayStart = Math.floor(Date.now() / 86400000) * 86400000;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - dayStart) / 1000) % 86400;
      const remaining = 86400 - elapsed;
      setTime({ h: Math.floor(remaining / 3600), m: Math.floor((remaining % 3600) / 60), s: remaining % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
      {[{ v: pad(time.h), l: "GIỜ" }, { v: pad(time.m), l: "PHÚT" }, { v: pad(time.s), l: "GIÂY" }].map(({ v, l }, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ background: "#161a1b", border: `1px solid ${t.accent}33`, borderRadius: 10, padding: "10px 18px", minWidth: 64, textAlign: "center", boxShadow: `0 0 22px -8px ${t.accent}` }}>
            <span style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: t.accent }}>{v}</span>
          </div>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "#666", fontFamily: MONO }}>{l}</span>
        </div>
      )).reduce((acc, el, i) => i < 2 ? [...acc, el, <span key={`sep${i}`} style={{ fontSize: 28, fontWeight: 800, color: t.accent, marginTop: -18 }}>:</span>] : [...acc, el], [] as React.ReactNode[])}
    </div>
  );
}

// ─── CTA Button ───
function CtaButton({ label }: { label: string }) {
  const t = useTheme();
  const [hover, setHover] = useState(false);
  const isOutline = t.btnVariant === "outline";
  const isGhost = t.btnVariant === "ghost";
  return (
    <a
      href="#dang-ky"
      onClick={(e) => { e.preventDefault(); document.getElementById("dang-ky")?.scrollIntoView({ behavior: "smooth" }); }}
      style={{
        display: "inline-block",
        background: isOutline || isGhost ? "transparent" : t.accent,
        color: isOutline ? t.accent : isGhost ? "#fff" : t.accentText,
        border: isOutline ? `${t.btnBorderWidth || 2}px solid ${t.accent}` : isGhost ? "none" : t.btnBorderWidth ? `${t.btnBorderWidth}px solid ${t.accent}` : "none",
        fontWeight: 800,
        fontSize: 16,
        letterSpacing: "0.03em",
        padding: `${t.btnPaddingY}px ${t.btnPaddingX}px`,
        borderRadius: t.btnRadius,
        textDecoration: "none",
        boxShadow: hover && t.accentGlow ? `0 0 56px 4px ${t.accent}88` : t.accentGlow ? `0 0 32px -2px ${t.accent}66` : "none",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        cursor: "pointer",
        textAlign: "center",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </a>
  );
}

// ─── Scarcity line ───
function Scarcity() {
  const c = useContent();
  const t = useTheme();
  return (
    <p style={{ fontSize: 13, color: t.danger, fontWeight: 700, marginTop: 14, letterSpacing: "0.03em" }}>
      🔥 Ưu đãi đặc quyền — chỉ còn {c.price} VNĐ
    </p>
  );
}

// ─── Section wrapper ───
function Sec({ children, style = {}, maxWidth = 820 }: { children: React.ReactNode; style?: React.CSSProperties; maxWidth?: number }) {
  return (
    <section style={{ maxWidth, margin: "0 auto", padding: "84px 20px 0", ...style }}>
      {children}
    </section>
  );
}

// ─── Mono label badge ───
function Label({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", color: t.accent, textTransform: "uppercase", marginBottom: 16, fontFamily: t.fontMono }}>
      <span style={{ opacity: 0.5 }}>// </span>{children}
    </div>
  );
}

// ─── Section heading ───
function SH({ children, center = true }: { children: React.ReactNode; center?: boolean }) {
  const t = useTheme();
  return (
    <h2 style={{
      fontFamily: t.fontDisplay,
      fontSize: t.h2FontSize,
      fontWeight: t.h2Weight,
      lineHeight: 1.18,
      margin: "0 0 28px",
      color: t.textBase ?? "#f0f0f0",
      textAlign: center ? "center" : "left",
      letterSpacing: "-0.01em",
    }}>
      {children}
    </h2>
  );
}

// ─── Check list item ───
function Check({ children, icon = "›", color: colorProp }: { children: React.ReactNode; icon?: string; color?: string }) {
  const t = useTheme();
  const color = colorProp ?? t.accent;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
      <span style={{ color, fontWeight: 700, flexShrink: 0, marginTop: 1, fontFamily: t.fontMono }}>{icon}</span>
      <span style={{ fontSize: 15, lineHeight: 1.7, color: t.textBody ?? "#bdbdbd" }}>{children}</span>
    </div>
  );
}

// ─── Divider ───
function Div() {
  const t = useTheme();
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.line}, transparent)`, margin: "72px 0 0" }} />;
}

// ─── YouTube embed for landing page ───
function AppYTEmbed({ url, caption }: { url: string; caption?: string }) {
  const ytId = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/
  )?.[1];
  if (!ytId) return null;
  return (
    <>
      <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, background: "#000" }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>
      {caption && <p style={{ fontSize: 13, color: "#666", textAlign: "center", padding: "10px 20px", fontStyle: "italic", fontFamily: MONO }}>{caption}</p>}
    </>
  );
}

// ─── Renders editor-inserted media for a block ───
function MediaSection({ blockId }: { blockId: string }) {
  const c = useContent();
  const t = useTheme();
  const media = c.blocksMeta?.media ?? {};
  const items = media[blockId] ?? [];
  if (!items.length) return null;
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 0" }}>
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: 20, borderRadius: t.cardRadius, overflow: "hidden", border: `1px solid ${t.line}` }}>
          {item.type === "image" && (
            <>
              <img src={item.url} alt={item.caption || ""}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                style={{ width: item.fit === "half" ? "50%" : "100%", display: "block", maxHeight: 520, objectFit: "cover" }} />
              {item.caption && <p style={{ fontSize: 13, color: "#666", textAlign: "center", padding: "10px 20px", fontStyle: "italic", fontFamily: MONO }}>{item.caption}</p>}
            </>
          )}
          {item.type === "youtube" && <AppYTEmbed url={item.url} caption={item.caption} />}
        </div>
      ))}
    </div>
  );
}

// ─── Price block ───
function PriceBlock() {
  const t = useTheme();
  const c = useContent();
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 14, color: "#666", textDecoration: "line-through", fontFamily: MONO }}>Giá trị thực: {c.value} VNĐ</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "clamp(40px, 7vw, 60px)", fontWeight: 900, color: t.textBase ?? "#fff", fontFamily: t.fontMono, lineHeight: 1 }}>{c.price}</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.accent }}>VNĐ</span>
      </div>
    </div>
  );
}

// ─── Registration Form ───
function RegForm() {
  const t = useTheme();
  const c = useContent();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const currentUrl = window.location.href;
    const customerData = { name: form.name, phone: form.phone, email: form.email, url: currentUrl };
    localStorage.setItem("typo_customer", JSON.stringify(customerData));
    try {
      const res = await fetch("/api/lead/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      const data = await res.json() as { rowIndex?: number };
      if (data.rowIndex) localStorage.setItem("typo_row", data.rowIndex.toString());
    } catch { /* silent */ }
    window.location.href = "/checkout";
  };

  return (
    <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[
        { name: "name", label: "Họ và tên *", type: "text", placeholder: "Nguyễn Văn A" },
        { name: "phone", label: "Số điện thoại *", type: "tel", placeholder: "0912 345 678" },
        { name: "email", label: "Email (nhận tài liệu)", type: "email", placeholder: "email@gmail.com" },
      ].map((f) => (
        <div key={f.name}>
          <label htmlFor={`reg-${f.name}`} style={{ display: "block", fontSize: 13, fontWeight: 600, color: t.textMuted ?? "#999", marginBottom: 8 }}>{f.label}</label>
          <input
            id={`reg-${f.name}`}
            name={f.name}
            type={f.type}
            placeholder={f.placeholder}
            required={f.name !== "email"}
            value={form[f.name as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            style={{
              width: "100%", background: "#0a0a0c",
              border: `1px solid ${t.line}`, borderRadius: t.btnRadius,
              padding: "14px 18px", color: "#fff", fontSize: 15,
              outline: "none", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = t.accent; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = t.line; }}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? "#0a5560" : t.accentGlow ? t.accent : t.accent,
          color: t.accentText,
          border: "none",
          borderRadius: t.btnRadius,
          padding: `${t.btnPaddingY}px ${t.btnPaddingX}px`,
          fontSize: 16,
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.03em",
          boxShadow: loading ? "none" : t.accentGlow ? `0 0 32px -2px ${t.accent}66` : "none",
          marginTop: 8,
          opacity: loading ? 0.7 : 1,
          transition: "all 0.2s",
        }}
      >
        {loading ? "⏳ ĐANG XỬ LÝ..." : `🔒 ${c.heroCta}`}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, color: "#666", fontStyle: "italic", marginTop: 4 }}>
        Thanh toán 1 lần — Truy cập trọn đời
      </p>
    </form>
  );
}

// ─── Unified SVG Icon System ─────────────────────────────────────
const ICON_CSS = `
@keyframes ic-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes ic-pulse{0%,100%{opacity:.5;transform:scale(.88)}50%{opacity:1;transform:scale(1)}}
@keyframes ic-scan{0%,100%{transform:translateY(-9px)}50%{transform:translateY(9px)}}
`;
let _icCssInjected = false;
function injectIconKf() {
  if (_icCssInjected) return; _icCssInjected = true;
  const s = document.createElement("style"); s.textContent = ICON_CSS; document.head.appendChild(s);
}

function IcBox({ size = 40, float: fl = true, pulse = false, children }: {
  size?: number; float?: boolean; pulse?: boolean; children: React.ReactNode;
}) {
  injectIconKf();
  const anim = pulse
    ? "ic-pulse 2.6s ease-in-out infinite"
    : fl ? "ic-float 3.2s ease-in-out infinite"
    : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: anim, display: "block", overflow: "visible" }}>
      {children}
    </svg>
  );
}

function IconBook({ accent: c }: { accent: string }) {
  return (
    <IcBox>
      <line x1="20" y1="8" x2="20" y2="34" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 10 C14 10 8 12 8 15 L8 34 C8 31 14 29 20 29 Z" fill={`${c}18`} stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M20 10 C26 10 32 12 32 15 L32 34 C32 31 26 29 20 29 Z" fill={`${c}0d`} stroke={`${c}99`} strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="11" y1="17" x2="18" y2="16.5" stroke={`${c}88`} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="20.5" x2="18" y2="20" stroke={`${c}66`} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="24" x2="17" y2="23.5" stroke={`${c}44`} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20" cy="8" r="2" fill={c} style={{ filter: `drop-shadow(0 0 4px ${c})` }}/>
    </IcBox>
  );
}

function IconVideo({ accent: c }: { accent: string }) {
  return (
    <IcBox>
      <rect x="4" y="7" width="32" height="22" rx="3" stroke={c} strokeWidth="1.8" fill={`${c}10`}/>
      <line x1="20" y1="29" x2="20" y2="35" stroke={`${c}88`} strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="35" x2="26" y2="35" stroke={`${c}88`} strokeWidth="2" strokeLinecap="round"/>
      <polygon points="16,13 16,25 28,19" fill={c} style={{ filter: `drop-shadow(0 0 5px ${c})` }}/>
      <circle cx="32" cy="10" r="1.5" fill={`${c}66`}/>
    </IcBox>
  );
}

function IconMap({ accent: c }: { accent: string }) {
  return (
    <IcBox float={false} pulse>
      <path d="M8 32 Q12 20 20 18 Q28 16 32 8" stroke={`${c}55`} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
      <circle cx="8" cy="32" r="3" fill={`${c}33`} stroke={c} strokeWidth="1.8"/>
      <circle cx="20" cy="18" r="3" fill={`${c}55`} stroke={c} strokeWidth="1.8"/>
      <circle cx="32" cy="8" r="4.5" fill={`${c}22`} stroke={c} strokeWidth="1.8" style={{ filter: `drop-shadow(0 0 6px ${c}88)` }}/>
      <circle cx="32" cy="8" r="2" fill={c}/>
    </IcBox>
  );
}

function IconClipboard({ accent: c }: { accent: string }) {
  return (
    <IcBox>
      <rect x="15" y="5" width="10" height="6" rx="2" fill={`${c}66`} stroke={c} strokeWidth="1.8"/>
      <rect x="8" y="9" width="24" height="28" rx="3" fill={`${c}0d`} stroke={c} strokeWidth="1.8"/>
      <line x1="13" y1="18" x2="27" y2="18" stroke={`${c}99`} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="13" y1="23" x2="24" y2="23" stroke={`${c}66`} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="13" y1="28" x2="26" y2="28" stroke={`${c}44`} strokeWidth="1.8" strokeLinecap="round"/>
    </IcBox>
  );
}

function IconCheck({ accent: c }: { accent: string }) {
  return (
    <IcBox float={false} pulse>
      <circle cx="20" cy="20" r="13" fill={`${c}12`} stroke={c} strokeWidth="1.8" style={{ filter: `drop-shadow(0 0 8px ${c}55)` }}/>
      <polyline points="13,20 18,26 28,14" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </IcBox>
  );
}

function IconSpeech({ accent: c }: { accent: string }) {
  return (
    <IcBox>
      <rect x="5" y="5" width="28" height="22" rx="5" fill={`${c}10`} stroke={c} strokeWidth="1.8"/>
      <path d="M10 27 L7 35 L18 29" fill={`${c}22`} stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      {[12, 20, 28].map(x => <circle key={x} cx={x} cy="16" r="2" fill={`${c}99`}/>)}
    </IcBox>
  );
}

function IconPhone({ accent: c }: { accent: string }) {
  return (
    <IcBox>
      <rect x="11" y="3" width="18" height="34" rx="4" fill={`${c}0d`} stroke={c} strokeWidth="1.8"/>
      <rect x="14" y="8" width="12" height="20" rx="2" fill={`${c}18`}/>
      <line x1="15" y1="18" x2="25" y2="18" stroke={c} strokeWidth="1.5" strokeLinecap="round"
        style={{ animation: "ic-scan 2s ease-in-out infinite", transformOrigin: "20px 18px" }}/>
      <circle cx="20" cy="33" r="2" stroke={`${c}88`} strokeWidth="1.5"/>
      <rect x="17" y="5.5" width="6" height="2" rx="1" fill={`${c}55`}/>
    </IcBox>
  );
}

function IconGuarantee({ accent: c }: { accent: string }) {
  return (
    <IcBox size={44}>
      <path d="M20 4 L34 10 L34 22 C34 30 20 38 20 38 C20 38 6 30 6 22 L6 10 Z"
        fill={`${c}14`} stroke={c} strokeWidth="1.8" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 8px ${c}44)` }}/>
      <polyline points="13,21 17,26 27,15" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </IcBox>
  );
}

const BONUS_ICONS = [IconMap, IconClipboard, IconCheck, IconSpeech, IconPhone];

// ─── Skill card SVG icons (unified system) ──────────────────────
function SkillIcon({ idx, accent: c }: { idx: number; accent: string }) {
  injectIconKf();
  const sz = 56;
  // idx 0 — Crosshair + scan (typography measurement)
  if (idx === 0) return (
    <svg width={sz} height={sz} viewBox="0 0 40 40" fill="none" style={{ display: "block", overflow: "visible" }}>
      <line x1="20" y1="5" x2="20" y2="35" stroke={`${c}33`} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5" y1="20" x2="35" y2="20" stroke={`${c}33`} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="10" y="10" width="20" height="20" rx="2" fill="none" stroke={`${c}33`} strokeWidth="1.2" strokeDasharray="3 3"/>
      <line x1="5" y1="20" x2="35" y2="20" stroke={c} strokeWidth="2" strokeLinecap="round"
        style={{ animation: "ic-scan 2.2s ease-in-out infinite", transformOrigin: "20px 20px" }}/>
      <circle cx="20" cy="20" r="3" fill={c} style={{ filter: `drop-shadow(0 0 6px ${c})` }}/>
    </svg>
  );
  // idx 1 — Rhythm bars (typographic rhythm)
  if (idx === 1) return (
    <svg width={sz} height={sz} viewBox="0 0 40 40" fill="none" style={{ display: "block" }}>
      <line x1="8" y1="6" x2="8" y2="34" stroke={`${c}44`} strokeWidth="1.5" strokeLinecap="round"/>
      {[{ w: 22, d: "0s" }, { w: 14, d: "0.3s" }, { w: 26, d: "0.6s" }, { w: 18, d: "0.9s" }].map((b, i) => (
        <rect key={i} x="10" y={9 + i * 7} width={b.w} height="3.5" rx="2" fill={c} opacity="0.82"
          style={{ animation: "ic-pulse 2.2s ease-in-out infinite", animationDelay: b.d }}/>
      ))}
    </svg>
  );
  // idx 2 — Concentric rings (visual hierarchy/weight)
  if (idx === 2) return (
    <svg width={sz} height={sz} viewBox="0 0 40 40" fill="none" style={{ display: "block", overflow: "visible" }}>
      <circle cx="20" cy="20" r="16" fill="none" stroke={`${c}18`} strokeWidth="1.5"/>
      <circle cx="20" cy="20" r="11" fill="none" stroke={`${c}33`} strokeWidth="1.8"
        style={{ animation: "ic-pulse 2.6s ease-in-out infinite" }}/>
      <circle cx="20" cy="20" r="6" fill={`${c}22`} stroke={c} strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 6px ${c})` }}/>
      <circle cx="20" cy="20" r="2.5" fill={c}/>
    </svg>
  );
  // idx 3 — 3×3 dot grid (layout system)
  return (
    <svg width={sz} height={sz} viewBox="0 0 40 40" fill="none" style={{ display: "block", overflow: "visible" }}>
      <line x1="8" y1="8" x2="32" y2="32" stroke={`${c}18`} strokeWidth="1" strokeDasharray="2 4"/>
      <line x1="32" y1="8" x2="8" y2="32" stroke={`${c}14`} strokeWidth="1" strokeDasharray="2 4"/>
      {[8,20,32].flatMap(x => [8,20,32].map(y => ({ x, y }))).map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={i === 4 ? 4 : 2.2}
          fill={i === 4 ? c : `${c}55`}
          style={i === 4
            ? { filter: `drop-shadow(0 0 5px ${c})`, animation: "ic-pulse 2.4s ease-in-out infinite" }
            : undefined
          }/>
      ))}
    </svg>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const t = useTheme();
  const c = useContent();
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(timer); }, []);

  const isHidden = (id: string) => c.blocksMeta?.hidden?.includes(id) ?? false;

  return (
    <div style={{ background: t.bg, color: t.textBase ?? "#f0f0f0", fontFamily: t.fontBody, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ═══ SECTION 1: HERO ═══ */}
      {!isHidden("hero") && (
      <section style={{ position: "relative", textAlign: "center", padding: "64px 20px 0", maxWidth: 960, margin: "0 auto" }}>
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(${t.accent}08 1px, transparent 1px), linear-gradient(90deg, ${t.accent}08 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }} />
        <div style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div style={{
            display: "inline-block", border: `1px solid ${t.accent}44`,
            borderRadius: 100, padding: "7px 18px", marginBottom: 36,
            fontFamily: t.fontMono, fontSize: 11, letterSpacing: "0.15em",
            color: t.accent, textTransform: "uppercase",
          }}>
            {c.heroBadge}
          </div>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: t.heroFontSize,
            fontWeight: 500,
            lineHeight: 1.06,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            color: "#ffffff",
            margin: "0 0 18px",
          }}>
            {c.heroHeadline1}<br />
            {c.heroHeadline2}
          </h1>
          <p style={{
            fontFamily: SECTRA,
            fontSize: "clamp(18px, 2.2vw, 26px)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.5,
            letterSpacing: "0.01em",
            margin: "0 auto 28px",
            maxWidth: 640,
          }}>
            {c.heroAccentLine}
          </p>
          <p style={{ fontSize: "clamp(14px, 1.6vw, 17px)", lineHeight: 1.75, color: t.textMuted ?? "#888", maxWidth: 640, margin: "0 auto 36px" }}>
            {c.heroSub}
          </p>
          <CtaButton label={`${c.heroCta} — ${c.price} VNĐ`} />
          <p style={{ fontSize: 15, color: t.textMuted ?? "#888", marginTop: 14, fontStyle: "italic" }}>
            (Nhận ngay quyền truy cập trọn đời)
          </p>
          <p style={{ fontSize: 15, color: t.textMuted ?? "#777", marginTop: 6 }}>
            {c.heroSubPrice ?? `Giá gốc: ${c.value} VNĐ — Tiết kiệm 80% hôm nay`}
          </p>
        </div>
        {/* 2-column product preview */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20, margin: "52px auto 0", maxWidth: 940, textAlign: "left",
          opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s",
        }}>
          {/* Col 1 — Ebook */}
          <div style={{ background: t.card, border: `1px solid ${t.accent}28`, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "22px 22px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flexShrink: 0 }}><IconBook accent={t.accent} /></div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: t.accent, letterSpacing: "0.15em", textTransform: "uppercase" }}>Ebook PDF</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.45, color: t.textBase ?? "#f0f0f0", marginBottom: 8 }}>
                Ấn phẩm kỹ thuật số dày hơn 500 trang
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: t.textBody ?? "#b0b0b0" }}>
                Được dàn trang với tiêu chuẩn khắt khe nhất về hệ thống lưới (Grid). Bóc tách trọn vẹn đặc tính của 4 dòng font huyết mạch và phân tích Case Study. Đọc mượt mà trên mọi thiết bị.
              </p>
            </div>
            <img src="/book-preview.gif" alt="Ebook Preview" style={{ width: "100%", display: "block", borderTop: `1px solid ${t.line}` }} />
          </div>

          {/* Col 2 — Video */}
          <div style={{ background: t.card, border: `1px solid ${t.accent}28`, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "22px 22px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flexShrink: 0 }}><IconVideo accent={t.accent} /></div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: t.accent, letterSpacing: "0.15em", textTransform: "uppercase" }}>Video Course</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.45, color: t.textBase ?? "#f0f0f0", marginBottom: 8 }}>
                Truy cập 80+ Video phân loại chặt chẽ
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: t.textBody ?? "#b0b0b0" }}>
                Hệ thống hóa trên nền tảng Skool chuyên nghiệp. Từng video là một "ca phẫu thuật" chữ viết. Xem lại mọi lúc, tra cứu thao tác mọi nơi để áp dụng ngay lập tức vào dự án đang thực hiện. Mua 1 lần, sở hữu công cụ làm nghề trọn đời.
              </p>
            </div>
            <img src="/video-preview2.gif" alt="Video Course Preview" style={{ width: "100%", display: "block", borderTop: `1px solid ${t.line}` }} />
          </div>
        </div>
      </section>
      )}
      {!isHidden("hero") && <MediaSection blockId="hero" />}

      <Div />

      {/* ═══ SECTION 2: NỖI ĐAU THỰC TẾ ═══ */}
      {!isHidden("pain") && (
      <Sec maxWidth={760}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Label>{c.painLabel}</Label>
            <SH>{c.painHeading}</SH>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <blockquote style={{
            borderLeft: `3px solid ${t.accent}`, paddingLeft: 24, margin: "0 0 36px",
            fontFamily: t.blockquoteFontFamily ?? t.fontAccent,
            fontStyle: t.blockquoteFontStyle ?? "italic",
            fontWeight: t.blockquoteFontWeight ?? 400,
            fontSize: t.blockquoteFontSize ?? "clamp(17px, 2.2vw, 22px)",
            color: t.textBody ?? "#d0d0d0", lineHeight: 1.7,
          }}>
            {c.painBlockquote}
          </blockquote>
        </FadeIn>
        <FadeIn delay={140}>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: t.textBody ?? "#b0b0b0", marginBottom: 28 }}>
            {c.painPara}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {c.painList.map((p, i) => <Check key={i} icon="✗" color={t.danger}>{p}</Check>)}
          </div>
        </FadeIn>
        {c.painConclusion && (
          <FadeIn delay={220}>
            <div style={{ marginTop: 32, background: `${t.danger}0d`, border: `1px solid ${t.danger}22`, borderRadius: t.cardRadius, padding: "20px 24px" }}>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: t.textBody ?? "#b0b0b0", fontStyle: "italic" }}>
                {c.painConclusion}
              </p>
            </div>
          </FadeIn>
        )}
      </Sec>
      )}
      {!isHidden("pain") && <MediaSection blockId="pain" />}

      <Div />

      {/* ═══ SECTION 3: GIẢI PHÁP TỪ CHUYÊN GIA ═══ */}
      {!isHidden("instructor") && (
      <Sec maxWidth={860}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Label>{c.instructorLabel}</Label>
            <SH><NL str={c.instructorHeading} /></SH>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar col */}
            <div style={{ flexShrink: 0, textAlign: "center", minWidth: 220, maxWidth: 260 }}>
              <div style={{
                borderRadius: 16, overflow: "hidden",
                border: `2px solid ${t.accent}44`,
                boxShadow: `0 0 40px -12px ${t.accent}55`,
                marginBottom: 16,
              }}>
                <img src={c.instructorPhoto ?? "/instructor.jpg"} alt={c.instructorName} style={{ width: "100%", display: "block" }} />
              </div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 18, fontWeight: 700, color: t.textBase ?? "#f0f0f0", marginBottom: 6 }}>
                {c.instructorName}
              </div>
              <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, lineHeight: 1.6 }}>
                {c.instructorTitle}
              </div>
            </div>
            {/* Bio col */}
            <div style={{ flex: 1, minWidth: 260 }}>
              {c.instructorBio.map((bio, i) => (
                <p key={i} style={{ fontSize: 16, lineHeight: 1.85, color: t.textBody ?? "#b0b0b0", marginBottom: 20 }}>
                  {bio}
                </p>
              ))}
            </div>
          </div>
        </FadeIn>
        {c.instructorInsight && (
          <FadeIn delay={180}>
            <div style={{ marginTop: 36, background: `linear-gradient(135deg, ${t.accent}12, ${t.card})`, border: `1px solid ${t.accent}44`, borderRadius: t.cardRadius, padding: "26px 30px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span style={{ color: t.accent, fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2, opacity: 0.7 }}>"</span>
              <p style={{
                fontSize: 17, lineHeight: 1.85,
                color: t.textBase ?? "#e8e8e8",
                fontFamily: t.fontBody,
                fontStyle: "normal",
                fontWeight: 500,
                letterSpacing: "0.01em",
                margin: 0,
              }}>
                {c.instructorInsight}
              </p>
            </div>
          </FadeIn>
        )}
      </Sec>
      )}
      {!isHidden("instructor") && <MediaSection blockId="instructor" />}

      <Div />

      {/* ═══ SECTION 4: SẢN PHẨM CHI TIẾT ═══ */}
      {!isHidden("products") && (
      <Sec maxWidth={860}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Label>{c.productsLabel ?? "Sản phẩm chi tiết"}</Label>
            <SH><NL str={c.productsHeading ?? "Trải nghiệm đào tạo kép:\nTypography Masterclass"} /></SH>
            {c.productsSub && (
              <p style={{ fontSize: 17, color: t.textMuted ?? "#888", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
                {c.productsSub}
              </p>
            )}
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 44 }}>
            {c.products.map((p, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${t.card}, ${t.card2})`,
                border: `1px solid ${t.accent}44`, borderRadius: t.cardRadius, overflow: "hidden",
              }}>
                <div style={{ padding: "36px 30px 24px" }}>
                  <div style={{ marginBottom: 18 }}>{i === 0 ? <IconBook accent={t.accent} /> : <IconVideo accent={t.accent} />}</div>
                  <h3 style={{ fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ fontSize: 16, color: t.textBody ?? "#b0b0b0", lineHeight: 1.75 }}>{p.desc}</p>
                </div>
                {i === 0 && c.productsEbookEmbed && (
                  <div style={{ borderTop: `1px solid ${t.line}`, background: "#080808" }}>
                    <iframe src={c.productsEbookEmbed} style={{ width: "100%", height: 480, border: "none", display: "block" }} title="Ebook Preview" allow="fullscreen" />
                  </div>
                )}
                {i === 1 && c.productsVideoGif && (
                  <div style={{ borderTop: `1px solid ${t.line}` }}>
                    <img src={c.productsVideoGif} alt="Video Preview" style={{ width: "100%", display: "block" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
        <div style={{ textAlign: "center" }}>
          <FadeIn delay={140}>
            <CtaButton label={`${c.midCta} — ${c.price} VNĐ`} />
            <p style={{ fontSize: 16, color: t.textMuted ?? "#888", marginTop: 12, fontStyle: "italic" }}>
              Thanh toán 1 lần — Truy cập trọn đời
            </p>
          </FadeIn>
        </div>
      </Sec>
      )}
      {!isHidden("products") && <MediaSection blockId="products" />}

      <Div />

      {/* ═══ SECTION 5: 4 KỸ NĂNG CỐT LÕI ═══ */}
      {!isHidden("skills") && (
      <Sec maxWidth={940}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Label>{c.skillsLabel}</Label>
            <SH><NL str={c.skillsHeading} /></SH>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
            {c.skillCards.map((s, i) => (
              <div key={i}
                style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, overflow: "hidden", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${t.accent}66`; el.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = t.line; el.style.transform = "translateY(0)"; }}
              >
                <div style={{ padding: "28px 26px 22px" }}>
                  {/* CSS abstract icon */}
                  <div style={{ marginBottom: 18 }}>
                    <SkillIcon idx={i} accent={t.accent} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.35, marginBottom: 12, color: t.textBase ?? "#f0f0f0" }}>{s.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: t.textBody ?? "#b0b0b0", marginBottom: 16 }}>{s.desc}</p>
                  <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: 14 }}>
                    <p style={{ fontSize: 12, color: t.danger, lineHeight: 1.55 }}>⚠ {s.warn}</p>
                  </div>
                </div>
                {/* Per-card GIF slot */}
                {s.gif && (
                  <div style={{ borderTop: `1px solid ${t.line}` }}>
                    <img src={s.gif} alt={s.title} style={{ width: "100%", display: "block" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </Sec>
      )}
      {!isHidden("skills") && <MediaSection blockId="skills" />}

      <Div />

      {/* ═══ SECTION 6: LỘ TRÌNH KIẾN THỨC ═══ */}
      {!isHidden("roadmap") && (
      <Sec maxWidth={900}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Label>{c.roadmapLabel}</Label>
            <SH><NL str={c.roadmapHeading} /></SH>
          </div>
        </FadeIn>

        {/* Book preview sub-section */}
        <FadeIn delay={80}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: t.textBase ?? "#f0f0f0", marginBottom: 12 }}>
              {c.roadmapPreviewHeading ?? "Trải nghiệm trực quan không gian bên trong ấn phẩm"}
            </p>
            <p style={{ fontSize: 15, color: t.textMuted ?? "#888", maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.7 }}>
              {c.roadmapPreviewDesc}
            </p>
          </div>
          {c.roadmapIframeUrl ? (
            <div style={{
              borderRadius: t.cardRadius, overflow: "hidden",
              border: `1px solid ${t.line}`, marginBottom: 52,
              aspectRatio: "16/9", position: "relative",
            }}>
              <iframe
                src={c.roadmapIframeUrl}
                title="Book Preview"
                allow="clipboard-write"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{
              border: `2px dashed ${t.line}`, borderRadius: t.cardRadius,
              padding: "60px 24px", textAlign: "center", marginBottom: 52,
              color: t.textMuted ?? "#555",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
              <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em" }}>
                [ KHU VỰC NHÚNG MÃ IFRAME HEYZINE BẢN PREVIEW TẠI ĐÂY ]
              </p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Dán URL Heyzine vào Admin → Nội dung → Lộ trình</p>
            </div>
          )}
        </FadeIn>

        {/* Chapter grid */}
        <FadeIn delay={160}>
          <p style={{ fontSize: 17, fontWeight: 700, textAlign: "center", color: t.textBase ?? "#f0f0f0", marginBottom: 28 }}>
            {c.roadmapChaptersHeading ?? "Hệ thống hóa toàn bộ tư duy thiết kế của bạn:"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {c.stages.map((m, i) => (
              <div key={i} style={{
                background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius,
                borderLeft: `3px solid ${t.accent}`, overflow: "hidden",
              }}>
                <div style={{ padding: "26px 24px" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: "0.12em", background: `${t.accent}18`, padding: "3px 10px", borderRadius: 100 }}>{m.n}</span>
                    <span style={{ fontSize: 12, color: t.textMuted ?? "#666", fontFamily: MONO }}>{m.sub}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: t.textBase ?? "#f0f0f0" }}>{m.title}</h3>
                  <p style={{ fontSize: 14, color: t.textBody ?? "#b0b0b0", lineHeight: 1.7 }}>{m.desc}</p>
                </div>
                {m.gif && (
                  <div style={{ borderTop: `1px solid ${t.line}` }}>
                    <img src={m.gif} alt={m.title} style={{ width: "100%", display: "block" }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chapters GIF slot */}
          {c.roadmapChaptersGif && (
            <div style={{ marginTop: 28, borderRadius: t.cardRadius, overflow: "hidden", border: `1px solid ${t.line}` }}>
              <img src={c.roadmapChaptersGif} alt="Lộ trình" style={{ width: "100%", display: "block" }} />
            </div>
          )}
        </FadeIn>
      </Sec>
      )}
      {!isHidden("roadmap") && <MediaSection blockId="roadmap" />}

      <Div />

      {/* ═══ SECTION 7: QUÀ TẶNG ĐI KÈM ═══ */}
      {!isHidden("bonuses") && (
      <Sec maxWidth={820}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Label>{c.bonusesLabel}</Label>
            <SH><NL str={c.bonusesHeading} /></SH>
            <p style={{ fontSize: 15, color: t.textMuted ?? "#888", marginTop: -8 }}>{c.bonusesSub}</p>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {c.bonuses.map((b, i) => (
              <div key={i} style={{
                background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius,
                padding: "22px 24px", display: "flex", gap: 20, alignItems: "flex-start",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${t.accent}44`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = t.line; }}
              >
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, background: `${t.accent}0f`, borderRadius: 10, border: `1px solid ${t.accent}25` }}>
                {(() => { const Icon = BONUS_ICONS[i % BONUS_ICONS.length]; return <Icon accent={t.accent} />; })()}
              </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: t.accent, letterSpacing: "0.15em" }}>BONUS {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: t.textBase ?? "#f0f0f0", lineHeight: 1.35 }}>{b.title}</div>
                  <div style={{ fontSize: 15, color: t.textBody ?? "#b0b0b0", lineHeight: 1.65 }}>{b.desc}</div>
                  {b.image && (
                    <div style={{ marginTop: 20, borderRadius: 12, overflow: "hidden", border: `1px solid ${t.line}` }}>
                      <img src={b.image} alt={b.title} style={{ width: "100%", display: "block" }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
        {c.bonusGif && (
          <FadeIn delay={120}>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 36, marginBottom: 16 }}>
              <div style={{
                width: "100%", maxWidth: 360, borderRadius: t.cardRadius,
                overflow: "hidden", border: `1px solid ${t.accent}28`,
                boxShadow: `0 8px 40px -12px ${t.accent}33`,
              }}>
                <img src={c.bonusGif} alt="Bonus Preview" style={{ width: "100%", display: "block", aspectRatio: "9/16", objectFit: "cover" }} />
              </div>
            </div>
          </FadeIn>
        )}
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <FadeIn delay={150}>
            <CtaButton label={c.bonusesCta} />
            <p style={{ fontSize: 16, color: t.textMuted ?? "#888", marginTop: 12, fontStyle: "italic" }}>
              Thanh toán 1 lần — Truy cập trọn đời
            </p>
          </FadeIn>
        </div>
      </Sec>
      )}
      {!isHidden("bonuses") && <MediaSection blockId="bonuses" />}

      <Div />

      {/* ═══ SECTION 8: TRƯỚC & SAU ═══ */}
      {!isHidden("before-after") && (
      <Sec maxWidth={900}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Label>{c.baLabel}</Label>
            <SH>{c.baHeading}</SH>
            {c.baSub && <p style={{ fontSize: 16, color: t.textMuted ?? "#888", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>{c.baSub}</p>}
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div style={{ background: t.card, border: `1px solid ${t.danger}33`, borderRadius: t.cardRadius, padding: "32px 28px" }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.danger, letterSpacing: "0.12em", marginBottom: 24, textTransform: "uppercase" }}>
                ✗ {c.beforeLabel}
              </div>
              {c.beforeItems.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ color: t.danger, fontWeight: 700, flexShrink: 0, fontFamily: MONO, marginTop: 1 }}>—</span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.65, color: t.textBody ?? "#b0b0b0" }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: t.card, border: `1px solid ${t.accent}33`, borderRadius: t.cardRadius, padding: "32px 28px" }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.accent, letterSpacing: "0.12em", marginBottom: 24, textTransform: "uppercase" }}>
                ✓ {c.afterLabel}
              </div>
              {c.afterItems.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ color: t.accent, fontWeight: 700, flexShrink: 0, fontFamily: MONO, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.65, color: t.textBody ?? "#b0b0b0" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </Sec>
      )}
      {!isHidden("before-after") && <MediaSection blockId="before-after" />}

      <Div />

      {/* ═══ SECTION 9: CHỐT SALE & THANH TOÁN ═══ */}
      {!isHidden("cta") && (
      <section id="dang-ky" style={{ maxWidth: 760, margin: "84px auto 0", padding: "0 20px" }}>
        <FadeIn>
          <div style={{ background: `linear-gradient(135deg, ${t.card}, ${t.card2})`, border: `1px solid ${t.accent}44`, borderRadius: 28, overflow: "hidden" }}>
            <div style={{ background: t.accent, padding: "14px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: t.accentText }}>
                {c.urgencyBar.replace("{PRICE}", c.price)}
              </p>
            </div>
            <div style={{ padding: "48px 40px" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <Label>{c.ctaLabel}</Label>
                <SH><NL str={c.ctaHeading} /></SH>
                <p style={{ fontSize: 16, color: t.textBody ?? "#b0b0b0", marginBottom: 32, lineHeight: 1.75 }}>{c.ctaSub}</p>
                <div style={{ marginBottom: 36 }}>
                  <p style={{ fontSize: 13, color: t.textMuted ?? "#666", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO }}>{c.countdownLabel}</p>
                  <Countdown />
                </div>
              </div>

              {/* Value stack */}
              <div style={{ background: "#0a0a0c", border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "26px 24px", marginBottom: 32 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: t.textBase ?? "#fff", marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO }}>{c.valueStackTitle}</p>
                {c.valueStack.map(({ label, price }, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, color: t.textBody ?? "#bbb", lineHeight: 1.5 }}>{label}</span>
                    <span style={{ fontSize: 14, color: t.textMuted ?? "#777", fontFamily: MONO, flexShrink: 0 }}>{price}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${t.line}`, marginTop: 14, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 14, color: "#666", textDecoration: "line-through", fontFamily: MONO }}>Tổng giá trị thực tế: {c.value} VNĐ</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: t.accent, fontFamily: MONO }}>Hôm nay: {c.price} VNĐ</span>
                </div>
              </div>

              <RegForm />

              <div style={{ marginTop: 32, paddingTop: 28, borderTop: `1px solid ${t.line}`, textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <IconGuarantee accent={t.accent} />
                </div>
                <p style={{ fontSize: 15, color: t.textBody ?? "#cfcfcf", lineHeight: 1.7, maxWidth: 520, margin: "0 auto", fontStyle: "italic" }}>
                  {c.guarantee}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
      )}
      {!isHidden("cta") && <MediaSection blockId="cta" />}

      {/* ═══ FOOTER ═══ */}
      {!isHidden("footer") && (
      <footer style={{ textAlign: "center", padding: "64px 20px 32px", borderTop: `1px solid ${t.line}`, marginTop: 84 }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          {c.footerBrand}<span style={{ color: t.accent }}>{c.footerDot}</span>DESIGN
        </div>
        <p style={{ fontSize: 13, color: t.textMuted ?? "#555", marginBottom: 24, fontFamily: MONO }}>{c.footerTagline}</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
          {c.footerLinks.map((link) => (
            <a key={link} href="#" style={{ fontSize: 13, color: t.textMuted ?? "#555", textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = t.accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = t.textMuted ?? "#555"; }}
            >{link}</a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: t.textMuted ?? "#444", marginTop: 16, fontFamily: MONO }}>{c.footerCopyright}</p>
      </footer>
      )}
    </div>
  );
}
