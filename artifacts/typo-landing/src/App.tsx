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

// ─── CSS abstract icon system ─────────────────────────────────
const ICON_KF = `
@keyframes ic-pulse{0%,100%{opacity:.55;transform:scale(.92)}50%{opacity:1;transform:scale(1)}}
@keyframes ic-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ic-blink{0%,45%{opacity:1}50%,100%{opacity:.2}}
@keyframes ic-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes ic-scan2{0%,100%{transform:scaleX(.3);opacity:.5}50%{transform:scaleX(1);opacity:1}}
`;
let _icKfInjected = false;
function injectIconKf() {
  if (_icKfInjected) return; _icKfInjected = true;
  const s = document.createElement("style"); s.textContent = ICON_KF; document.head.appendChild(s);
}

/** Book shape — 2 pages, spine, horizontal text lines */
function IconBook({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  return (
    <div style={{ width: 36, height: 32, position: "relative", animation: "ic-float 3s ease-in-out infinite" }}>
      <div style={{ position: "absolute", left: 17, top: 0, width: 2, height: "100%", background: c, borderRadius: 1, opacity: 0.9 }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 17, height: 32, background: `${c}22`, border: `1.5px solid ${c}66`, borderRight: "none", borderRadius: "3px 0 0 3px" }}>
        {[6, 12, 18, 24].map(y => <div key={y} style={{ position: "absolute", left: 3, top: y, right: 4, height: 1.5, background: `${c}55`, borderRadius: 1 }} />)}
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, width: 17, height: 32, background: `${c}15`, border: `1.5px solid ${c}44`, borderLeft: "none", borderRadius: "0 3px 3px 0" }}>
        {[6, 12, 18].map(y => <div key={y} style={{ position: "absolute", left: 4, top: y, right: 3, height: 1.5, background: `${c}40`, borderRadius: 1 }} />)}
      </div>
    </div>
  );
}

/** Play-in-screen — laptop silhouette with triangle */
function IconVideo({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  return (
    <div style={{ width: 38, height: 30, position: "relative", animation: "ic-float 3.5s ease-in-out infinite" }}>
      <div style={{ position: "absolute", inset: 0, border: `1.5px solid ${c}77`, borderRadius: 4, background: `${c}0d` }} />
      <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", width: 24, height: 4, background: `${c}44`, borderRadius: "0 0 3px 3px" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-42%, -50%)",
        width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: `10px solid ${c}`, filter: `drop-shadow(0 0 4px ${c}88)` }} />
    </div>
  );
}

/** Map grid — dots arranged in grid */
function IconMap({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  const dots = [[4,4],[14,4],[24,4],[4,12],[14,12],[24,12],[4,20],[14,20],[24,20]];
  return (
    <div style={{ width: 30, height: 26, position: "relative" }}>
      {dots.map(([x,y],i) => <div key={i} style={{ position: "absolute", left: x, top: y, width: 4, height: 4, borderRadius: "50%", background: i===4?c:`${c}55`, boxShadow: i===4?`0 0 6px ${c}`:undefined, animation: i===4?"ic-pulse 2s ease-in-out infinite":undefined }} />)}
      <svg style={{ position: "absolute", inset: 0 }} width={30} height={26}>
        <line x1={6} y1={6} x2={22} y2={22} stroke={`${c}33`} strokeWidth={1} />
        <line x1={22} y1={6} x2={6} y2={22} stroke={`${c}22`} strokeWidth={1} />
      </svg>
    </div>
  );
}

/** Clipboard — rect + horizontal lines */
function IconClipboard({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  return (
    <div style={{ width: 28, height: 34, position: "relative", border: `1.5px solid ${c}66`, borderRadius: 3, background: `${c}0d` }}>
      <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 10, height: 6, background: `${c}88`, borderRadius: "3px 3px 0 0" }} />
      {[8, 14, 20, 26].map(y => <div key={y} style={{ position: "absolute", left: 5, right: 5, top: y, height: 1.5, background: y===8?`${c}99`:`${c}44`, borderRadius: 1 }} />)}
    </div>
  );
}

