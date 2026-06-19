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
  { id: "products", label: "Sản phẩm chi tiết", icon: "📦" },
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

// ─── Mini SVG icon helpers (mirrors App.tsx unified system) ────
// All icons: 40×40 viewBox, stroke 1.8px, accent-reactive
const IC_CSS = `@keyframes ic-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`;
let _edIcInj = false;
function injectEdIc() {
  if (_edIcInj) return; _edIcInj = true;
  const s = document.createElement("style"); s.textContent = IC_CSS; document.head.appendChild(s);
}
function EdIconBook({ c }: { c: string }) {
  injectEdIc();
  return (
    <svg width={36} height={36} viewBox="0 0 40 40" fill="none"
      style={{ display: "block", animation: "ic-float 3.2s ease-in-out infinite", overflow: "visible" }}>
      <line x1="20" y1="8" x2="20" y2="34" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 10 C14 10 8 12 8 15 L8 34 C8 31 14 29 20 29 Z" fill={`${c}18`} stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M20 10 C26 10 32 12 32 15 L32 34 C32 31 26 29 20 29 Z" fill={`${c}0d`} stroke={`${c}99`} strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="11" y1="17" x2="18" y2="16.5" stroke={`${c}88`} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="20.5" x2="18" y2="20" stroke={`${c}66`} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20" cy="8" r="2" fill={c} style={{ filter: `drop-shadow(0 0 4px ${c})` }}/>
    </svg>
  );
}
function EdIconVideo({ c }: { c: string }) {
  injectEdIc();
  return (
    <svg width={36} height={36} viewBox="0 0 40 40" fill="none"
      style={{ display: "block", animation: "ic-float 3.2s ease-in-out infinite", overflow: "visible" }}>
      <rect x="4" y="7" width="32" height="22" rx="3" stroke={c} strokeWidth="1.8" fill={`${c}10`}/>
      <line x1="20" y1="29" x2="20" y2="35" stroke={`${c}88`} strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="35" x2="26" y2="35" stroke={`${c}88`} strokeWidth="2" strokeLinecap="round"/>
      <polygon points="16,13 16,25 28,19" fill={c} style={{ filter: `drop-shadow(0 0 5px ${c})` }}/>
      <circle cx="32" cy="10" r="1.5" fill={`${c}66`}/>
    </svg>
  );
}


// ─── Inline contenteditable text ─────────────────────────────
function ET({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const vRef = useRef(value);
  
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
      vRef.current = value;
    }
  }, [value]);

  const flush = (el: HTMLElement) => {
    const t = el.textContent ?? "";
    if (t !== vRef.current) { vRef.current = t; onChange(t); }
  };
  return (
    <span ref={ref} contentEditable suppressContentEditableWarning
      onInput={(e) => flush(e.currentTarget)}
      onBlur={(e) => flush(e.currentTarget)}
      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
      style={{ outline: "none", cursor: "text", borderBottom: "1px dashed rgba(0,240,255,0.35)", minWidth: 4, ...style }} />
  );
}

function ETBlock({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const vRef = useRef(value);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
      vRef.current = value;
    }
  }, [value]);

  const flush = (el: HTMLElement) => {
    const t = el.textContent ?? "";
    if (t !== vRef.current) { vRef.current = t; onChange(t); }
  };
  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      onInput={(e) => flush(e.currentTarget)}
      onBlur={(e) => flush(e.currentTarget)}
      style={{ outline: "none", cursor: "text", borderBottom: "1px dashed rgba(0,240,255,0.2)", minHeight: "1.1em", minWidth: 4, ...style }} />
  );
}

