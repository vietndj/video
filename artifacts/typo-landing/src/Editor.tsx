import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme, type Theme } from "./theme";
import { loadContent, saveContent, DEFAULT_CONTENT, type PageContent, type MediaItem, type BlocksMeta } from "./content";

const NOE = "'Noe Display', Georgia, serif";
const AEONIK = "'Aeonik', 'Inter', sans-serif";
const MONO = "'JetBrains Mono', Consolas, monospace";
const SECTRA = "'GT Sectra', Georgia, serif";

const BLOCK_DEFS = [
  { id: "hero", label: "Hero Section", icon: "🦸" },
  { id: "pain", label: "Điểm đau", icon: "😫" },
  { id: "cycle", label: "Vòng lặp thất bại", icon: "🔄" },
  { id: "discovery", label: "Khám phá", icon: "🔬" },
  { id: "solution", label: "Giải pháp", icon: "💡" },
  { id: "midcta", label: "CTA giữa trang", icon: "🎯" },
  { id: "skills", label: "4 Kỹ năng", icon: "🛠" },
  { id: "bonuses", label: "Quà tặng", icon: "🎁" },
  { id: "before-after", label: "Trước & Sau", icon: "📈" },
  { id: "roadmap", label: "Lộ trình", icon: "🗺" },
  { id: "instructor", label: "Giảng viên", icon: "👨‍🏫" },
  { id: "cta", label: "Final CTA", icon: "💰" },
  { id: "footer", label: "Footer", icon: "📌" },
];

const DEFAULT_META: BlocksMeta = {
  order: BLOCK_DEFS.map((b) => b.id),
  hidden: [],
  media: {},
  custom: {},
};

// ─── Inline contenteditable text ─────────────────────────────
function ET({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const vRef = useRef(value);
  // Set textContent only on mount — prevents cursor-jumping during typing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (ref.current) { ref.current.textContent = value; vRef.current = value; } }, []);
  return (
    <span ref={ref} contentEditable suppressContentEditableWarning
      onFocus={() => { vRef.current = ref.current?.textContent ?? ""; }}
      onBlur={(e) => { const t = e.currentTarget.textContent ?? ""; if (t !== vRef.current) { vRef.current = t; onChange(t); } }}
      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
      style={{ outline: "none", cursor: "text", borderBottom: "1px dashed rgba(0,240,255,0.35)", minWidth: 4, ...style }} />
  );
}

function ETBlock({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const vRef = useRef(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (ref.current) { ref.current.textContent = value; vRef.current = value; } }, []);
  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      onFocus={() => { vRef.current = ref.current?.textContent ?? ""; }}
      onBlur={(e) => { const t = e.currentTarget.textContent ?? ""; if (t !== vRef.current) { vRef.current = t; onChange(t); } }}
      style={{ outline: "none", cursor: "text", borderBottom: "1px dashed rgba(0,240,255,0.2)", minHeight: "1.1em", minWidth: 4, ...style }} />
  );
}

// ─── Image / GIF upload field ─────────────────────────────────
function ImageUploadField({ value, onChange, label, accent }: {
  value: string; onChange: (v: string) => void; label: string; accent: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { url } = await res.json() as { url: string };
      onChange(url);
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  return (
    <div style={{ marginTop: 12, borderTop: "1px solid #1a1a22", paddingTop: 12 }}>
      <div style={{ fontSize: 10, color: "#555", fontFamily: MONO, letterSpacing: "0.12em", marginBottom: 8 }}>{label}</div>
      {value ? (
        <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid #2a2a32", marginBottom: 6 }}>
          <img src={value} alt="" style={{ width: "100%", display: "block", maxHeight: 180, objectFit: "cover" }} />
          <button onClick={() => onChange("")} style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.85)", border: "1px solid #cc2222", borderRadius: 5, color: "#ff7e7e", cursor: "pointer", padding: "2px 8px", fontSize: 10, fontFamily: MONO }}>✕ Xóa</button>
        </div>
      ) : (
        <div style={{ border: "1px dashed #2a2a32", borderRadius: 8, padding: "10px", textAlign: "center", marginBottom: 6 }}>
          <button
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            style={{ background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 6, color: uploading ? "#555" : accent, cursor: uploading ? "default" : "pointer", padding: "5px 12px", fontSize: 10, fontFamily: MONO }}
          >
            {uploading ? "⏳ Đang tải..." : "📁 Upload GIF / ảnh"}
          </button>
          <span style={{ fontSize: 10, color: "#444", fontFamily: MONO, margin: "0 6px" }}>hoặc</span>
          <input type="url" defaultValue="" placeholder="dán URL..."
            onBlur={(e) => { if (e.target.value) { onChange(e.target.value); e.target.value = ""; } }}
            style={{ background: "transparent", border: "none", borderBottom: "1px dashed #333", color: "#888", fontSize: 10, fontFamily: MONO, width: 120, outline: "none" }} />
        </div>
      )}
      {error && <div style={{ fontSize: 10, color: "#ff5555", fontFamily: MONO, marginTop: 4 }}>{error}</div>}
      <input ref={fileRef} type="file" accept="image/gif,image/jpeg,image/png,image/webp,image/svg+xml" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

// ─── Toolbar button ───────────────────────────────────────────
function TB({ children, onClick, disabled = false, title, danger }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string; danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? (danger ? "#2a0a0a" : "#1e1e28") : "transparent",
        border: "none", cursor: disabled ? "default" : "pointer",
        color: disabled ? "#2a2a33" : danger ? "#ff7e7e" : "#bbb",
        fontSize: 12, padding: "3px 7px", borderRadius: 5, transition: "all 0.12s",
        fontFamily: MONO, whiteSpace: "nowrap",
      }}>
      {children}
    </button>
  );
}

// ─── YouTube ID extraction ─────────────────────────────────────
function getYTId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/
  );
  return m?.[1] ?? null;
}

// ─── YouTube iframe embed ─────────────────────────────────────
function YTEmbed({ ytId }: { ytId: string }) {
  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, background: "#000" }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}