/** Checkmark circle */
function IconCheck({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  return (
    <div style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${c}`, background: `${c}12`, position: "relative", animation: "ic-pulse 2.5s ease-in-out infinite", boxShadow: `0 0 10px -4px ${c}` }}>
      <div style={{ position: "absolute", left: 7, top: 14, width: 5, height: 2, background: c, transform: "rotate(45deg)", transformOrigin: "bottom left", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 10, top: 18, width: 10, height: 2, background: c, transform: "rotate(-50deg)", transformOrigin: "left center", borderRadius: 1 }} />
    </div>
  );
}

/** Speech bubble */
function IconSpeech({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  return (
    <div style={{ width: 32, height: 30, position: "relative", animation: "ic-float 3s ease-in-out infinite" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 22, border: `1.5px solid ${c}77`, borderRadius: 6, background: `${c}10` }}>
        {[6, 12].map(y => <div key={y} style={{ position: "absolute", left: 5, right: 5, top: y, height: 1.5, background: `${c}55`, borderRadius: 1 }} />)}
      </div>
      <div style={{ position: "absolute", bottom: 2, left: 8, width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "3px solid transparent", borderTop: `7px solid ${c}66` }} />
    </div>
  );
}

/** Phone screen */
function IconPhone({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  return (
    <div style={{ width: 22, height: 34, border: `1.5px solid ${c}77`, borderRadius: 5, background: `${c}0d`, position: "relative", animation: "ic-float 3.5s ease-in-out infinite" }}>
      <div style={{ position: "absolute", top: 3, left: 3, right: 3, bottom: 7, background: `${c}18`, borderRadius: 3 }}>
        <div style={{ position: "absolute", top: 4, left: 2, right: 2, height: 1.5, background: `${c}55`, borderRadius: 1, animation: "ic-scan2 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: 8, left: 2, right: 4, height: 1.5, background: `${c}33`, borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 12, left: 2, right: 2, height: 1.5, background: `${c}44`, borderRadius: 1 }} />
      </div>
      <div style={{ position: "absolute", bottom: 2.5, left: "50%", transform: "translateX(-50%)", width: 6, height: 1.5, background: `${c}77`, borderRadius: 1 }} />
    </div>
  );
}

/** Shield with coin — guarantee icon */
function IconGuarantee({ accent }: { accent: string }) {
  injectIconKf();
  const c = accent;
  return (
    <div style={{ width: 42, height: 46, position: "relative", animation: "ic-float 4s ease-in-out infinite" }}>
      <svg width={42} height={46} viewBox="0 0 42 46" fill="none" style={{ position: "absolute" }}>
        <path d="M21 2 L38 9 L38 23 C38 33 21 43 21 43 C21 43 4 33 4 23 L4 9 Z"
          fill={`${c}14`} stroke={c} strokeWidth={1.5} strokeLinejoin="round" opacity={0.85} />
      </svg>
      <div style={{ position: "absolute", left: "50%", top: "52%", transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${c}`, background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: c, fontFamily: "monospace", lineHeight: 1 }}>₫</span>
      </div>
    </div>
  );
}

const BONUS_ICONS = [IconMap, IconClipboard, IconCheck, IconSpeech, IconPhone];