// ─── Image / GIF upload field ─────────────────────────────────
// ─── Upload helper: file → base64 → POST /api/upload → returns URL ───
async function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, data: reader.result as string }),
        });
        const json = await res.json() as { url?: string; message?: string };
        if (!res.ok) throw new Error(json.message ?? "Upload failed");
        resolve(json.url!);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({ value, onChange, label, accent }: {
  value: string; onChange: (v: string) => void; label: string; accent: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [assets, setAssets] = useState<{ name: string; url: string }[]>([]);

  const doUpload = async (file: File) => {
    setUploading(true); setError("");
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (e) {
      setError(String(e));
    } finally { setUploading(false); }
  };

  const handleFile = (file: File | undefined) => { if (file) doUpload(file); };

  const loadAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      const json = await res.json() as { assets: { name: string; url: string }[] };
      setAssets(json.assets ?? []);
    } catch { setAssets([]); }
  };

  return (
    <div style={{ marginTop: 12, borderTop: "1px solid #1a1a22", paddingTop: 12 }}>
      <div style={{ fontSize: 10, color: "#555", fontFamily: MONO, letterSpacing: "0.12em", marginBottom: 8 }}>{label}</div>
      {value ? (
        <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid #2a2a32", marginBottom: 6 }}>
          <img src={value} alt="" style={{ width: "100%", display: "block", maxHeight: 180, objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 5, right: 5, display: "flex", gap: 4 }}>
            <button onClick={() => { fileRef.current?.click(); }}
              style={{ background: "rgba(0,0,0,0.85)", border: `1px solid ${accent}44`, borderRadius: 5, color: accent, cursor: "pointer", padding: "2px 8px", fontSize: 10, fontFamily: MONO }}>✎ Đổi</button>
            <button onClick={() => onChange("")}
              style={{ background: "rgba(0,0,0,0.85)", border: "1px solid #cc2222", borderRadius: 5, color: "#ff7e7e", cursor: "pointer", padding: "2px 8px", fontSize: 10, fontFamily: MONO }}>✕ Xóa</button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${dragging ? accent : "#2a2a32"}`,
            borderRadius: 10, padding: "16px 12px", textAlign: "center", marginBottom: 6,
            background: dragging ? `${accent}08` : "transparent",
            transition: "all 0.15s",
          }}
        >
          {uploading ? (
            <div style={{ fontSize: 11, color: accent, fontFamily: MONO }}>⏳ Đang tải lên...</div>
          ) : (
            <>
              <div style={{ fontSize: 22, marginBottom: 6 }}>📁</div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 8 }}>Kéo ảnh vào đây hoặc</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => fileRef.current?.click()}
                  style={{ background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 6, color: accent, cursor: "pointer", padding: "5px 12px", fontSize: 10, fontFamily: MONO }}>
                  📤 Chọn file từ máy
                </button>
                <button onClick={async () => { await loadAssets(); setShowAssets(v => !v); }}
                  style={{ background: "#1e1e28", border: "1px solid #2a2a32", borderRadius: 6, color: "#888", cursor: "pointer", padding: "5px 12px", fontSize: 10, fontFamily: MONO }}>
                  🖼 Thư viện
                </button>
              </div>
              <div style={{ marginTop: 8 }}>
                <input type="url" placeholder="hoặc dán URL..."
                  onBlur={(e) => { if (e.target.value) { onChange(e.target.value); e.target.value = ""; } }}
                  style={{ background: "transparent", border: "none", borderBottom: "1px dashed #333", color: "#888", fontSize: 10, fontFamily: MONO, width: 160, outline: "none", textAlign: "center" }} />
              </div>
            </>
          )}
        </div>
      )}
      {/* Asset picker mini-grid */}
      {showAssets && (
        <div style={{ background: "#0a0a0e", border: "1px solid #1e1e28", borderRadius: 8, padding: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: "#555", fontFamily: MONO, marginBottom: 6 }}>THƯ VIỆN ẢNH ĐÃ TẢI LÊN</div>
          {assets.length === 0 ? (
            <div style={{ fontSize: 10, color: "#444", fontFamily: MONO, textAlign: "center", padding: 8 }}>Chưa có ảnh nào được tải lên</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
              {assets.map(a => (
                <button key={a.url} onClick={() => { onChange(a.url); setShowAssets(false); }}
                  title={a.name}
                  style={{ background: "transparent", border: "1px solid #2a2a32", borderRadius: 5, padding: 2, cursor: "pointer", overflow: "hidden" }}>
                  <img src={a.url} alt={a.name} style={{ width: "100%", height: 48, objectFit: "cover", display: "block", borderRadius: 3 }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <div style={{ fontSize: 10, color: "#ff5555", fontFamily: MONO, marginTop: 4 }}>{error}</div>}
      <input ref={fileRef} type="file" accept="image/gif,image/jpeg,image/png,image/webp,image/svg+xml"
        style={{ display: "none" }}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
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

// ─── Add media modal (Point 3: YouTube/Vimeo + upload) ────────
function AddMediaModal({ onClose, onAdd, accent, accentText }: {
  onClose: () => void; onAdd: (item: MediaItem) => void; accent: string; accentText: string;
}) {
  const [tab, setTab] = useState<"upload" | "url" | "youtube">("upload");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [fit, setFit] = useState<"full" | "half" | "auto">("full");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [assets, setAssets] = useState<{ name: string; url: string }[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    setUploading(true); setUploadError("");
    try {
      const uploadedUrl = await uploadFile(file);
      onAdd({ id: `m${Date.now()}`, type: "image", url: uploadedUrl, caption: caption.trim(), fit });
    } catch (e) { setUploadError(String(e)); }
    finally { setUploading(false); }
  };

  const loadAssets = async () => {
    if (assets !== null) return;
    try {
      const res = await fetch("/api/assets");
      const json = await res.json() as { assets: { name: string; url: string }[] };
      setAssets(json.assets ?? []);
    } catch { setAssets([]); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#0f0f12", border: "1px solid #2a2a32", borderRadius: 16, padding: "28px 32px", width: 480, maxWidth: "92vw", color: "#e8e8ec", fontFamily: AEONIK, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, margin: 0, color: accent, letterSpacing: "0.1em" }}>+ THÊM MÉDIA VÀO KHỐI</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20, padding: "0 4px" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0a0a0e", borderRadius: 10, padding: 4 }}>
          {(["upload", "url", "youtube"] as const).map((tp) => (
            <button key={tp} onClick={() => { setTab(tp); if (tp === "url") loadAssets(); }}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 7, border: "none",
                background: tab === tp ? accent : "transparent",
                color: tab === tp ? accentText : "#666",
                fontFamily: MONO, fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
              {tp === "upload" ? "📤 Tải ảnh" : tp === "url" ? "🖼 URL / Thư viện" : "▶ YouTube"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* TAB: UPLOAD */}
          {tab === "upload" && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); doUpload(e.dataTransfer.files[0]); }}
                onClick={() => !uploading && fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? accent : "#2a2a32"}`,
                  borderRadius: 12, padding: "36px 20px", textAlign: "center",
                  background: dragging ? `${accent}0a` : "#07070a",
                  cursor: uploading ? "default" : "pointer", transition: "all 0.15s",
                }}
              >
                {uploading ? (
                  <div style={{ fontSize: 13, color: accent, fontFamily: MONO }}>⏳ Đang tải lên...</div>
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🗳</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Kéo ảnh / GIF vào đây</div>
                    <div style={{ fontSize: 12, color: "#555", fontFamily: MONO }}>hoặc click để chọn file từ máy</div>
                    <div style={{ marginTop: 8, fontSize: 10, color: "#333", fontFamily: MONO }}>JPG, PNG, GIF, WebP, SVG</div>
                  </>
                )}
              </div>
              {uploadError && <div style={{ fontSize: 11, color: "#ff5555", fontFamily: MONO }}>{uploadError}</div>}
              <input ref={fileRef} type="file" accept="image/gif,image/jpeg,image/png,image/webp,image/svg+xml"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f); e.target.value = ""; }} />
            </>
          )}

          {/* TAB: URL / THƯ VIỆN */}
          {tab === "url" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 6 }}>URL ảnh (https://...)</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus
                  placeholder="https://example.com/image.jpg"
                  style={{ width: "100%", background: "#0a0a0e", border: "1px solid #2a2a32", borderRadius: 8, color: "#e8e8ec", padding: "10px 14px", fontSize: 14, fontFamily: AEONIK, outline: "none", boxSizing: "border-box" }} />
              </div>
              {/* THƯ VIỆN */}
              {assets !== null && (
                <div>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: MONO, marginBottom: 6 }}>THƯ VIỆN ẢNH ĐÃ TẢI LÊN</div>
                  {assets.length === 0 ? (
                    <div style={{ fontSize: 11, color: "#444", fontFamily: MONO, textAlign: "center", padding: 12 }}>Chưa có ảnh nào — tải lên ở tab "📤 Tải ảnh"</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                      {assets.map(a => (
                        <button key={a.url} onClick={() => setUrl(a.url)} title={a.name}
                          style={{ background: url === a.url ? `${accent}22` : "transparent", border: url === a.url ? `1px solid ${accent}` : "1px solid #2a2a32", borderRadius: 6, padding: 2, cursor: "pointer", overflow: "hidden" }}>
                          <img src={a.url} alt={a.name} style={{ width: "100%", height: 52, objectFit: "cover", display: "block", borderRadius: 4 }}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          <div style={{ fontSize: 8, color: "#555", fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "2px 2px" }}>{a.name.split("_").slice(1).join("_") || a.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB: YOUTUBE */}
          {tab === "youtube" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 6 }}>Dán link YouTube hoặc Vimeo</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus
                  placeholder="https://youtube.com/watch?v=abc123"
                  style={{ width: "100%", background: "#0a0a0e", border: "1px solid #2a2a32", borderRadius: 8, color: "#e8e8ec", padding: "10px 14px", fontSize: 14, fontFamily: AEONIK, outline: "none", boxSizing: "border-box" }} />
              </div>
              {url && (
                <div style={{ padding: "8px 12px", background: "#111", borderRadius: 8, fontSize: 11, fontFamily: MONO, color: getYTId(url) ? "#4adf84" : "#ff7e7e" }}>
                  {getYTId(url) ? `✓ Video ID: ${getYTId(url)} — sẵ nhúng vào khối` : "⚠ URL không nhận dạng được. Cần định dạng youtube.com/watch?v=..."}
                </div>
              )}
              {/* Preview */}
              {getYTId(url) && (
                <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #2a2a32" }}>
                  <YTEmbed ytId={getYTId(url)!} />
                </div>
              )}
            </>
          )}

          {/* Caption + Width (cho image tabs) */}
          {(tab === "url" || tab === "youtube") && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 6 }}>Chú thích (tuỳ chọn)</label>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Mô tả ngắn..."
                  style={{ width: "100%", background: "#0a0a0e", border: "1px solid #2a2a32", borderRadius: 8, color: "#e8e8ec", padding: "10px 14px", fontSize: 14, fontFamily: AEONIK, outline: "none", boxSizing: "border-box" }} />
              </div>
              {tab === "url" && (
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: MONO, marginBottom: 6 }}>Chiều rộng</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {([["full", "Toàn trang"], ["half", "Nửa trang"], ["auto", "Tự động"]] as const).map(([v, l]) => (
                      <button key={v} onClick={() => setFit(v)} style={{ flex: 1, padding: "7px", borderRadius: 7, border: "none", background: fit === v ? accent : "#1e1e28", color: fit === v ? accentText : "#888", fontFamily: MONO, fontSize: 10, cursor: "pointer" }}>{l}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit button */}
          {(tab === "url" || tab === "youtube") && (
            <button
              disabled={!url.trim() || (tab === "youtube" && !getYTId(url))}
              onClick={() => {
                if (!url.trim()) return;
                onAdd({ id: `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`, type: tab === "youtube" ? "youtube" : "image", url: url.trim(), caption: caption.trim(), fit });
              }}
              style={{
                background: (!url.trim() || (tab === "youtube" && !getYTId(url))) ? "#1e1e28" : accent,
                color: (!url.trim() || (tab === "youtube" && !getYTId(url))) ? "#444" : accentText,
                border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 15,
                fontFamily: AEONIK, cursor: "pointer", marginTop: 4,
              }}
            >
              {tab === "youtube" ? "▶ Nhúng video vào trang" : "✓ Thêm ảnh vào trang"}
            </button>
          )}
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
    <section style={{ position: "relative", textAlign: "center", padding: "64px 20px 0", maxWidth: 960, margin: "0 auto" }}>
      {/* Grid background — same as App.tsx */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${t.accent}08 1px, transparent 1px), linear-gradient(90deg, ${t.accent}08 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
      }} />
      <div>
        {/* Badge */}
        <div style={{
          display: "inline-block", border: `1px solid ${t.accent}44`,
          borderRadius: 100, padding: "7px 18px", marginBottom: 36,
          fontFamily: t.fontMono, fontSize: 11, letterSpacing: "0.15em",
          color: t.accent, textTransform: "uppercase",
        }}>
          <ET value={c.heroBadge} onChange={(v) => uc({ heroBadge: v })} />
        </div>
        {/* Headline — same style as App.tsx h1 */}
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
          <ETBlock value={c.heroHeadline1} onChange={(v) => uc({ heroHeadline1: v })} /><br />
          <ETBlock value={c.heroHeadline2} onChange={(v) => uc({ heroHeadline2: v })} />
        </h1>
        {/* Accent line — italic SECTRA just like App.tsx */}
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
          <ETBlock value={c.heroAccentLine} onChange={(v) => uc({ heroAccentLine: v })} style={{ fontStyle: "italic" }} />
        </p>
        {/* Sub paragraph */}
        <ETBlock value={c.heroSub} onChange={(v) => uc({ heroSub: v })}
          style={{ fontSize: "clamp(14px,1.6vw,17px)", lineHeight: 1.75, color: t.textMuted ?? "#888", maxWidth: 640, margin: "0 auto 36px" }} />
        {/* CTA Button */}
        <div style={{
          display: "inline-block",
          background: t.accent, color: t.accentText, fontWeight: 800, fontSize: 16,
          padding: `${t.btnPaddingY}px ${t.btnPaddingX}px`, borderRadius: t.btnRadius, letterSpacing: "0.03em",
          boxShadow: t.accentGlow ? `0 0 32px -2px ${t.accent}66` : "none",
        }}>
          <ET value={c.heroCta} onChange={(v) => uc({ heroCta: v })} style={{ borderBottom: "none" }} />
          {" — "}
          <ET value={c.price} onChange={(v) => uc({ price: v })} style={{ borderBottom: "1px dashed rgba(0,0,0,0.35)" }} />
          {" VNĐ"}
        </div>
        <p style={{ fontSize: 15, color: t.textMuted ?? "#888", marginTop: 14, fontStyle: "italic" }}>
          (Nhận ngay quyền truy cập trọn đời)
        </p>
        <p style={{ fontSize: 15, color: t.textMuted ?? "#777", marginTop: 6 }}>
          <ET value={c.heroSubPrice ?? `Giá gốc: ${c.value} VNĐ — Tiết kiệm 80% hôm nay`} onChange={(v) => uc({ heroSubPrice: v })} />
        </p>
      </div>

      {/* 2-column GIF product preview — same as App.tsx */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 20, margin: "52px auto 0", maxWidth: 940, textAlign: "left",
      }}>
        {/* Col 1 — Ebook */}
        <div style={{ background: t.card, border: `1px solid ${t.accent}28`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "22px 22px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: t.accent, letterSpacing: "0.15em", textTransform: "uppercase" }}>📖 Ebook PDF</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.45, color: t.textBase ?? "#f0f0f0", marginBottom: 8 }}>
              Ấn phẩm kỹ thuật số dày hơn 500 trang
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: t.textBody ?? "#b0b0b0" }}>
              Được dàn trang với tiêu chuẩn khắt khe nhất về hệ thống lưới (Grid). Bóc tách trọn vẹn đặc tính của 4 dòng font huyết mạch và phân tích Case Study.
            </p>
          </div>
          {/* GIF ebook — App.tsx hardcodes /book-preview.gif */}
          <img src="/book-preview.gif" alt="Ebook Preview"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            style={{ width: "100%", display: "block", borderTop: `1px solid ${t.line}` }} />
        </div>

        {/* Col 2 — Video */}
        <div style={{ background: t.card, border: `1px solid ${t.accent}28`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "22px 22px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: t.accent, letterSpacing: "0.15em", textTransform: "uppercase" }}>🎬 Video Course</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.45, color: t.textBase ?? "#f0f0f0", marginBottom: 8 }}>
              Truy cập 80+ Video phân loại chặt chẽ
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: t.textBody ?? "#b0b0b0" }}>
              Hệ thống hóa trên nền tảng Skool chuyên nghiệp. Từng video là một "ca phẫu thuật" chữ viết. Xem lại mọi lúc, tra cứu mọi nơi.
            </p>
          </div>
          <img src={c.productsVideoGif ?? "/video-preview2.gif"} alt="Video Preview"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            style={{ width: "100%", display: "block", borderTop: `1px solid ${t.line}` }} />
        </div>
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
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 28px" }}>
          <ETBlock value={c.painHeading} onChange={(v) => uc({ painHeading: v })} />
        </h2>
      </div>
      <blockquote style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 24, margin: "0 0 32px", fontFamily: t.blockquoteFontFamily ?? t.fontAccent, fontStyle: t.blockquoteFontStyle ?? "italic", fontWeight: t.blockquoteFontWeight ?? 400, fontSize: t.blockquoteFontSize ?? "clamp(17px,2.2vw,22px)", color: t.textBody ?? "#d0d0d0", lineHeight: 1.7 }}>
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
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 20px" }}>
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
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 24px" }}>
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
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 16px" }}>
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

