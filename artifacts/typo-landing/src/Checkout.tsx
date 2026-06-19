import { useEffect, useState, useCallback } from "react";
import { useTheme } from "./theme";

function useIsMobile(breakpoint = 680) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  const update = useCallback(() => setMobile(window.innerWidth < breakpoint), [breakpoint]);
  useEffect(() => {
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);
  return mobile;
}

const ORANGE = "var(--theme-accent)";
const GREEN = "var(--theme-danger, #27ae60)";
const BG = "var(--theme-bg)";
const CARD = "var(--theme-card)";

const BONUSES = [
  { icon: "🔤", title: "Bộ 100+ font chuẩn phối cặp sẵn", value: "599K" },
  { icon: "📐", title: "Type Scale Calculator Template (Figma/Excel)", value: "399K" },
  { icon: "✅", title: "Checklist 30 lỗi typography phổ biến", value: "199K" },
  { icon: "👁", title: "Swipe File — 50 layout typography đỉnh", value: "299K" },
  { icon: "📱", title: "Mini-Guide Typography cho Social Media", value: "199K" },
];

const OBJECTIONS = [
  { q: "Tôi chưa chắc mình có thời gian học không?", a: "Bạn không cần học liền. Tài liệu truy cập vĩnh viễn — đọc 15 phút/ngày trong 7 ngày là đủ thấy thay đổi. Không deadline, không áp lực." },
  { q: "Tôi đã xem nhiều tutorial rồi, có gì khác không?", a: "Tutorial cho bạn trick. Masterclass này cho bạn hệ thống. Sự khác biệt là: trick bạn phải nhớ, hệ thống bạn sẽ hiểu và tự suy ra." },
  { q: "249K có thực sự xứng đáng không?", a: "Một buổi freelance tốt hơn nhờ typography đúng hướng có thể thu thêm 500K–2 triệu. Tài liệu này payback ngay từ dự án đầu tiên bạn áp dụng." },
  { q: "Nếu tôi không hài lòng thì sao?", a: "Hoàn tiền 100% trong 7 ngày, không hỏi lý do. Gửi email về vietndj@gmail.com (hoặc Zalo: 0934.688.632) — chúng tôi hoàn tiền trong 24 giờ." },
  { q: "Tôi mới học design, có phù hợp không?", a: "Có. Module 01 bắt đầu từ nền tảng, không yêu cầu kiến thức trước. Cả người mới lẫn designer 3–5 năm đều thấy giá trị khác nhau từ tài liệu này." },
];

const FAQS = [
  { q: "Tôi nhận tài liệu bằng cách nào?", a: "Sau khi xác minh chuyển khoản, chúng tôi gửi link truy cập qua email bạn đã đăng ký trước đó — thường trong 30 phút (giờ hành chính)." },
  { q: "Tôi có thể học trên điện thoại không?", a: "Có. Ebook và video đều tương thích với mọi thiết bị: điện thoại, tablet, laptop." },
  { q: "Quyền truy cập có hết hạn không?", a: "Không. Bạn truy cập vĩnh viễn sau khi mua một lần." },
  { q: "Tôi chuyển khoản xong nhưng chưa nhận email?", a: "Hãy kiểm tra thư mục Spam/Junk trước. Nếu sau 60 phút vẫn không có, liên hệ vietndj@gmail.com (hoặc Zalo: 0934.688.632) kèm ảnh chụp màn hình giao dịch." },
  { q: "Nội dung chuyển khoản ghi gì?", a: "Ghi: TYPO [họ tên của bạn]. Ví dụ: TYPO NGUYEN VAN A. Điều này giúp chúng tôi xác minh nhanh hơn." },
  { q: "Thanh toán có an toàn không?", a: "Chuyển khoản trực tiếp qua ngân hàng — không có bên thứ ba, không cần nhập thông tin thẻ. An toàn 100%." },
  { q: "Tôi có thể tải file về máy không?", a: "Có. Ebook có thể tải về dưới dạng PDF. Video xem online, không tải." },
];