// ─── Skill card CSS icons ──────────────────────────────────────
const SKILL_KF = `
@keyframes sk-scan{0%,100%{transform:translateX(-50%) translateY(-13px)}50%{transform:translateX(-50%) translateY(13px)}}
@keyframes sk-b1{0%,100%{width:80%}50%{width:35%}}
@keyframes sk-b2{0%,100%{width:50%}50%{width:90%}}
@keyframes sk-b3{0%,100%{width:70%}50%{width:25%}}
@keyframes sk-b4{0%,100%{width:38%}50%{width:68%}}
@keyframes sk-ring{0%,100%{transform:scale(0.55);opacity:0.35}50%{transform:scale(1);opacity:0.9}}
@keyframes sk-d1{0%,100%{transform:scale(1)}33%{transform:scale(1.7)}}
@keyframes sk-d2{0%,100%{transform:scale(1)}66%{transform:scale(1.7)}}
@keyframes sk-d3{0%,100%{transform:scale(1)}100%{transform:scale(1.7)}}
`;
let _kfInjected = false;
function SkillIcon({ idx, accent }: { idx: number; accent: string }) {
  if (!_kfInjected) {
    const s = document.createElement("style"); s.textContent = SKILL_KF;
    document.head.appendChild(s); _kfInjected = true;
  }
  const sz = 56;
  if (idx === 0) return (
    <div style={{ width: sz, height: sz, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 2, height: 38, background: `${accent}30`, left: "50%", top: 9, transform: "translateX(-50%)" }} />
      <div style={{ position: "absolute", width: 34, height: 2, background: `${accent}30`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      <div style={{ position: "absolute", width: 38, height: 2, left: "50%", top: "50%", background: `linear-gradient(90deg,transparent,${accent},transparent)`, animation: "sk-scan 2s ease-in-out infinite", boxShadow: `0 0 8px ${accent}` }} />
    </div>
  );
  if (idx === 1) return (
    <div style={{ width: sz, height: sz, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7, padding: "4px 8px" }}>
      {[0,1,2,3].map(j => (
        <div key={j} style={{ height: 3, borderRadius: 2, background: accent, opacity: 0.85,
          animation: `sk-b${j+1} 2.4s ease-in-out infinite`, animationDelay: `${j*0.3}s` }} />
      ))}
    </div>
  );
  if (idx === 2) return (
    <div style={{ width: sz, height: sz, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${accent}33`, position: "absolute" }} />
      <div style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${accent}`, position: "absolute", animation: "sk-ring 2s ease-in-out infinite" }} />
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
    </div>
  );
  // idx === 3
  const pts = [{ x: 8, y: 44 }, { x: 28, y: 10 }, { x: 48, y: 44 }];
  const anims = ["sk-d1","sk-d2","sk-d3"];
  return (
    <div style={{ width: sz, height: sz, position: "relative" }}>
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ position: "absolute" }}>
        <path d={`M ${pts[0].x} ${pts[0].y} Q ${pts[1].x} ${pts[1].y}, ${pts[2].x} ${pts[2].y}`}
          fill="none" stroke={`${accent}44`} strokeWidth={1.5} strokeDasharray="4 3" />
      </svg>
      {pts.map((p, j) => (
        <div key={j} style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: accent, left: p.x-4, top: p.y-4,
          animation: `${anims[j]} 2.4s ease-in-out infinite`, animationDelay: `${j*0.5}s`,
          boxShadow: `0 0 6px ${accent}88` }} />
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const t = useTheme();
  const c = useContent();
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(timer); }, []);

  return (
    <div style={{ background: t.bg, color: t.textBase ?? "#f0f0f0", fontFamily: t.fontBody, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Floating Edit Button ── */}
      <a href="/editor" style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        background: t.accent, color: t.accentText,
        borderRadius: 100, padding: "10px 20px",
        fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
        textDecoration: "none", boxShadow: `0 4px 24px ${t.accent}55`,
        display: "flex", alignItems: "center", gap: 7,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.06)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}>
        ✏ CHỈNH SỬA
      </a>

      {/* ═══ SECTION 1: HERO ═══ */}
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
      <MediaSection blockId="hero" />

      <Div />

      {/* ═══ SECTION 2: NỖI ĐAU THỰC TẾ ═══ */}
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
      <MediaSection blockId="pain" />

      <Div />

      {/* ═══ SECTION 3: GIẢI PHÁP TỪ CHUYÊN GIA ═══ */}
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
      <MediaSection blockId="instructor" />

      <Div />

      {/* ═══ SECTION 4: SẢN PHẨM CHI TIẾT ═══ */}
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
      <MediaSection blockId="products" />

      <Div />

      {/* ═══ SECTION 5: 4 KỸ NĂNG CỐT LÕI ═══ */}
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
      <MediaSection blockId="skills" />

      <Div />

      {/* ═══ SECTION 6: LỘ TRÌNH KIẾN THỨC ═══ */}
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
      <MediaSection blockId="roadmap" />

      <Div />

      {/* ═══ SECTION 7: QUÀ TẶNG ĐI KÈM ═══ */}
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
      <MediaSection blockId="bonuses" />

      <Div />

      {/* ═══ SECTION 8: TRƯỚC & SAU ═══ */}
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
      <MediaSection blockId="before-after" />

      <Div />

      {/* ═══ SECTION 9: CHỐT SALE & THANH TOÁN ═══ */}
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
      <MediaSection blockId="cta" />

      {/* ═══ FOOTER ═══ */}
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
    </div>
  );
}