// ─── Products section ("Trải nghiệm đào tạo kép") ─────────────
function ProductsEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 860, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", color: t.accent, textTransform: "uppercase", marginBottom: 16, fontFamily: t.fontMono }}>
          <span style={{ opacity: 0.5 }}>// </span>
          <ET value={c.productsLabel ?? "Sản phẩm chi tiết"} onChange={(v) => uc({ productsLabel: v })} />
        </div>
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 12px" }}>
          <ETBlock value={c.productsHeading ?? "Trải nghiệm đào tạo kép:\nTypography Masterclass"} onChange={(v) => uc({ productsHeading: v })} />
        </h2>
        {c.productsSub && (
          <ETBlock value={c.productsSub} onChange={(v) => uc({ productsSub: v })} style={{ fontSize: 17, color: t.textMuted ?? "#888", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }} />
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 44 }}>
        {c.products.map((p, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${t.card}, ${t.card2})`, border: `1px solid ${t.accent}44`, borderRadius: t.cardRadius, overflow: "hidden" }}>
            <div style={{ padding: "36px 30px 24px" }}>
              <div style={{ marginBottom: 18 }}>
                {i === 0 ? <EdIconBook c={t.accent} /> : <EdIconVideo c={t.accent} />}
              </div>
              <h3 style={{ fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>
                <ETBlock value={p.title} onChange={(v) => { const n = [...c.products]; n[i] = { ...n[i], title: v }; uc({ products: n }); }} />
              </h3>
              <ETBlock value={p.desc} onChange={(v) => { const n = [...c.products]; n[i] = { ...n[i], desc: v }; uc({ products: n }); }}
                style={{ fontSize: 16, color: t.textBody ?? "#b0b0b0", lineHeight: 1.75 }} />
            </div>
            {/* Product embeds — same logic as App.tsx */}
            {i === 0 && c.productsEbookEmbed && (
              <div style={{ borderTop: `1px solid ${t.line}`, background: "#080808" }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#444", padding: "6px 12px" }}>
                  🔗 Iframe Embed URL: <ET value={c.productsEbookEmbed} onChange={(v) => uc({ productsEbookEmbed: v })} style={{ color: "#666", fontSize: 10 }} />
                </div>
                <iframe src={c.productsEbookEmbed} style={{ width: "100%", height: 480, border: "none", display: "block" }} title="Ebook Preview" allow="fullscreen" />
              </div>
            )}
            {i === 0 && !c.productsEbookEmbed && (
              <div style={{ borderTop: `1px solid ${t.line}`, padding: "12px 16px", background: t.card2 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#444", marginBottom: 6 }}>🔗 URL iframe ebook (heyzine...):</div>
                <input type="text" placeholder="https://heyzine.com/flip-book/..."
                  onBlur={(e) => { if (e.target.value) uc({ productsEbookEmbed: e.target.value }); }}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px dashed #333", color: "#aaa", fontSize: 10, fontFamily: MONO, outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            {i === 1 && (
              <div style={{ borderTop: `1px solid ${t.line}` }}>
                {/* GIF preview */}
                {(c.productsVideoGif ?? "/video-preview2.gif") && (
                  <img
                    src={c.productsVideoGif ?? "/video-preview2.gif"}
                    alt="Video Preview"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    style={{ width: "100%", display: "block" }}
                  />
                )}
                {/* Upload field */}
                <div style={{ padding: "0 16px 16px" }}>
                  <ImageUploadField
                    value={c.productsVideoGif ?? "/video-preview2.gif"}
                    onChange={(v) => uc({ productsVideoGif: v })}
                    label="GIF / ẢNH MINH HỌA VIDEO"
                    accent={t.accent}
                  />
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-block", background: t.accent, color: t.accentText, fontWeight: 800, fontSize: 15, padding: `${t.btnPaddingY}px ${t.btnPaddingX}px`, borderRadius: t.btnRadius }}>
          <ET value={c.midCta} onChange={(v) => uc({ midCta: v })} style={{ borderBottom: "none" }} /> — {c.price} VNĐ
        </div>
      </div>
    </section>
  );
}

function SkillsEdit({ c, uc, t }: { c: PageContent; uc: (p: Partial<PageContent>) => void; t: Theme }) {
  return (
    <section style={{ maxWidth: 940, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.2em", marginBottom: 14 }}>
          <ET value={c.skillsLabel} onChange={(v) => uc({ skillsLabel: v })} />
        </div>
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: 0 }}>
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
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 12px" }}>
          <ETBlock value={c.bonusesHeading} onChange={(v) => uc({ bonusesHeading: v })} />
        </h2>
        <ETBlock value={c.bonusesSub} onChange={(v) => uc({ bonusesSub: v })} style={{ fontSize: 15, color: "#666" }} />
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
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 12px" }}>
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
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", color: t.accent, textTransform: "uppercase", marginBottom: 16, fontFamily: t.fontMono }}>
          <span style={{ opacity: 0.5 }}>// </span>
          <ET value={c.roadmapLabel} onChange={(v) => uc({ roadmapLabel: v })} />
        </div>
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: 0 }}>
          <ETBlock value={c.roadmapHeading} onChange={(v) => uc({ roadmapHeading: v })} />
        </h2>
      </div>

      {/* Book preview iframe sub-section — same as App.tsx */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: t.textBase ?? "#f0f0f0", marginBottom: 12 }}>
          <ET value={c.roadmapPreviewHeading ?? "Trải nghiệm trực quan không gian bên trong ấn phẩm"} onChange={(v) => uc({ roadmapPreviewHeading: v })} />
        </p>
        <ETBlock value={c.roadmapPreviewDesc ?? ""} onChange={(v) => uc({ roadmapPreviewDesc: v })}
          style={{ fontSize: 15, color: t.textMuted ?? "#888", maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.7 }} />
      </div>
      {c.roadmapIframeUrl ? (
        <div style={{ borderRadius: t.cardRadius, overflow: "hidden", border: `1px solid ${t.line}`, marginBottom: 52, aspectRatio: "16/9", position: "relative" }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: "#444", padding: "6px 12px", background: t.card2 }}>
            🔗 Iframe URL: <ET value={c.roadmapIframeUrl} onChange={(v) => uc({ roadmapIframeUrl: v })} style={{ color: "#666", fontSize: 10 }} />
          </div>
          <iframe src={c.roadmapIframeUrl} title="Book Preview" allow="clipboard-write"
            style={{ width: "100%", height: 460, border: "none", display: "block" }} allowFullScreen />
        </div>
      ) : (
        <div style={{ border: `2px dashed ${t.line}`, borderRadius: t.cardRadius, padding: "40px 24px", textAlign: "center", marginBottom: 52 }}>
          <div style={{ marginBottom: 10 }}><EdIconBook c="#555" /></div>
          <p style={{ fontFamily: MONO, fontSize: 12, color: "#555", letterSpacing: "0.1em", marginBottom: 8 }}>[ CHƯA CÓ IFRAME HEYZINE — DÁN URL VÀO ĐÂY ]</p>
          <input type="text" placeholder="https://heyzine.com/flip-book/..."
            onBlur={(e) => { if (e.target.value) uc({ roadmapIframeUrl: e.target.value }); }}
            style={{ width: "100%", maxWidth: 400, background: "transparent", border: "none", borderBottom: `1px dashed ${t.accent}44`, color: "#aaa", fontSize: 12, fontFamily: MONO, outline: "none", padding: "4px 0", textAlign: "center" }} />
        </div>
      )}

      {/* Heading trên lưới chapters */}
      <p style={{ fontSize: 17, fontWeight: 700, textAlign: "center", color: t.textBase ?? "#f0f0f0", marginBottom: 28 }}>
        <ET value={c.roadmapChaptersHeading ?? "Hệ thống hóa toàn bộ tư duy thiết kế của bạn:"} onChange={(v) => uc({ roadmapChaptersHeading: v })} />
      </p>

      {/* Chapter cards — 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>
        {c.stages.map((s, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, borderLeft: `3px solid ${t.accent}`, overflow: "hidden" }}>
            <div style={{ padding: "26px 24px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: t.accent, background: `${t.accent}18`, padding: "3px 10px", borderRadius: 100 }}>
                  <ET value={s.n} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], n: v }; uc({ stages: n }); }} />
                </span>
                <ET value={s.sub} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], sub: v }; uc({ stages: n }); }} style={{ fontSize: 12, color: t.textMuted ?? "#666", fontFamily: MONO }} />
              </div>
              <ETBlock value={s.title} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], title: v }; uc({ stages: n }); }}
                style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: t.textBase ?? "#f0f0f0" }} />
              <ETBlock value={s.desc} onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], desc: v }; uc({ stages: n }); }}
                style={{ fontSize: 14, color: t.textBody ?? "#b0b0b0", lineHeight: 1.7 }} />
              {s.gif && (
                <div style={{ marginTop: 12, borderRadius: 6, overflow: "hidden", border: `1px solid ${t.accent}33` }}>
                  <img src={s.gif} alt={s.title} style={{ width: "100%", display: "block" }} />
                </div>
              )}
              <div style={{ marginTop: 12, borderTop: `1px solid ${t.line}`, paddingTop: 12 }}>
                <ImageUploadField
                  value={s.gif ?? ""}
                  onChange={(v) => { const n = [...c.stages]; n[i] = { ...n[i], gif: v }; uc({ stages: n }); }}
                  label={`GIF CHƯƠNG ${i + 1}`}
                  accent={t.accent}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chapters GIF — below grid */}
      {c.roadmapChaptersGif && (
        <div style={{ marginTop: 4, marginBottom: 28, borderRadius: t.cardRadius, overflow: "hidden", border: `1px solid ${t.line}` }}>
          <img src={c.roadmapChaptersGif} alt="Lộ trình" style={{ width: "100%", display: "block" }} />
        </div>
      )}
      <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: t.cardRadius, padding: "20px 22px" }}>
        <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, letterSpacing: "0.15em", marginBottom: 4 }}>ẢNH / GIF BÊN DƯỚI 4 KHỐI CHƯƠNG</div>
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
    <section style={{ maxWidth: 860, margin: "0 auto", padding: "72px 20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", color: t.accent, textTransform: "uppercase", marginBottom: 16, fontFamily: t.fontMono }}>
          <span style={{ opacity: 0.5 }}>// </span>
          <ET value={c.instructorLabel} onChange={(v) => uc({ instructorLabel: v })} />
        </div>
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: 0 }}>
          <ETBlock value={c.instructorHeading} onChange={(v) => uc({ instructorHeading: v })} />
        </h2>
      </div>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Avatar col — matches App.tsx layout */}
        <div style={{ flexShrink: 0, textAlign: "center", minWidth: 220, maxWidth: 260 }}>
          <div style={{
            borderRadius: 16, overflow: "hidden",
            border: `2px solid ${t.accent}44`,
            boxShadow: `0 0 40px -12px ${t.accent}55`,
            marginBottom: 16,
          }}>
            {c.instructorPhoto
              ? <img src={c.instructorPhoto} alt={c.instructorName} style={{ width: "100%", display: "block" }} />
              : <div style={{ width: 260, height: 280, background: `linear-gradient(135deg, ${t.accent}22, ${t.accent}08)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: t.accent, fontFamily: t.fontDisplay }}>{c.instructorInitials}</span>
                </div>
            }
          </div>
          <ImageUploadField
            value={c.instructorPhoto ?? ""}
            onChange={(v) => uc({ instructorPhoto: v })}
            label="ẢNH GIẢNG VIÊN"
            accent={t.accent}
          />
          <div style={{ fontFamily: t.fontDisplay, fontSize: 18, fontWeight: 700, color: t.textBase ?? "#f0f0f0", marginBottom: 6, marginTop: 12 }}>
            <ET value={c.instructorName} onChange={(v) => uc({ instructorName: v })} />
          </div>
          <div style={{ fontSize: 11, color: t.accent, fontFamily: MONO, lineHeight: 1.6 }}>
            <ET value={c.instructorTitle} onChange={(v) => uc({ instructorTitle: v })} />
          </div>
        </div>
        {/* Bio col — matches App.tsx */}
        <div style={{ flex: 1, minWidth: 260 }}>
          {c.instructorBio.map((bio, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-start" }}>
              <ETBlock value={bio} onChange={(v) => { const n = [...c.instructorBio]; n[i] = v; uc({ instructorBio: n }); }}
                style={{ flex: 1, fontSize: 16, lineHeight: 1.85, color: t.textBody ?? "#b0b0b0" }} />
              <DelBtn onClick={() => uc({ instructorBio: c.instructorBio.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddBtn onClick={() => uc({ instructorBio: [...c.instructorBio, "Thông tin mới về giảng viên..."] })} accent={t.accent} label="+ Thêm dòng bio" />
        </div>
      </div>
      {/* instructorInsight quote box — same as App.tsx */}
      <div style={{ marginTop: 36, background: `linear-gradient(135deg, ${t.accent}12, ${t.card})`, border: `1px solid ${t.accent}44`, borderRadius: t.cardRadius, padding: "26px 30px", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <span style={{ color: t.accent, fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2, opacity: 0.7 }}>"</span>
        <ETBlock value={c.instructorInsight ?? ""} onChange={(v) => uc({ instructorInsight: v })}
          style={{ fontSize: 17, lineHeight: 1.85, color: t.textBase ?? "#e8e8e8", fontWeight: 500, letterSpacing: "0.01em" }} />
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
            <h2 style={{ fontFamily: t.fontDisplay, fontSize: t.h2FontSize, fontWeight: t.h2Weight, lineHeight: 1.18, margin: "0 0 16px" }}>
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
    <footer style={{ textAlign: "center", padding: "64px 20px 32px", borderTop: `1px solid ${t.line}`, marginTop: 84 }}>
      <div style={{ fontFamily: t.fontDisplay, fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
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
  // contentRef always holds the latest content — used by handleSave to avoid stale closure
  const contentRef = useRef<PageContent>(DEFAULT_CONTENT);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [mediaFor, setMediaFor] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    loadContent().then((c) => { setContent(c); contentRef.current = c; setDirty(false); });
  }, []);

  const uc = useCallback((patch: Partial<PageContent>) => {
    setContent((c) => {
      const next = { ...c, ...patch };
      contentRef.current = next;  // keep ref in sync
      return next;
    });
    setDirty(true);
  }, []);

  // Migrate: add any new block IDs from BLOCK_DEFS that are missing from stored order AND not hidden
  const rawMeta: BlocksMeta = content.blocksMeta ?? DEFAULT_META;
  const knownIds = BLOCK_DEFS.map((b) => b.id);
  // Only add IDs that are neither in order already, nor explicitly hidden
  const missingIds = knownIds.filter(
    (id) => !rawMeta.order.includes(id) && !rawMeta.hidden.includes(id) && !id.startsWith("custom-")
  );
  const meta: BlocksMeta = missingIds.length > 0
    ? { ...rawMeta, order: (() => {
        const o = [...rawMeta.order];
        const midctaIdx = o.indexOf("midcta");
        missingIds.forEach((id) => {
          const insertAfter = id === "products" ? midctaIdx : -1;
          if (insertAfter >= 0) o.splice(insertAfter + 1, 0, id);
          else o.push(id);
        });
        return o;
      })() }
    : rawMeta;

  // Sync computed meta back into content state if migration changed anything
  useEffect(() => {
    if (missingIds.length > 0) {
      setContent((c) => ({ ...c, blocksMeta: meta }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Blur active element to trigger any pending onInput/onBlur handlers
    (document.activeElement as HTMLElement)?.blur();
    // Wait 1 frame so React flushes the state update from blur before we read contentRef
    await new Promise((r) => setTimeout(r, 30));
    try {
      // Use contentRef (always fresh) instead of stale closure `content`
      await saveContent(contentRef.current);
      setContent(contentRef.current);
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
    // Skip blocks that are hidden (not visible on landing page)
    if (meta.hidden.includes(id)) return null;

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
      case "products":     return wrap(<><Div t={t} /><ProductsEdit c={content} uc={uc} t={t} /></>);
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

  const [deployStatus, setDeployStatus] = useState<"idle" | "deploying" | "done" | "error">("idle");

  const handleDeploy = async () => {
    setDeployStatus("deploying");
    try {
      const res = await fetch("/api/deploy", { method: "POST" });
      const data = await res.json() as { success?: boolean; error?: boolean; message?: string };
      if (res.ok && data.success) {
        setDeployStatus("done");
        alert("🎉 Đồng bộ thành công lên Github! Hệ thống Vercel online đang tự động build và cập nhật.");
        setTimeout(() => setDeployStatus("idle"), 3000);
      } else {
        throw new Error(data.message || "Lỗi không xác định");
      }
    } catch (err) {
      setDeployStatus("error");
      alert("❌ Lỗi đồng bộ: " + String(err));
      setTimeout(() => setDeployStatus("idle"), 3000);
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

      {/* ─── Floating Save & Deploy ─── */}
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
        {!dirty && (
          <button onClick={handleDeploy} disabled={deployStatus === "deploying"}
            style={{
              background: deployStatus === "done" ? "#1a6b40" : deployStatus === "deploying" ? "#222" : "#9828e6",
              color: deployStatus === "done" ? "#7effc0" : "#fff",
              border: "none", borderRadius: 14, padding: "13px 32px",
              fontWeight: 800, fontSize: 14, fontFamily: AEONIK,
              cursor: deployStatus === "deploying" ? "default" : "pointer",
              boxShadow: deployStatus === "idle" ? "0 6px 40px rgba(152,40,230,0.4), 0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.3)",
              transition: "all 0.2s", minWidth: 180, textAlign: "center",
            }}>
            {deployStatus === "deploying" ? "⚡ Đang đồng bộ..." : deployStatus === "done" ? "✓ Đã đồng bộ lên Web" : "🚀 Đồng bộ lên Web (Deploy)"}
          </button>
        )}
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