// ─── Countdown (24h cycle) ───
function Countdown({ label = "Ưu đãi kết thúc sau:" }: { label?: string }) {
  const [t, setT] = useState({ h: 23, m: 59, s: 59 });
  useEffect(() => {
    const base = Math.floor(Date.now() / 86400000) * 86400000;
    const tick = () => {
      const rem = 86400 - Math.floor((Date.now() - base) / 1000) % 86400;
      setT({ h: Math.floor(rem / 3600), m: Math.floor((rem % 3600) / 60), s: rem % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const Box = ({ v, l }: { v: string; l: string }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 16px", minWidth: 54 }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: ORANGE, fontVariantNumeric: "tabular-nums" }}>{v}</span>
      </div>
      <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em" }}>{l}</span>
    </div>
  );
  return (
    <div>
      <p style={{ fontSize: 12, color: "#777", textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{label}</p>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
        <Box v={pad(t.h)} l="GIỜ" />
        <span style={{ fontSize: 22, color: ORANGE, fontWeight: 900, paddingBottom: 14 }}>:</span>
        <Box v={pad(t.m)} l="PHÚT" />
        <span style={{ fontSize: 22, color: ORANGE, fontWeight: 900, paddingBottom: 14 }}>:</span>
        <Box v={pad(t.s)} l="GIÂY" />
      </div>
    </div>
  );
}

function Ck({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
      <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0, fontSize: 15 }}>✓</span>
      <span style={{ fontSize: 14, lineHeight: 1.65, color: "#c0c0c0" }}>{children}</span>
    </div>
  );
}

function Card({ children, highlight = false, style: extraStyle = {} }: { children: React.ReactNode; highlight?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: highlight ? "linear-gradient(135deg, #141414, #111)" : CARD,
      border: `1px solid ${highlight ? ORANGE + "44" : "#1e1e1e"}`,
      borderRadius: 20,
      padding: "24px 20px",
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: ORANGE, textTransform: "uppercase" as const, marginBottom: 10 }}>{children}</div>;
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 18px" }}>
      {children}
    </h2>
  );
}

function PaymentSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0a1a0a, #0d0d0d)",
        border: "1px solid #27ae60",
        borderRadius: 24, padding: "48px 32px",
        maxWidth: 480, width: "100%", textAlign: "center",
        boxShadow: "0 0 80px rgba(39,174,96,0.25), 0 24px 64px rgba(0,0,0,0.8)",
      }}>
        <div style={{ fontSize: 72, marginBottom: 20, lineHeight: 1 }}>✅</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>
          Thanh toán thành công!
        </h2>
        <p style={{ fontSize: 16, color: "#aaa", lineHeight: 1.75, margin: "0 0 24px" }}>
          Chúng tôi đã nhận được chuyển khoản của bạn.
        </p>
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>📧 Vui lòng kiểm tra email để nhận:</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: GREEN, margin: "0 0 4px" }}>Lời mời vào khoá học</p>
          <p style={{ fontSize: 13, color: "#555" }}>Email gửi trong <strong style={{ color: "#fff" }}>30 phút</strong> (giờ hành chính)</p>
        </div>
        <div style={{ background: "#0d1a0d", borderRadius: 12, padding: "14px 20px", marginBottom: 24 }}>
          {["📖 Ebook Typography Masterclass", "🎬 Video chi tiết 6 module", "🎁 5 Bonus đặc biệt", "♾ Truy cập vĩnh viễn"].map((item) => (
            <div key={item} style={{ fontSize: 14, color: "#b0b0b0", padding: "4px 0", textAlign: "left" }}>{item}</div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#444", marginBottom: 20 }}>
        Chưa nhận sau 30 phút? <a href="mailto:vietndj@gmail.com" style={{ color: ORANGE }}>vietndj@gmail.com</a> (Zalo: 0934.688.632)
        </p>
        <button onClick={onClose} style={{
          background: ORANGE, color: "#fff", border: "none",
          borderRadius: 50, padding: "14px 36px",
          fontSize: 15, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 0 24px rgba(255,90,0,0.4)",
        }}>
          Đóng
        </button>
      </div>
    </div>
  );
}

function ConfirmBanner({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", background: "#0a150a", border: "1px solid #27ae6044", borderRadius: 20 }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 900, marginBottom: 12, color: "#fff" }}>
        Cảm ơn bạn đã chuyển khoản!
      </h2>
      <p style={{ fontSize: 15, color: "#aaa", lineHeight: 1.75, maxWidth: 460, margin: "0 auto 24px" }}>
        Chúng tôi đang xác minh giao dịch. Bạn sẽ nhận được tài liệu qua email <strong style={{ color: "#fff" }}>trong vòng 30 phút</strong> (giờ hành chính).
      </p>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 10, background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "20px 24px", marginBottom: 20, textAlign: "left" }}>
        {["📖 Ebook Typography Masterclass (80+ trang)", "🎬 Video hướng dẫn chi tiết", "🎁 5 Bonus đặc biệt", "♾ Truy cập vĩnh viễn"].map((item) => (
          <span key={item} style={{ fontSize: 14, color: "#c0c0c0" }}>{item}</span>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#555" }}>Chưa nhận email sau 30 phút? Liên hệ <a href="mailto:vietndj@gmail.com" style={{ color: ORANGE }}>vietndj@gmail.com</a> (Zalo: 0934.688.632)</p>
      <button onClick={onReset} style={{ marginTop: 20, background: "transparent", border: "1px solid #2a2a2a", borderRadius: 50, padding: "10px 24px", color: "#555", fontSize: 13, cursor: "pointer" }}>
        Quay lại trang thanh toán
      </button>
    </div>
  );
}

type BankInfo = { name: string; account: string; holder: string; amount: string; content: string };

function PaymentPanel({ bank, qrUrl, onConfirm }: { bank: BankInfo; qrUrl: string; onConfirm: () => void }) {
  return (
    <Card highlight style={{ padding: "24px 20px" }}>
      <Lbl>Thanh toán ngay</Lbl>

      <div style={{ marginBottom: 18 }}>
        <Countdown label="Ưu đãi 249K kết thúc sau:" />
      </div>

      <div style={{ textAlign: "center", marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ fontSize: 13, color: "#555", textDecoration: "line-through" }}>499.000 VNĐ</div>
        <div style={{ fontSize: 36, fontWeight: 900 }}>249.000 <span style={{ fontSize: 15 }}>VNĐ</span></div>
        <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>Tiết kiệm 250.000 VNĐ</div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#aaa", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          📱 Quét mã QR để chuyển khoản
        </p>
        <div style={{ display: "inline-block", background: "#fff", padding: 10, borderRadius: 14, boxShadow: "0 0 40px rgba(255,90,0,0.2)" }}>
          <img
            src={qrUrl}
            alt="QR chuyển khoản Typography Masterclass"
            width={180}
            height={180}
            style={{ display: "block", borderRadius: 6 }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
              const parent = img.parentElement;
              if (parent) {
                parent.innerHTML = `<div style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border-radius:6px;font-size:12px;color:#333;text-align:center;padding:16px;">Thêm thông tin ngân hàng để hiển thị QR</div>`;
              }
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: "#555", marginTop: 10 }}>Tương thích: Momo, VCB, Techcombank, MB Bank, BIDV, v.v.</p>
      </div>

      <div style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Thông tin chuyển khoản</p>
        {[
          ["Ngân hàng", bank.name],
          ["Chủ tài khoản", bank.holder],
          ["Số tài khoản", bank.account],
          ["Số tiền", `${bank.amount} VNĐ`],
          ["Nội dung CK", bank.content],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, gap: 8 }}>
            <span style={{ fontSize: 13, color: "#555", flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 600, textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Hướng dẫn từng bước</p>
        {[
          "Mở app ngân hàng → Chuyển khoản → Quét QR hoặc nhập số TK",
          `Nhập số tiền: ${bank.amount} VNĐ`,
          "Nội dung: TYPO [họ tên của bạn]",
          "Xác nhận và hoàn tất chuyển khoản",
          'Nhấn nút "Tôi đã chuyển khoản" bên dưới',
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ background: ORANGE, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: "#b0b0b0", lineHeight: 1.55 }}>{step}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onConfirm}
        style={{
          width: "100%", background: ORANGE, color: "#fff", border: "none",
          borderRadius: 50, padding: "16px 16px",
          fontSize: 15, fontWeight: 800, cursor: "pointer",
          letterSpacing: "0.04em", textTransform: "uppercase",
          boxShadow: "0 0 32px 4px rgba(255,90,0,0.45)",
        }}
      >
        ✅ TÔI ĐÃ CHUYỂN KHOẢN
      </button>
      <p style={{ fontSize: 12, color: "#555", textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
        Tài liệu gửi qua email trong 30 phút sau xác nhận.<br />
        Chưa nhận? Liên hệ <a href="mailto:vietndj@gmail.com" style={{ color: ORANGE }}>vietndj@gmail.com</a> (Zalo: 0934.688.632)
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, paddingTop: 14, borderTop: "1px solid #1a1a1a", flexWrap: "wrap" }}>
        {[["🔒", "Bảo mật"], ["↩", "Hoàn tiền 7 ngày"], ["⚡", "Nhận ngay"]].map(([icon, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555" }}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function UrgencyNote() {
  return (
    <div style={{ background: "#110800", border: "1px solid #331500", borderRadius: 14, padding: "16px 18px" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: ORANGE, marginBottom: 6 }}>⚠ Lưu ý quan trọng</p>
      <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65, margin: 0 }}>
        Ưu đãi 249.000 VNĐ dành riêng cho học viên đã đăng ký đợt này. Sau khi đợt kết thúc, giá sẽ trở về <strong style={{ color: "#fff" }}>499.000 VNĐ</strong> và không áp dụng thêm ưu đãi.
      </p>
    </div>
  );
}

function GuaranteeBox() {
  return (
    <div style={{ background: "#0a150a", border: "1px solid #27ae6033", borderRadius: 14, padding: "16px 18px" }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: GREEN, marginBottom: 8 }}>💰 Cam kết hoàn tiền 100% — 7 ngày</p>
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, margin: 0 }}>
        Nếu bạn không hài lòng vì bất kỳ lý do gì trong vòng 7 ngày, chúng tôi hoàn tiền đầy đủ. Không hỏi lý do. Liên hệ: <a href="mailto:vietndj@gmail.com" style={{ color: ORANGE }}>vietndj@gmail.com</a> (Zalo: 0934.688.632)
      </p>
    </div>
  );
}

function CheckoutContent() {
  const [confirmed, setConfirmed] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();

  const rawCustomer = localStorage.getItem("typo_customer");
  const customer = rawCustomer ? JSON.parse(rawCustomer) as { phone?: string } : {};
  const phone = customer.phone || "[SĐT CỦA BẠN]";
  const transferContent = `TYPO ${phone}`;

  const BANK: BankInfo = { name: "TPBank", account: "00008834042", holder: "NGUYEN DUC VIET", amount: "249.000", content: transferContent };
  const QR_URL = `https://img.vietqr.io/image/TPB-${BANK.account}-compact2.png?amount=249000&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK.holder)}`;

  // Polling: detect payment automatically via SePay
  useEffect(() => {
    const since = Date.now().toString();
    let active = true;

    const poll = async () => {
      if (!active || paymentSuccess) return;
      try {
        const res = await fetch(`/api/payment/check?since=${since}`);
        if (!res.ok) return;
        const data = await res.json() as { found: boolean; transaction?: { id: string } };
        if (data.found && active && !paymentSuccess) {
          setPaymentSuccess(true);
          setShowModal(true);
          // Write to Google Sheet
          const raw = localStorage.getItem("typo_customer");
          const customer = raw ? JSON.parse(raw) as { name?: string; phone?: string; email?: string; url?: string } : {};
          const rowIndex = parseInt(localStorage.getItem("typo_row") ?? "0", 10) || undefined;
          await fetch("/api/payment/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: customer.name ?? "",
              phone: customer.phone ?? "",
              email: customer.email ?? "",
              url: customer.url ?? "",
              transactionId: data.transaction?.id ?? "",
              rowIndex,
            }),
          });
        }
      } catch {
        // silent — network errors shouldn't crash the page
      }
    };

    const id = setInterval(poll, 5000);
    return () => { active = false; clearInterval(id); };
  }, [paymentSuccess]);

  return (
    <div style={{ background: BG, color: "#fff", fontFamily: "'Inter','Arial',sans-serif", minHeight: "100vh" }}>
      {showModal && <PaymentSuccessModal onClose={() => setShowModal(false)} />}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header style={{ borderBottom: "1px solid #161616", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900 }}>
          TYPO<span style={{ color: ORANGE }}>.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span style={{ fontSize: 13, color: "#555" }}>Thanh toán bảo mật</span>
        </div>
      </header>

      {/* ── URGENCY BAR ── */}
      <div style={{ background: ORANGE, padding: "10px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", lineHeight: 1.4 }}>
          ⚡ ƯU ĐÃI ĐẶC BIỆT — CHỈ DÀNH CHO HỌC VIÊN ĐÃ ĐĂNG KÝ — HOÀN TẤT NGAY ĐỂ GIỮ GIÁ NÀY
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* ── DECISION CONFIRMATION ── */}
        <div style={{ textAlign: "center", padding: "40px 0 0" }}>
          <Lbl>Xác nhận quyết định</Lbl>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px, 4.5vw, 44px)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 14px" }}>
            Bạn đang hoàn tất đơn hàng<br />
            <em style={{ color: ORANGE }}>Typography Masterclass</em>
          </h1>
          <p style={{ fontSize: 15, color: "#888", maxWidth: 520, margin: "0 auto 12px" }}>
            Chỉ còn một bước nữa — chuyển khoản và nhận ngay toàn bộ tài liệu + 5 bonus trong hôm nay.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0a150a", border: "1px solid #27ae6033", borderRadius: 50, padding: "8px 20px" }}>
            <span style={{ color: GREEN, fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 13, color: "#aaa" }}>Bạn đã đăng ký thành công — chỉ cần hoàn tất thanh toán</span>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr min(360px, 100%)",
          gap: 20,
          marginTop: 36,
          alignItems: "start",
        }}>

          {/* MOBILE: QR panel first */}
          {isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {confirmed
                ? <ConfirmBanner onReset={() => setConfirmed(false)} />
                : <PaymentPanel bank={BANK} qrUrl={QR_URL} onConfirm={() => setConfirmed(true)} />
              }
              <UrgencyNote />
              <GuaranteeBox />
            </div>
          )}

          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ORDER SUMMARY */}
            <Card highlight>
              <Lbl>Tóm tắt đơn hàng</Lbl>
              <H>Typography Masterclass<br /><em>Ebook + Video + 5 Bonus</em></H>
              <div style={{ borderTop: "1px solid #222", borderBottom: "1px solid #222", padding: "14px 0", marginBottom: 14 }}>
                {[
                  ["📖 Ebook 80+ trang — Typography Masterclass", ""],
                  ["🎬 Video hướng dẫn chi tiết toàn bộ 6 module", ""],
                  ["♾ Truy cập vĩnh viễn trên mọi thiết bị", ""],
                  ...BONUSES.map((b) => [`${b.icon} BONUS: ${b.title}`, b.value]),
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "#b0b0b0", lineHeight: 1.5 }}>{label}</span>
                    {val && <span style={{ fontSize: 12, color: "#555", textDecoration: "line-through", flexShrink: 0 }}>{val}</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#555", textDecoration: "line-through", marginBottom: 2 }}>Tổng giá trị: 1.695.000 VNĐ</div>
                  <div style={{ fontSize: 13, color: "#555", textDecoration: "line-through" }}>Giá gốc: 499.000 VNĐ</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: ORANGE, fontWeight: 700 }}>Tiết kiệm 250.000 VNĐ</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>249.000<span style={{ fontSize: 14 }}> VNĐ</span></div>
                </div>
              </div>
            </Card>

            {/* WHAT YOU GET */}
            <Card>
              <Lbl>Bạn nhận được gì ngay hôm nay</Lbl>
              <H>Truy cập ngay sau xác nhận</H>
              {[
                "Ebook PDF 80+ trang — đọc offline mọi lúc, mọi thiết bị",
                "Video hướng dẫn từng module — minh họa case study thực tế",
                "Bộ font 100+ cặp phối sẵn — áp dụng ngay vào dự án",
                "Type Scale Calculator — tính spacing chuẩn trong 5 phút",
                "Checklist 30 lỗi typography — review design trước khi gửi client",
                "Swipe File 50 layout đỉnh — tham khảo có phân tích nguyên tắc",
                "Mini-Guide Social Media — typography cho Facebook, Instagram, TikTok",
              ].map((item, i) => <Ck key={i}>{item}</Ck>)}
            </Card>

            {/* BONUS STACK */}
            <Card>
              <Lbl>🎁 5 Bonus đặc biệt</Lbl>
              <H><em>Trị giá 1.695.000 VNĐ — tặng kèm miễn phí</em></H>
              {BONUSES.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>BONUS {i + 1}: {b.title}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>Trị giá: <s>{b.value}</s> — <span style={{ color: GREEN }}>Tặng miễn phí</span></div>
                  </div>
                </div>
              ))}
            </Card>

            {/* TESTIMONIALS */}
            <Card>
              <Lbl>Học viên đã hoàn tất thanh toán nói gì</Lbl>
              {[
                { name: "Trần Thị Lan", role: "Freelance Designer", text: "Mình chuyển khoản xong nhận link ngay trong 20 phút. Tài liệu rất rõ, xứng đáng từng đồng." },
                { name: "Nguyễn Minh Đức", role: "UI Designer", text: "Lo lắng một chút vì không quen mua online kiểu này, nhưng nhận được ngay và hỗ trợ rất nhanh khi hỏi." },
                { name: "Phạm Quốc Bảo", role: "Brand Designer", text: "249K nhưng giá trị hơn nhiều khoá mình từng mua 1–2 triệu. Áp dụng vào dự án thật sự hiệu quả." },
              ].map((testimonial, i) => (
                <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid #1a1a1a", paddingTop: i === 0 ? 0 : 16, marginBottom: 16 }}>
                  <div style={{ color: "#FFB800", fontSize: 13, marginBottom: 6 }}>★★★★★</div>
                  <p style={{ fontSize: 14, color: "#b0b0b0", fontStyle: "italic", lineHeight: 1.65, marginBottom: 8 }}>"{testimonial.text}"</p>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{testimonial.name} <span style={{ color: "#555", fontWeight: 400 }}>— {testimonial.role}</span></div>
                </div>
              ))}
            </Card>

            {/* OBJECTION HANDLING */}
            <Card>
              <Lbl>Giải đáp lo ngại phút chót</Lbl>
              {OBJECTIONS.map((o, i) => (
                <div key={i} style={{ borderBottom: i < OBJECTIONS.length - 1 ? "1px solid #1a1a1a" : "none", padding: "14px 0" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#fff" }}>❓ {o.q}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: "#888" }}>→ {o.a}</div>
                </div>
              ))}
            </Card>

            {/* FAQ */}
            <Card>
              <Lbl>FAQ trước thanh toán</Lbl>
              {FAQS.map((f, i) => (
                <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{
                      width: "100%", background: "none", border: "none", color: "#fff", cursor: "pointer",
                      padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      textAlign: "left", fontSize: 14, fontWeight: 600,
                    }}
                  >
                    <span>{f.q}</span>
                    <span style={{ color: ORANGE, fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: faqOpen === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                  </button>
                  {faqOpen === i && (
                    <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7, paddingBottom: 14 }}>{f.a}</div>
                  )}
                </div>
              ))}
            </Card>
          </div>

          {/* RIGHT column — desktop only */}
          {!isMobile && (
            <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {confirmed
                ? <ConfirmBanner onReset={() => setConfirmed(false)} />
                : <PaymentPanel bank={BANK} qrUrl={QR_URL} onConfirm={() => setConfirmed(true)} />
              }
              <UrgencyNote />
              <GuaranteeBox />
            </div>
          )}
        </div>

        {/* ── FINAL CTA BAR ── */}
        <div style={{ marginTop: 40, background: "linear-gradient(135deg, #141414, #0f0f0f)", border: `1px solid ${ORANGE}33`, borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
          <Lbl>Bước cuối cùng</Lbl>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px, 3.5vw, 32px)", fontWeight: 900, margin: "0 0 12px" }}>
            Chuyển khoản ngay và bắt đầu<br /><em>lột xác tư duy thiết kế hôm nay.</em>
          </h2>
          <p style={{ fontSize: 15, color: "#777", marginBottom: 24 }}>
            Trong khi các designer khác vẫn đoán mò, bạn sẽ có một hệ thống rõ ràng và thiết kế với sự tự tin thật sự.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              background: ORANGE, color: "#fff", border: "none", borderRadius: 50,
              padding: "18px 40px", fontSize: 16, fontWeight: 800, cursor: "pointer",
              letterSpacing: "0.04em", textTransform: "uppercase",
              boxShadow: "0 0 40px 6px rgba(255,90,0,0.4)",
            }}
          >
            ↑ QUAY LÊN ĐỂ THANH TOÁN
          </button>
          <p style={{ fontSize: 13, color: "#555", marginTop: 16 }}>
            Đảm bảo hoàn tiền 100% trong 7 ngày · Truy cập vĩnh viễn · Hỗ trợ qua email
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ textAlign: "center", paddingTop: 48, borderTop: "1px solid #1a1a1a", marginTop: 40 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, marginBottom: 12 }}>
            TYPO<span style={{ color: ORANGE }}>.</span>
          </div>
          <p style={{ fontSize: 12, color: "#444", lineHeight: 1.8 }}>
            © 2024 Typography Masterclass · fedu.vn · Mọi quyền được bảo lưu.<br />
            <a href="mailto:vietndj@gmail.com" style={{ color: "#555" }}>vietndj@gmail.com</a> | Zalo: 0934.688.632
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const t = useTheme();
  return (
    <div style={{
      "--theme-accent": t.accent,
      "--theme-danger": t.danger,
      "--theme-bg": t.bg,
      "--theme-card": t.card
    } as React.CSSProperties}>
      <CheckoutContent />
    </div>
  );
}