// ─── Media block display ──────────────────────────────────────
function MediaBlock({ items, onRemove }: { items: MediaItem[]; onRemove: (id: string) => void }) {
  if (!items?.length) return null;
  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item) => {
        const ytId = item.type === "youtube" ? getYTId(item.url) : null;
        return (
          <div key={item.id}>
            {/* Delete row — always visible, outside overflow:hidden */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
              <button onClick={() => onRemove(item.id)}
                style={{ background: "#1a0808", border: "1px solid #cc222233", borderRadius: 6, color: "#ff7e7e", cursor: "pointer", padding: "3px 12px", fontSize: 11, fontFamily: MONO, fontWeight: 600 }}>
                ✕ Xóa
              </button>
            </div>
            {/* Media content */}
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e28" }}>
              {item.type === "image" && (
                <>
                  <img src={item.url} alt={item.caption}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/800x400/111/555?text=Ảnh+không+tải+được"; }}
                    style={{ width: item.fit === "half" ? "50%" : "100%", display: "block", maxHeight: 480, objectFit: "cover" }} />
                  {item.caption && <p style={{ fontSize: 12, color: "#999", textAlign: "center", padding: "8px 16px", fontStyle: "italic", fontFamily: MONO }}>{item.caption}</p>}
                </>
              )}
              {item.type === "youtube" && (
                <>
                  {ytId
                    ? <YTEmbed ytId={ytId} />
                    : <div style={{ padding: 16, color: "#ff7e7e", fontFamily: MONO, fontSize: 12 }}>⚠ URL YouTube không hợp lệ: {item.url}</div>
                  }
                  {item.caption && <p style={{ fontSize: 12, color: "#999", textAlign: "center", padding: "8px 16px", fontStyle: "italic", fontFamily: MONO }}>{item.caption}</p>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Add media modal ──────────────────────────────────────────
function AddMediaModal({ onClose, onAdd, accent, accentText }: {
  onClose: () => void; onAdd: (item: MediaItem) => void; accent: string; accentText: string;
}) {
  const [tab, setTab] = useState<"image" | "youtube">("image");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [fit, setFit] = useState<"full" | "half" | "auto">("full");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#0f0f12", border: "1px solid #2a2a32", borderRadius: 16, padding: "28px 32px", width: 440, maxWidth: "90vw", color: "#e8e8ec", fontFamily: AEONIK }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: NOE, fontSize: 20, fontWeight: 700, margin: 0 }}>Thêm ảnh / video</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20, padding: "0 4px" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["image", "youtube"] as const).map((tp) => (
            <button key={tp} onClick={() => setTab(tp)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: tab === tp ? accent : "#1e1e28", color: tab === tp ? accentText : "#888", fontFamily: MONO, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {tp === "image" ? "🖼 Ảnh" : "▶ YouTube"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 6 }}>
              {tab === "image" ? "URL ảnh (https://...)" : "URL YouTube"}
            </label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus
              placeholder={tab === "image" ? "https://example.com/image.jpg" : "https://youtube.com/watch?v=abc123"}
              style={{ width: "100%", background: "#0a0a0e", border: "1px solid #2a2a32", borderRadius: 8, color: "#e8e8ec", padding: "10px 14px", fontSize: 14, fontFamily: AEONIK, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 6 }}>Chú thích (tùy chọn)</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Mô tả ngắn..."
              style={{ width: "100%", background: "#0a0a0e", border: "1px solid #2a2a32", borderRadius: 8, color: "#e8e8ec", padding: "10px 14px", fontSize: 14, fontFamily: AEONIK, outline: "none", boxSizing: "border-box" }} />
          </div>
          {tab === "image" && (
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 6 }}>Chiều rộng</label>
              <div style={{ display: "flex", gap: 6 }}>
                {([["full", "Toàn trang"], ["half", "Nửa trang"], ["auto", "Tự động"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setFit(v)} style={{ flex: 1, padding: "7px", borderRadius: 7, border: "none", background: fit === v ? accent : "#1e1e28", color: fit === v ? accentText : "#888", fontFamily: MONO, fontSize: 10, cursor: "pointer" }}>{l}</button>
                ))}
              </div>
            </div>
          )}
          {tab === "youtube" && url && (
            <div style={{ padding: "8px 12px", background: "#111", borderRadius: 8, fontSize: 11, fontFamily: MONO, color: getYTId(url) ? "#4adf84" : "#ff7e7e" }}>
              {getYTId(url) ? `✓ Video ID: ${getYTId(url)}` : "⚠ URL không nhận dạng được. Cần định dạng youtube.com/watch?v=..."}
            </div>
          )}
          <button onClick={() => { if (!url.trim()) return; onAdd({ id: `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`, type: tab, url: url.trim(), caption: caption.trim(), fit }); }}
            style={{ background: accent, color: accentText, border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 15, fontFamily: AEONIK, cursor: "pointer", marginTop: 4 }}>
            ✓ Thêm vào trang
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Block shell ──────────────────────────────────────────────
function BlockShell({ id, label, meta, onMeta, onAddMedia, children }: {
  id: string; label: string;
  meta: BlocksMeta; onMeta: (m: Partial<BlocksMeta>) => void;
  onAddMedia: (id: string) => void;
  children: React.ReactNode;
}) {
  const t = useTheme();
  const [hov, setHov] = useState(false);
  const isHidden = meta.hidden.includes(id);
  const idx = meta.order.indexOf(id);

  const toggleHide = () => onMeta({ hidden: isHidden ? meta.hidden.filter((h) => h !== id) : [...meta.hidden, id] });

  const move = (dir: "up" | "down") => {
    const o = [...meta.order];
    const i = o.indexOf(id);
    if (dir === "up" && i > 0) [o[i - 1], o[i]] = [o[i], o[i - 1]];
    else if (dir === "down" && i < o.length - 1) [o[i], o[i + 1]] = [o[i + 1], o[i]];
    onMeta({ order: o });
  };

  const removeMedia = (mid: string) => {
    const next = (meta.media[id] ?? []).filter((m) => m.id !== mid);
    onMeta({ media: { ...meta.media, [id]: next } });
  };

  return (
    <div id={`block-${id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ position: "relative", opacity: isHidden ? 0.38 : 1, transition: "opacity 0.2s", borderLeft: `3px solid ${hov ? t.accent + "88" : "transparent"}` }}>

      {/* Block label strip */}
      {hov && (
        <div style={{ position: "absolute", top: 16, left: 0, zIndex: 20, background: t.accent, color: t.accentText, fontSize: 9, fontWeight: 800, fontFamily: MONO, padding: "3px 8px", borderRadius: "0 4px 4px 0", letterSpacing: "0.1em", pointerEvents: "none" }}>
          {label.toUpperCase()}
        </div>
      )}

      {/* Toolbar */}
      {hov && (
        <div style={{ position: "absolute", top: 12, right: 22, zIndex: 20, display: "flex", gap: 2, background: "#0d0d10", border: `1px solid ${t.accent}44`, borderRadius: 10, padding: "4px 6px", boxShadow: `0 4px 24px rgba(0,0,0,0.8), 0 0 20px -8px ${t.accent}55` }}>
          <TB onClick={toggleHide} title={isHidden ? "Hiển thị khối trên landing page" : "Ẩn khối trên landing page"}>{isHidden ? "👁 Hiện" : "🙈 Ẩn"}</TB>
          <TB onClick={() => move("up")} disabled={idx <= 0} title="Dời lên trên">↑</TB>
          <TB onClick={() => move("down")} disabled={idx >= meta.order.length - 1} title="Dời xuống dưới">↓</TB>
          <TB onClick={() => onAddMedia(id)} title="Thêm ảnh hoặc nhúng video YouTube">🖼 Media</TB>
        </div>
      )}

      {children}

      <MediaBlock items={meta.media[id] ?? []} onRemove={removeMedia} />
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────
function Div({ t }: { t: Theme }) {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.line}, transparent)`, margin: "72px 0 0" }} />;
}

// ─── Add-item button ─────────────────────────────────────────
function AddBtn({ onClick, accent, label = "+ Thêm mục" }: { onClick: () => void; accent: string; label?: string }) {
  return (
    <button onClick={onClick}
      style={{ background: "transparent", border: `1px dashed ${accent}44`, borderRadius: 8, color: accent, padding: "6px 16px", cursor: "pointer", fontFamily: MONO, fontSize: 10, marginTop: 8 }}>
      {label}
    </button>
  );
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ flexShrink: 0, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, padding: "2px 4px", lineHeight: 1 }}>✕</button>
  );
}

// ─── Section editors ─────────────────────────────────────────

function HeroEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ textAlign: "center", padding: "72px 20px 48px", maxWidth: 920, margin: "0 auto" }}>
      <div style={{ display: "inline-block", border: `1px solid ${t.accent}44`, borderRadius: 100, padding: "7px 20px", marginBottom: 32, fontFamily: MONO, fontSize: 11, letterSpacing: "0.15em", color: t.accent }}>
        <ET value={c.heroBadge} onChange={(v) => uc({ heroBadge: v })} />
      </div>
      <h1 style={{ fontFamily: NOE, fontSize: t.heroFontSize, fontWeight: t.heroWeight, lineHeight: 1.06, textTransform: t.heroTransform, letterSpacing: t.heroLetterSpacing, margin: "0 0 20px" }}>
        <ETBlock value={c.heroHeadline1} onChange={(v) => uc({ heroHeadline1: v })} /><br />
        <ETBlock value={c.heroHeadline2} onChange={(v) => uc({ heroHeadline2: v })} /><br />
        <span style={{ color: t.accent, textShadow: t.accentGlow ? `0 0 60px ${t.accent}66` : "none" }}>
          <ETBlock value={c.heroAccentLine} onChange={(v) => uc({ heroAccentLine: v })} />
        </span>
      </h1>
      <ETBlock value={c.heroSub} onChange={(v) => uc({ heroSub: v })}
        style={{ fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.75, color: "#a0a0a0", maxWidth: 680, margin: "0 auto 32px" }} />
      <div style={{ display: "inline-block", background: t.accent, color: t.accentText, fontWeight: 800, fontSize: 16, padding: `${t.btnPaddingY}px ${t.btnPaddingX}px`, borderRadius: t.btnRadius, letterSpacing: "0.03em" }}>
        <ET value={c.heroCta} onChange={(v) => uc({ heroCta: v })} style={{ borderBottom: "none" }} />
        {" — "}
        <ET value={c.price} onChange={(v) => uc({ price: v })} style={{ borderBottom: "1px dashed rgba(0,0,0,0.35)" }} />
        {" VNĐ"}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
        Giá trị thực: <ET value={c.value} onChange={(v) => uc({ value: v })} style={{ textDecoration: "line-through" }} /> VNĐ
      </div>
    </section>
  );
}

function PainEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 760, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
          <ET value={c.painLabel} onChange={(v) => uc({ painLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 28px" }}>
          <ETBlock value={c.painHeading} onChange={(v) => uc({ painHeading: v })} />
        </h2>
      </div>
      <blockquote style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 24, margin: "0 0 32px", fontFamily: SECTRA, fontStyle: "italic", fontSize: "clamp(17px,2.2vw,22px)", color: "#d0d0d0", lineHeight: 1.7 }}>
        <ETBlock value={c.painBlockquote} onChange={(v) => uc({ painBlockquote: v })} />
      </blockquote>
      <ETBlock value={c.painPara} onChange={(v) => uc({ painPara: v })}
        style={{ fontSize: 16, lineHeight: 1.85, color: "#b0b0b0", marginBottom: 28 }} />
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
        <ET value={c.painListHeading} onChange={(v) => uc({ painListHeading: v })} />
      </p>
      {c.painList.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
          <span style={{ color: t.danger, fontFamily: MONO, flexShrink: 0, marginTop: 1 }}>✗</span>
          <ETBlock value={item} onChange={(v) => { const n = [...c.painList]; n[i] = v; uc({ painList: n }); }}
            style={{ flex: 1, fontSize: 15, lineHeight: 1.7, color: "#bdbdbd" }} />
          <DelBtn onClick={() => uc({ painList: c.painList.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn onClick={() => uc({ painList: [...c.painList, "Điền nội dung mục mới..."] })} accent={t.accent} />
    </section>
  );
}

function CycleEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 760, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.cycleLabel} onChange={(v) => uc({ cycleLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 20px" }}>
          <ETBlock value={c.cycleHeading} onChange={(v) => uc({ cycleHeading: v })} />
        </h2>
        <ETBlock value={c.cyclePara} onChange={(v) => uc({ cyclePara: v })}
          style={{ fontSize: 16, lineHeight: 1.8, color: "#b0b0b0" }} />
      </div>
      <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "24px 22px", marginBottom: 24 }}>
        {c.cycleItems.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < c.cycleItems.length - 1 ? 16 : 0, alignItems: "flex-start" }}>
            <span style={{ color: t.danger, fontFamily: MONO, flexShrink: 0 }}>✗</span>
            <div style={{ flex: 1, fontSize: 14, lineHeight: 1.65 }}>
              <ET value={item.fail} onChange={(v) => { const n = [...c.cycleItems]; n[i] = { ...n[i], fail: v }; uc({ cycleItems: n }); }} style={{ fontWeight: 700, color: "#ddd" }} />
              {": "}
              <ET value={item.why} onChange={(v) => { const n = [...c.cycleItems]; n[i] = { ...n[i], why: v }; uc({ cycleItems: n }); }} style={{ color: "#999" }} />
            </div>
          </div>
        ))}
      </div>
      <ETBlock value={c.cycleConclusion} onChange={(v) => uc({ cycleConclusion: v })}
        style={{ fontSize: 16, lineHeight: 1.8, color: "#888", textAlign: "center", fontStyle: "italic" }} />
    </section>
  );
}

function DiscoveryEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 780, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.discoveryLabel} onChange={(v) => uc({ discoveryLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 24px" }}>
          <ETBlock value={c.discoveryHeading} onChange={(v) => uc({ discoveryHeading: v })} />
        </h2>
      </div>
      <ETBlock value={c.discoveryPara1} onChange={(v) => uc({ discoveryPara1: v })}
        style={{ fontSize: 16, lineHeight: 1.85, color: "#b0b0b0", marginBottom: 16 }} />
      <ETBlock value={c.discoveryPara2} onChange={(v) => uc({ discoveryPara2: v })}
        style={{ fontSize: 16, lineHeight: 1.85, color: "#b0b0b0", marginBottom: 28 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        {c.brandCards.map((card, i) => (
          <div key={i} style={{ background: t.card2, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "20px 18px" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: t.accent, marginBottom: 10 }}>
              <ET value={card.brand} onChange={(v) => { const n = [...c.brandCards]; n[i] = { ...n[i], brand: v }; uc({ brandCards: n }); }} />
            </div>
            <ETBlock value={card.q} onChange={(v) => { const n = [...c.brandCards]; n[i] = { ...n[i], q: v }; uc({ brandCards: n }); }}
              style={{ fontWeight: 700, fontSize: 14, color: "#eee", lineHeight: 1.5, marginBottom: 8 }} />
            <ETBlock value={card.a} onChange={(v) => { const n = [...c.brandCards]; n[i] = { ...n[i], a: v }; uc({ brandCards: n }); }}
              style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }} />
          </div>
        ))}
      </div>
      <div style={{ background: `linear-gradient(135deg, ${t.accent}0d, transparent)`, border: `1px solid ${t.accent}22`, borderRadius: t.cardRadius, padding: "22px 20px" }}>
        <ETBlock value={c.insightBox} onChange={(v) => uc({ insightBox: v })}
          style={{ fontSize: 16, lineHeight: 1.8, color: "#d0d0d0" }} />
      </div>
    </section>
  );
}

function SolutionEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 780, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.solutionLabel} onChange={(v) => uc({ solutionLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 16px" }}>
          <ETBlock value={c.solutionHeading} onChange={(v) => uc({ solutionHeading: v })} />
        </h2>
        <ETBlock value={c.solutionSub} onChange={(v) => uc({ solutionSub: v })}
          style={{ fontSize: 16, color: "#888", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }} />
      </div>
      <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "28px 24px" }}>
        {c.benefits.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
            <span style={{ color: t.accent, fontFamily: MONO, flexShrink: 0 }}>✓</span>
            <div style={{ flex: 1 }}>
              <ET value={b.title} onChange={(v) => { const n = [...c.benefits]; n[i] = { ...n[i], title: v }; uc({ benefits: n }); }} style={{ fontWeight: 700 }} />
              {": "}
              <ET value={b.desc} onChange={(v) => { const n = [...c.benefits]; n[i] = { ...n[i], desc: v }; uc({ benefits: n }); }} style={{ fontSize: 15, lineHeight: 1.7, color: "#bdbdbd" }} />
            </div>
            <DelBtn onClick={() => uc({ benefits: c.benefits.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddBtn onClick={() => uc({ benefits: [...c.benefits, { title: "Lợi ích mới", desc: "Mô tả..." }] })} accent={t.accent} />
      </div>
    </section>
  );
}

function MidCtaEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px 0" }}>
      <div style={{ display: "inline-block", background: t.accent, color: t.accentText, fontWeight: 800, fontSize: 16, padding: `${t.btnPaddingY}px ${t.btnPaddingX}px`, borderRadius: t.btnRadius, letterSpacing: "0.03em" }}>
        <ET value={c.midCta} onChange={(v) => uc({ midCta: v })} style={{ borderBottom: "none" }} />{" "}— {c.price} VNĐ
      </div>
    </div>
  );
}

function SkillsEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 940, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.skillsLabel} onChange={(v) => uc({ skillsLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: 0 }}>
          <ETBlock value={c.skillsHeading} onChange={(v) => uc({ skillsHeading: v })} />
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {c.skillCards.map((s, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, overflow: "hidden" }}>
            <div style={{ padding: "22px 20px 18px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: t.accent, letterSpacing: "0.15em", marginBottom: 10 }}>
                KỸ NĂNG <ET value={s.n} onChange={(v) => { const n = [...c.skillCards]; n[i] = { ...n[i], n: v }; uc({ skillCards: n }); }} />
              </div>
              <ETBlock value={s.title} onChange={(v) => { const n = [...c.skillCards]; n[i] = { ...n[i], title: v }; uc({ skillCards: n }); }}
                style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, marginBottom: 10 }} />
              <ETBlock value={s.desc} onChange={(v) => { const n = [...c.skillCards]; n[i] = { ...n[i], desc: v }; uc({ skillCards: n }); }}
                style={{ fontSize: 13.5, lineHeight: 1.65, color: "#999", marginBottom: 12 }} />
              <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: t.danger }}>⚠ </span>
                <ETBlock value={s.warn} onChange={(v) => { const n = [...c.skillCards]; n[i] = { ...n[i], warn: v }; uc({ skillCards: n }); }}
                  style={{ display: "inline", fontSize: 12, color: t.danger, lineHeight: 1.55 }} />
              </div>
              <ImageUploadField
                value={s.gif ?? ""}
                onChange={(v) => { const n = [...c.skillCards]; n[i] = { ...n[i], gif: v }; uc({ skillCards: n }); }}
                label="GIF MINH HỌA CHO KHỐI NÀY"
                accent={t.accent}
              />
            </div>
            {s.gif && (
              <div style={{ borderTop: `1px solid ${t.line}` }}>
                <img src={s.gif} alt={s.title} style={{ width: "100%", display: "block", maxHeight: 220, objectFit: "cover" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function BonusesEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 860, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.bonusesLabel} onChange={(v) => uc({ bonusesLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 12px" }}>
          <ETBlock value={c.bonusesHeading} onChange={(v) => uc({ bonusesHeading: v })} />
        </h2>
        <ETBlock value={c.bonusesSub} onChange={(v) => uc({ bonusesSub: v })} style={{ fontSize: 15, color: "#666" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 24 }}>
        {c.products.map((p, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${t.card}, ${t.card2})`, border: `1px solid ${t.accent}33`, borderRadius: t.cardRadius, padding: "24px 20px" }}>
            <div style={{ fontSize: 30, marginBottom: 12 }}>
              <ET value={p.icon} onChange={(v) => { const n = [...c.products]; n[i] = { ...n[i], icon: v }; uc({ products: n }); }} />
            </div>
            <ETBlock value={p.title} onChange={(v) => { const n = [...c.products]; n[i] = { ...n[i], title: v }; uc({ products: n }); }}
              style={{ fontFamily: NOE, fontSize: 19, fontWeight: 700, marginBottom: 10 }} />
            <ETBlock value={p.desc} onChange={(v) => { const n = [...c.products]; n[i] = { ...n[i], desc: v }; uc({ products: n }); }}
              style={{ fontSize: 14, color: "#999", lineHeight: 1.7 }} />
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", padding: "16px 0 12px" }}>
        <ETBlock value={c.bonusesTitle} onChange={(v) => uc({ bonusesTitle: v })} style={{ fontSize: 18, fontWeight: 800 }} />
      </div>
      {c.bonuses.map((b, i) => (
        <div key={i} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "18px 20px", marginBottom: 10, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ fontSize: 26, flexShrink: 0 }}>
            <ET value={b.icon} onChange={(v) => { const n = [...c.bonuses]; n[i] = { ...n[i], icon: v }; uc({ bonuses: n }); }} />
          </div>
          <div style={{ flex: 1 }}>
            <ETBlock value={b.title} onChange={(v) => { const n = [...c.bonuses]; n[i] = { ...n[i], title: v }; uc({ bonuses: n }); }}
              style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }} />
            <ETBlock value={b.desc} onChange={(v) => { const n = [...c.bonuses]; n[i] = { ...n[i], desc: v }; uc({ bonuses: n }); }}
              style={{ fontSize: 13, color: "#999", lineHeight: 1.65 }} />
          </div>
          <DelBtn onClick={() => uc({ bonuses: c.bonuses.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn onClick={() => uc({ bonuses: [...c.bonuses, { icon: "🎁", title: "Bonus mới", desc: "Mô tả bonus..." }] })} accent={t.accent} />

      {/* Bonus GIF 9:16 */}
      <div style={{ marginTop: 28, padding: "20px 24px", background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.15em", marginBottom: 12 }}>GIF BONUS (ảnh dọc 9:16)</div>
        <ImageUploadField
          value={c.bonusGif ?? ""}
          onChange={(v) => uc({ bonusGif: v })}
          label="UPLOAD GIF 9:16"
          accent={t.accent}
        />
        {c.bonusGif && (
          <div style={{ marginTop: 12, maxWidth: 160, borderRadius: 8, overflow: "hidden", border: `1px solid ${t.accent}33` }}>
            <img src={c.bonusGif} style={{ width: "100%", display: "block", aspectRatio: "9/16", objectFit: "cover" }} />
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <div style={{ display: "inline-block", background: t.accent, color: t.accentText, fontWeight: 800, fontSize: 15, padding: `${t.btnPaddingY}px ${t.btnPaddingX}px`, borderRadius: t.btnRadius }}>
          <ET value={c.bonusesCta} onChange={(v) => uc({ bonusesCta: v })} style={{ borderBottom: "none" }} />
        </div>
      </div>
    </section>
  );
}

function BeforeAfterEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.baLabel} onChange={(v) => uc({ baLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 12px" }}>
          <ET value={c.baHeading} onChange={(v) => uc({ baHeading: v })} />
        </h2>
        <ETBlock value={c.baSub} onChange={(v) => uc({ baSub: v })} style={{ fontSize: 16, color: "#777", lineHeight: 1.7 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {/* Before */}
        <div style={{ background: t.card, border: `1px solid ${t.danger}33`, borderRadius: t.cardRadius, padding: "24px 20px" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.danger, letterSpacing: "0.1em", marginBottom: 16 }}>
            <ET value={c.beforeLabel} onChange={(v) => uc({ beforeLabel: v })} />
          </div>
          {c.beforeItems.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ color: t.danger, flexShrink: 0, fontFamily: MONO }}>✗</span>
              <ETBlock value={item} onChange={(v) => { const n = [...c.beforeItems]; n[i] = v; uc({ beforeItems: n }); }}
                style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: "#b0b0b0" }} />
              <DelBtn onClick={() => uc({ beforeItems: c.beforeItems.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddBtn onClick={() => uc({ beforeItems: [...c.beforeItems, "Mục mới..."] })} accent={t.danger} />
        </div>
        {/* After */}
        <div style={{ background: t.card, border: `1px solid ${t.accent}33`, borderRadius: t.cardRadius, padding: "24px 20px" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.accent, letterSpacing: "0.1em", marginBottom: 16 }}>
            <ET value={c.afterLabel} onChange={(v) => uc({ afterLabel: v })} />
          </div>
          {c.afterItems.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ color: t.accent, flexShrink: 0, fontFamily: MONO }}>✓</span>
              <ETBlock value={item} onChange={(v) => { const n = [...c.afterItems]; n[i] = v; uc({ afterItems: n }); }}
                style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: "#b0b0b0" }} />
              <DelBtn onClick={() => uc({ afterItems: c.afterItems.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddBtn onClick={() => uc({ afterItems: [...c.afterItems, "Mục mới..."] })} accent={t.accent} />
        </div>
      </div>
    </section>
  );
}

function RoadmapEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.roadmapLabel} onChange={(v) => uc({ roadmapLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: 0 }}>
          <ETBlock value={c.roadmapHeading} onChange={(v) => uc({ roadmapHeading: v })} />
        </h2>
      </div>

      {/* Chapter cards — 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 28 }}>
        {c.stages.map((s, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, borderLeft: `3px solid ${t.accent}`, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <ET value={s.n} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], n: v }; uc({ stages: n }); }} style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: t.accent }} />
                <span style={{ color: "#333" }}>·</span>
                <ET value={s.sub} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], sub: v }; uc({ stages: n }); }} style={{ fontSize: 11, color: "#555", fontFamily: MONO }} />
              </div>
              <ETBlock value={s.title} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], title: v }; uc({ stages: n }); }}
                style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }} />
              <ETBlock value={s.desc} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], desc: v }; uc({ stages: n }); }}
                style={{ fontSize: 13, color: "#999", lineHeight: 1.65 }} />
              <div style={{ marginTop: 12, borderTop: `1px solid ${t.line}`, paddingTop: 12 }}>
                <ImageUploadField
                  value={s.gif ?? ""}
                  onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], gif: v }; uc({ stages: n }); }}
                  label={`GIF CHƯƠNG ${i + 1}`}
                  accent={t.accent}
                />
                {s.gif && (
                  <div style={{ marginTop: 8, borderRadius: 6, overflow: "hidden", border: `1px solid ${t.accent}33`, maxWidth: 120 }}>
                    <img src={s.gif} style={{ width: "100%", display: "block" }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chapters GIF upload */}
      <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "20px 22px" }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.15em", marginBottom: 4 }}>ẢNH / GIF BÊN DƯỚI 4 KHỐI CHƯƠNG</div>
        <p style={{ fontSize: 12, color: "#555", fontFamily: MONO, marginBottom: 0 }}>Hiển thị sau lưới 2×2 trên trang</p>
        <ImageUploadField
          value={c.roadmapChaptersGif ?? ""}
          onChange={(v) => uc({ roadmapChaptersGif: v })}
          label="GIF / ẢNH LỘ TRÌNH"
          accent={t.accent}
        />
      </div>
    </section>
  );
}

function InstructorEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.instructorLabel} onChange={(v) => uc({ instructorLabel: v })} />
        </div>
        <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: 0 }}>
          <ETBlock value={c.instructorHeading} onChange={(v) => uc({ instructorHeading: v })} />
        </h2>
      </div>
      <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 20, padding: "36px 32px", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 120, borderRadius: 12, overflow: "hidden", border: `2px solid ${t.accent}55`, background: `linear-gradient(135deg, ${t.accent}22, ${t.accent}08)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {c.instructorPhoto
              ? <img src={c.instructorPhoto} alt={c.instructorName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <span style={{ fontSize: 28, fontWeight: 900, color: t.accent, fontFamily: NOE }}>{c.instructorInitials}</span>
            }
          </div>
          <ImageUploadField
            value={c.instructorPhoto ?? ""}
            onChange={(v) => uc({ instructorPhoto: v })}
            label="ẢNH GIẢNG VIÊN"
            accent={t.accent}
          />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ fontFamily: NOE, fontSize: "clamp(20px,3vw,26px)", fontWeight: 700, marginBottom: 4 }}>
            <ET value={c.instructorName} onChange={(v) => uc({ instructorName: v })} />
          </h3>
          <p style={{ fontSize: 13, color: t.accent, fontWeight: 600, marginBottom: 16, fontFamily: MONO }}>
            <ET value={c.instructorTitle} onChange={(v) => uc({ instructorTitle: v })} />
          </p>
          {c.instructorBio.map((bio, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ color: t.accent, flexShrink: 0, fontFamily: MONO }}>◆</span>
              <ETBlock value={bio} onChange={(v) => { const n = [...c.instructorBio]; n[i] = v; uc({ instructorBio: n }); }}
                style={{ flex: 1, fontSize: 14, lineHeight: 1.7, color: "#bdbdbd" }} />
              <DelBtn onClick={() => uc({ instructorBio: c.instructorBio.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddBtn onClick={() => uc({ instructorBio: [...c.instructorBio, "Thông tin mới về giảng viên..."] })} accent={t.accent} label="+ Thêm dòng bio" />
        </div>
      </div>
    </section>
  );
}

function CtaEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 760, margin: "72px auto 0", padding: "0 20px" }}>
      <div style={{ background: `linear-gradient(135deg, ${t.card}, ${t.card2})`, border: `1px solid ${t.accent}44`, borderRadius: 24, overflow: "hidden" }}>
        <div style={{ background: t.accent, padding: "14px 24px", textAlign: "center" }}>
          <ETBlock value={c.urgencyBar} onChange={(v) => uc({ urgencyBar: v })}
            style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: t.accentText }} />
        </div>
        <div style={{ padding: "40px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
              <ET value={c.ctaLabel} onChange={(v) => uc({ ctaLabel: v })} />
            </div>
            <h2 style={{ fontFamily: NOE, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 16px" }}>
              <ETBlock value={c.ctaHeading} onChange={(v) => uc({ ctaHeading: v })} />
            </h2>
            <ETBlock value={c.ctaSub} onChange={(v) => uc({ ctaSub: v })} style={{ fontSize: 16, color: "#888", lineHeight: 1.7 }} />
          </div>
          <div style={{ background: "#0a0a0c", border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "22px 20px", marginBottom: 20 }}>
            <ETBlock value={c.valueStackTitle} onChange={(v) => uc({ valueStackTitle: v })}
              style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO }} />
            {c.valueStack.map((vs, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10, alignItems: "baseline" }}>
                <ET value={vs.label} onChange={(v) => { const n = [...c.valueStack]; n[i] = { ...n[i], label: v }; uc({ valueStack: n }); }} style={{ fontSize: 14, color: "#bbb" }} />
                <ET value={vs.price} onChange={(v) => { const n = [...c.valueStack]; n[i] = { ...n[i], price: v }; uc({ valueStack: n }); }} style={{ fontSize: 14, color: "#777", fontFamily: MONO }} />
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${t.line}`, marginTop: 12, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#666", textDecoration: "line-through", fontFamily: MONO }}>Tổng: <ET value={c.value} onChange={(v) => uc({ value: v })} style={{ textDecoration: "inherit" }} /> VNĐ</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: t.accent, fontFamily: MONO }}>Hôm nay: <ET value={c.price} onChange={(v) => uc({ price: v })} style={{ borderBottom: "none" }} /> VNĐ</span>
            </div>
          </div>
          <div style={{ padding: "16px 0 0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
            <ETBlock value={c.guarantee} onChange={(v) => uc({ guarantee: v })}
              style={{ fontSize: 14, color: "#cfcfcf", lineHeight: 1.7, fontStyle: "italic", maxWidth: 520, margin: "0 auto" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <footer style={{ textAlign: "center", padding: "60px 20px 40px", borderTop: `1px solid ${t.line}`, marginTop: 72 }}>
      <div style={{ fontFamily: NOE, fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
        <ET value={c.footerBrand} onChange={(v) => uc({ footerBrand: v })} />
        <span style={{ color: t.accent }}><ET value={c.footerDot} onChange={(v) => uc({ footerDot: v })} /></span>
        DESIGN
      </div>
      <ETBlock value={c.footerTagline} onChange={(v) => uc({ footerTagline: v })}
        style={{ fontSize: 13, color: "#555", marginBottom: 20, fontFamily: MONO }} />
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {c.footerLinks.map((link, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ET value={link} onChange={(v) => { const n = [...c.footerLinks]; n[i] = v; uc({ footerLinks: n }); }} style={{ fontSize: 13, color: "#555" }} />
            <DelBtn onClick={() => uc({ footerLinks: c.footerLinks.filter((_, j) => j !== i) })} />
          </span>
        ))}
        <button onClick={() => uc({ footerLinks: [...c.footerLinks, "Link mới"] })}
          style={{ background: "transparent", border: `1px dashed ${t.accent}33`, borderRadius: 4, color: t.accent, padding: "2px 8px", cursor: "pointer", fontFamily: MONO, fontSize: 10 }}>+</button>
      </div>
      <ETBlock value={c.footerCopyright} onChange={(v) => uc({ footerCopyright: v })}
        style={{ fontSize: 12, color: "#333", fontFamily: MONO }} />
    </footer>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ meta, onMeta }: { meta: BlocksMeta; onMeta: (m: Partial<BlocksMeta>) => void }) {
  const t = useTheme();

  const scrollTo = (id: string) => {
    document.getElementById(`block-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleHide = (id: string) => {
    onMeta({ hidden: meta.hidden.includes(id) ? meta.hidden.filter((h) => h !== id) : [...meta.hidden, id] });
  };

  const move = (id: string, dir: "up" | "down") => {
    const o = [...meta.order];
    const i = o.indexOf(id);
    if (dir === "up" && i > 0) [o[i - 1], o[i]] = [o[i], o[i - 1]];
    else if (dir === "down" && i < o.length - 1) [o[i], o[i + 1]] = [o[i + 1], o[i]];
    onMeta({ order: o });
  };

  const addCustom = () => {
    const id = `custom-${Date.now()}`;
    onMeta({
      order: [...meta.order, id],
      custom: { ...meta.custom, [id]: { title: "Tiêu đề mục mới", body: "Nhập nội dung của bạn tại đây..." } },
    });
    setTimeout(() => document.getElementById(`block-${id}`)?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div style={{ width: 236, flexShrink: 0, background: "#0d0d10", borderRight: "1px solid #1a1a22", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #1a1a22", fontSize: 9, fontFamily: MONO, color: "#444", letterSpacing: "0.1em" }}>
        📋 THỨ TỰ CÁC KHỐI
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
        {meta.order.map((id, idx) => {
          const def = BLOCK_DEFS.find((b) => b.id === id);
          const isHidden = meta.hidden.includes(id);
          const isCustom = id.startsWith("custom-");
          return (
            <div key={id}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 8px", borderRadius: 7, marginBottom: 2, opacity: isHidden ? 0.35 : 1, transition: "background 0.12s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#14141c"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
              <span style={{ fontSize: 11, flexShrink: 0 }}>{def?.icon ?? "⬜"}</span>
              <span onClick={() => scrollTo(id)}
                style={{ flex: 1, fontSize: 11, fontFamily: AEONIK, color: isHidden ? "#555" : "#ccc", cursor: "pointer", userSelect: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={def?.label ?? id}>
                {def?.label ?? (isCustom ? "Custom Block" : id)}
              </span>
              <button onClick={() => move(id, "up")} disabled={idx === 0}
                style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "#2a2a33" : "#666", fontSize: 10, padding: "1px 2px", fontFamily: MONO }}>↑</button>
              <button onClick={() => move(id, "down")} disabled={idx === meta.order.length - 1}
                style={{ background: "none", border: "none", cursor: idx === meta.order.length - 1 ? "default" : "pointer", color: idx === meta.order.length - 1 ? "#2a2a33" : "#666", fontSize: 10, padding: "1px 2px", fontFamily: MONO }}>↓</button>
              <button onClick={() => toggleHide(id)} title={isHidden ? "Hiện" : "Ẩn"}
                style={{ background: "none", border: "none", cursor: "pointer", color: isHidden ? t.accent : "#444", fontSize: 11, padding: "1px 2px" }}>
                {isHidden ? "👁" : "🙈"}
              </button>
              {(meta.media?.[id]?.length ?? 0) > 0 && (
                <button
                  onClick={() => {
                    const { [id]: _removed, ...restMedia } = meta.media ?? {};
                    onMeta({ ...meta, media: restMedia });
                  }}
                  title={`Xóa ${meta.media![id].length} ảnh/video`}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#e05252", fontSize: 9, padding: "1px 3px", fontFamily: MONO, lineHeight: 1 }}>
                  🖼{meta.media![id].length}
                </button>
              )}
              {isCustom && (
                <button onClick={() => {
                  const newOrder = meta.order.filter((oid) => oid !== id);
                  const { [id]: _, ...rest } = meta.custom;
                  onMeta({ order: newOrder, custom: rest });
                }} title="Xóa khối tùy chỉnh"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 10, padding: "1px 2px" }}>🗑</button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "8px", borderTop: "1px solid #1a1a22" }}>
        <button onClick={addCustom}
          style={{ width: "100%", padding: "8px", background: "transparent", border: `1px dashed ${t.accent}44`, borderRadius: 8, color: t.accent, cursor: "pointer", fontFamily: MONO, fontSize: 10, transition: "background 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${t.accent}11`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
          + Thêm khối tùy chỉnh
        </button>
        <div style={{ fontSize: 9, color: "#333", fontFamily: MONO, textAlign: "center", marginTop: 6 }}>
          Click tên → cuộn · 🙈 → ẩn trên landing
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EDITOR ──────────────────────────────────────────────
export default function Editor() {
  const t = useTheme();
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [mediaFor, setMediaFor] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    loadContent().then((c) => { setContent(c); setDirty(false); });
  }, []);

  const uc = useCallback((patch: Partial<PageContent>) => {
    setContent((c) => ({ ...c, ...patch }));
    setDirty(true);
  }, []);

  const meta: BlocksMeta = content.blocksMeta ?? DEFAULT_META;

  const onMeta = useCallback((patch: Partial<BlocksMeta>) => {
    setContent((c) => ({ ...c, blocksMeta: { ...(c.blocksMeta ?? DEFAULT_META), ...patch } }));
    setDirty(true);
  }, []);

  const addMedia = (blockId: string, item: MediaItem) => {
    const current = meta.media[blockId] ?? [];
    onMeta({ media: { ...meta.media, [blockId]: [...current, item] } });
    setMediaFor(null);
  };

  const handleSave = async () => {
    setStatus("saving");
    (document.activeElement as HTMLElement)?.blur();
    try {
      await saveContent(content);
      setDirty(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2800);
    } catch {
      setStatus("idle");
      alert("Lưu thất bại — hãy kiểm tra kết nối đến API server.");
    }
  };

  const handleRevert = async () => {
    const latest = await loadContent();
    setContent(latest);
    setDirty(false);
    setResetKey((k) => k + 1);
  };

  const handleResetDefault = async () => {
    if (!confirm("Đặt lại toàn bộ nội dung về mặc định? Thao tác này sẽ xóa mọi thay đổi đã lưu.")) return;
    const fresh = { ...DEFAULT_CONTENT };
    await saveContent(fresh);
    setContent(fresh);
    setDirty(false);
    setResetKey((k) => k + 1);
  };

  const renderBlock = (id: string): React.ReactNode => {
    const def = BLOCK_DEFS.find((b) => b.id === id);
    const label = def?.label ?? (id.startsWith("custom-") ? "Custom Block" : id);

    const wrap = (children: React.ReactNode) => (
      <BlockShell key={id} id={id} label={label} meta={meta} onMeta={onMeta} onAddMedia={setMediaFor}>
        {children}
      </BlockShell>
    );

    switch (id) {
      case "hero":         return wrap(<HeroEdit c={content} uc={uc} t={t} />);
      case "pain":         return wrap(<><Div t={t} /><PainEdit c={content} uc={uc} t={t} /></>);
      case "cycle":        return wrap(<><Div t={t} /><CycleEdit c={content} uc={uc} t={t} /></>);
      case "discovery":    return wrap(<><Div t={t} /><DiscoveryEdit c={content} uc={uc} t={t} /></>);
      case "solution":     return wrap(<><Div t={t} /><SolutionEdit c={content} uc={uc} t={t} /></>);
      case "midcta":       return wrap(<MidCtaEdit c={content} uc={uc} t={t} />);
      case "skills":       return wrap(<><Div t={t} /><SkillsEdit c={content} uc={uc} t={t} /></>);
      case "bonuses":      return wrap(<><Div t={t} /><BonusesEdit c={content} uc={uc} t={t} /></>);
      case "before-after": return wrap(<><Div t={t} /><BeforeAfterEdit c={content} uc={uc} t={t} /></>);
      case "roadmap":      return wrap(<><Div t={t} /><RoadmapEdit c={content} uc={uc} t={t} /></>);
      case "instructor":   return wrap(<><Div t={t} /><InstructorEdit c={content} uc={uc} t={t} /></>);
      case "cta":          return wrap(<><Div t={t} /><CtaEdit c={content} uc={uc} t={t} /></>);
      case "footer":       return wrap(<FooterEdit c={content} uc={uc} t={t} />);
      default:
        if (id.startsWith("custom-")) {
          const cblock = meta.custom[id] ?? { title: "Custom Block", body: "Nhập nội dung..." };
          return wrap(
            <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px 20px 0" }}>
              <ETBlock value={cblock.title} onChange={(v) => onMeta({ custom: { ...meta.custom, [id]: { ...cblock, title: v } } })}
                style={{ fontFamily: NOE, fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, marginBottom: 20, lineHeight: 1.15 }} />
              <ETBlock value={cblock.body} onChange={(v) => onMeta({ custom: { ...meta.custom, [id]: { ...cblock, body: v } } })}
                style={{ fontSize: 16, lineHeight: 1.85, color: "#b0b0b0" }} />
            </section>
          );
        }
        return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#08080a", color: "#fff", fontFamily: AEONIK }}>

      {/* ─── Header ─── */}
      <header style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid #1a1a22", background: "#0d0d10", flexShrink: 0, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/admin" style={{ fontFamily: MONO, fontSize: 11, color: "#555", textDecoration: "none" }}>← Admin</a>
          <div style={{ width: 1, height: 14, background: "#222" }} />
          <div style={{ fontFamily: MONO, fontSize: 11, color: t.accent, letterSpacing: "0.1em" }}>✏ VISUAL EDITOR</div>
          {dirty && (
            <div style={{ fontSize: 9, fontFamily: MONO, color: "#f0a020", background: "#2a1800", border: "1px solid #4a3000", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.06em" }}>
              ● CHƯA LƯU
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontFamily: MONO, color: "#444" }}>
          <span>Click vào text để chỉnh sửa · Hover khối để thấy toolbar</span>
          <button onClick={handleResetDefault}
            title="Đặt lại nội dung về mặc định"
            style={{ background: "transparent", border: "1px solid #2a1a1a", borderRadius: 6, color: "#664444", cursor: "pointer", padding: "4px 10px", fontFamily: MONO, fontSize: 10, transition: "all 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ff7e7e"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#662222"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#664444"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a1a1a"; }}>
            ↺ Reset mặc định
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ color: "#666", textDecoration: "none", padding: "4px 10px", border: "1px solid #222", borderRadius: 6 }}>
            👁 Xem trang
          </a>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar meta={meta} onMeta={onMeta} />

        {/* Editor canvas — resetKey forces full remount on revert */}
        <main key={resetKey} style={{ flex: 1, overflowY: "auto", background: t.bg }}>
          <div style={{ paddingBottom: 140 }}>
            {meta.order.map((id) => renderBlock(id))}
          </div>
        </main>
      </div>

      {/* ─── Floating Save ─── */}
      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", gap: 8, alignItems: "center" }}>
        {dirty && (
          <button onClick={handleRevert}
            style={{ background: "#0d0d10", border: "1px solid #2a2a32", borderRadius: 12, padding: "11px 18px", color: "#888", fontFamily: MONO, fontSize: 11, cursor: "pointer" }}>
            ↩ Hoàn tác
          </button>
        )}
        <button onClick={handleSave} disabled={!dirty}
          style={{
            background: !dirty ? "#141420" : status === "saved" ? "#1a6b40" : t.accent,
            color: !dirty ? "#444" : status === "saved" ? "#7effc0" : t.accentText,
            border: "none", borderRadius: 14, padding: "13px 32px",
            fontWeight: 800, fontSize: 14, fontFamily: AEONIK,
            cursor: dirty ? "pointer" : "default",
            boxShadow: dirty && status !== "saved" ? `0 6px 40px ${t.accent}55, 0 2px 8px rgba(0,0,0,0.4)` : "0 2px 8px rgba(0,0,0,0.3)",
            transition: "all 0.2s", minWidth: 200, textAlign: "center",
          }}>
          {status === "saving" ? "⏳ Đang lưu..." : status === "saved" ? "✓ Đã lưu — Landing page đã cập nhật" : dirty ? "💾 Lưu & Cập nhật Landing Page" : "✓ Chưa có thay đổi"}
        </button>
      </div>

      {/* ─── Media Modal ─── */}
      {mediaFor && (
        <AddMediaModal
          accent={t.accent}
          accentText={t.accentText}
          onClose={() => setMediaFor(null)}
          onAdd={(item) => addMedia(mediaFor, item)}
        />
      )}
    </div>
  );
}
