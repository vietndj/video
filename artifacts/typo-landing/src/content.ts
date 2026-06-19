import { createContext, useContext, useState, useEffect, createElement } from "react";
import React from "react";
import type { ReactNode } from "react";

// ─── Visual editor types ──────────────────────────────────────
export interface MediaItem {
  id: string;
  type: "image" | "youtube";
  url: string;
  caption: string;
  fit: "full" | "half" | "auto";
}

export interface BlocksMeta {
  order: string[];
  hidden: string[];
  media: Record<string, MediaItem[]>;
  custom: Record<string, { title: string; body: string }>;
}

// ─── Data types ───────────────────────────────────────────────
export interface BrandCard { brand: string; q: string; a: string }
export interface SkillCard { n: string; title: string; desc: string; warn: string; gif?: string }
export interface Stage { n: string; title: string; sub: string; desc: string; gif?: string }
export interface BonusItem { icon: string; title: string; desc: string }
export interface ProductItem { icon: string; title: string; desc: string }
export interface ValueLine { label: string; price: string }
export interface FailItem { fail: string; why: string }
export interface Benefit { title: string; desc: string }

export const CONTENT_SCHEMA_VERSION = 6;

export interface PageContent {
  _v?: number;
  // Prices
  price: string;
  value: string;

  // Section 1: Hero
  heroBadge: string;
  heroHeadline1: string;
  heroHeadline2: string;
  heroAccentLine: string;
  heroSub: string;
  heroCta: string;
  heroSubPrice?: string;

  // Section 2: Pain
  painLabel: string;
  painHeading: string;
  painBlockquote: string;
  painPara: string;
  painListHeading: string;
  painList: string[];
  painConclusion?: string;

  // Section 3: Expert / Instructor
  instructorLabel: string;
  instructorHeading: string;
  instructorInitials: string;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string[];
  instructorInsight?: string;
  instructorPhoto?: string;

  // Product embed/preview overrides
  productsEbookEmbed?: string;
  productsVideoGif?: string;

  // Section 4: Products
  productsLabel?: string;
  productsHeading?: string;
  productsSub?: string;
  products: ProductItem[];
  midCta: string;

  // Section 5: Skills
  skillsLabel: string;
  skillsHeading: string;
  skillCards: SkillCard[];

  // Section 6: Roadmap
  roadmapLabel: string;
  roadmapHeading: string;
  roadmapPreviewHeading?: string;
  roadmapPreviewDesc?: string;
  roadmapIframeUrl?: string;
  roadmapChaptersHeading?: string;
  roadmapChaptersGif?: string;
  stages: Stage[];

  // Section 7: Bonuses
  bonusesLabel: string;
  bonusesHeading: string;
  bonusesSub: string;
  bonuses: BonusItem[];
  bonusesCta: string;
  bonusGif?: string;

  // Section 8: Before/After
  baLabel: string;
  baHeading: string;
  baSub: string;
  beforeLabel: string;
  afterLabel: string;
  beforeItems: string[];
  afterItems: string[];

  // Section 9: Final CTA
  urgencyBar: string;
  ctaLabel: string;
  ctaHeading: string;
  ctaSub: string;
  countdownLabel: string;
  valueStackTitle: string;
  valueStack: ValueLine[];
  guarantee: string;

  // Footer
  footerBrand: string;
  footerDot: string;
  footerTagline: string;
  footerLinks: string[];
  footerCopyright: string;

  // Legacy fields (kept for Admin/Editor backward compat — not rendered on page)
  cycleLabel: string;
  cycleHeading: string;
  cyclePara: string;
  cycleItems: FailItem[];
  cycleConclusion: string;
  discoveryLabel: string;
  discoveryHeading: string;
  discoveryPara1: string;
  discoveryPara2: string;
  brandCards: BrandCard[];
  insightBox: string;
  solutionLabel: string;
  solutionHeading: string;
  solutionSub: string;
  benefits: Benefit[];
  bonusesTitle: string;

  // Visual editor metadata
  blocksMeta: BlocksMeta;
}

// ─── Default content ──────────────────────────────────────────
export const DEFAULT_CONTENT: PageContent = {
  _v: CONTENT_SCHEMA_VERSION,
  price: "249.000",
  value: "1.499.000",

  // ── Hero ──
  heroBadge: "ĐÚC KẾT TỪ 15 NĂM THIẾT KẾ & GIẢNG DẠY TẠI FPT ARENA",
  heroHeadline1: "TYPOGRAPHY KHÔNG PHẢI LÀ",
  heroHeadline2: "NGHỆ THUẬT CẢM TÍNH.",
  heroAccentLine: "Đó là công thức toán học & tâm lý học thị giác.",
  heroSub: "Hệ thống giúp bạn có \"lý luận thép\" đập tắt mọi yêu cầu sửa vật và tự tin thuyết phục khách hàng duyệt phương án ngay vòng đầu tiên — ngay cả khi bạn từng cứng họng vì câu chữ \"chữ này nhìn chưa sang\".",
  heroCta: "TRANG BỊ VŨ KHÍ THỊ GIÁC NGAY",
  heroSubPrice: "Giá gốc: 1.499.000 VNĐ — Tiết kiệm 80% hôm nay",

  // ── Pain ──
  painLabel: "Nỗi đau thực tế của người làm nghề",
  painHeading: "Có phải bạn đang gặp phải những vấn đề này?",
  painBlockquote: '"Mình làm thiết kế 3 năm rồi mà vẫn không biết tại sao font này trông ổn còn font kia thì không. Khách hàng chê \'nhìn chưa sang\' nhưng mình cũng không biết sửa từ đâu..."',
  painPara: "Nếu bạn đang làm Designer — dù là Freelancer, In-house hay Marketer — chắc hẳn bạn đã từng trải qua cảm giác:",
  painListHeading: "",
  painList: [
    "Mất hàng giờ lướt Google Fonts vô định, thử hàng chục font rồi lại xóa.",
    "Chọn được font rồi nhưng không biết phối cặp (Font Pairing) thế nào cho chuẩn.",
    "Cứng họng khi bị khách hàng hoặc Sếp hỏi: \"Tại sao em lại chọn kiểu chữ này?\"",
    "Thiết kế nhìn rất đẹp trên máy tính, nhưng khi lên màn hình điện thoại lại bị dính chữ, khó đọc.",
    "Mỗi dự án mới lại phải ngồi \"đoán mò\" lại từ đầu vì không có một nguyên tắc nhất quán.",
  ],
  painConclusion: "Bạn đã xem rất nhiều tutorial trên mạng, nhưng chúng chỉ là những mẹo rời rạc. Vấn đề không phải do bạn thiếu năng khiếu, mà vì chưa ai dạy bạn bản chất của chữ viết có tính logic như thế nào.",

  // ── Expert / Instructor ──
  instructorLabel: "Giải pháp từ chuyên gia",
  instructorHeading: "Đưa nghệ thuật vào khuôn khổ\ncủa kỹ thuật và logic",
  instructorInitials: "NĐV",
  instructorName: "Nguyễn Đức Việt",
  instructorTitle: "Kỹ sư CNPM (ĐH Bách Khoa) · Giảng viên UI/UX tại FPT Arena · Founder Fedu.vn",
  instructorBio: [
    "Xuất phát điểm là một Kỹ sư Công nghệ phần mềm (ĐH Bách Khoa), nhưng tôi đã có hơn 15 năm gắn bó với vai trò Giảng viên chuyên ngành UI/UX tại FPT Arena.",
    "Sự giao thoa này giúp tôi nhận ra: Phần lớn Designer đang làm Typography bằng \"cảm nhận\". Trong khi đó, các thương hiệu lớn nhất thế giới lại xử lý chữ bằng Thông số, Tỷ lệ Grid và Cấu trúc vi mô.",
    "Tôi đã đóng gói toàn bộ kinh nghiệm rà soát hàng vạn đồ án thiết kế vào một hệ thống duy nhất. Không phải những lý thuyết khô khan trong sách giáo khoa — đây là cách Typography thực sự vận hành trong môi trường thực chiến.",
  ],
  instructorInsight: "Triết lý: \"Tôi không nhìn Typography dưới góc độ đẹp/xấu mơ hồ. Tôi nhìn chữ nghĩa bằng thông số, tỷ lệ Grid và cấu trúc vi mô.\"",

  // ── Products ──
  productsLabel: "Sản phẩm chi tiết",
  productsHeading: "Trải nghiệm đào tạo kép:\nTypography Masterclass",
  productsSub: "Đây không chỉ là một cuốn sách để đọc. Đây là một \"Phòng Lab\" thực hành.",
  products: [
    {
      icon: "📖",
      title: "Ebook Tương Tác Chuyên Sâu (Hơn 100 trang)",
      desc: "Hệ thống hóa toàn bộ kiến thức từ tâm lý học thị giác đến toán học thiết kế. Dàn trang tối giản, trực quan, đọc mượt mà trên iPad, Laptop và Điện thoại.",
    },
    {
      icon: "💻",
      title: "Chuỗi Video Hướng Dẫn Thực Hành (Live Debugging)",
      desc: "Chuỗi video góc máy \"Over-the-shoulder\" cho thấy cảnh tôi trực tiếp gỡ lỗi, căn chỉnh Kerning và xử lý bẫy mực (Ink-traps) trên phần mềm Illustrator/Figma. Không giấu nghề.",
    },
  ],
  midCta: "TẢI EBOOK & VIDEO HƯỚNG DẪN NGAY",

  // ── Skills ──
  skillsLabel: "4 Kỹ năng cốt lõi",
  skillsHeading: "Điều phân biệt một Designer giỏi\nvà người mới vào nghề",
  skillCards: [
    {
      n: "01",
      title: "Đọc vị \"Giải phẫu chữ\" (Anatomy)",
      desc: "Hiểu rõ tại sao logo của Built Robotics lại cắt gọt nét chữ cứng cáp, hay vì sao nét bo tròn lại tạo sự thân thiện. Có kiến thức này, bạn luôn có \"lý luận thép\" để giải thích với khách hàng.",
      warn: "Không có kiến thức này, mọi quyết định thiết kế của bạn chỉ là phỏng đoán cảm tính.",
    },
    {
      n: "02",
      title: "Chọn Font theo Bản đồ Ngành hàng",
      desc: "Nắm vững đặc tính của 4 dòng font huyết mạch (Serif, Sans, Mono, Script). Biết chính xác vì sao ngành Tech dùng Monospace, ngành xa xỉ dùng font mảnh và tinh tế.",
      warn: "Sai lầm chết người: mang font ngành F&B áp dụng cho dự án Công nghệ cao.",
    },
    {
      n: "03",
      title: "Tối ưu hiển thị số (Digital UI/UX)",
      desc: "Tính toán độ mở (Aperture) và chiều cao (x-height) để chữ luôn hiển thị sắc nét, không bị ngộp thở trên màn hình Mobile hay tablet nhỏ.",
      warn: "Thiếu kỹ năng này, ấn phẩm của bạn sẽ dính nét và ngộp thở trên màn hình nhỏ.",
    },
    {
      n: "04",
      title: "Tùy biến sáng tạo (Customization)",
      desc: "Thoát khỏi việc dùng font miễn phí đại trà. Tự tay điều chỉnh các điểm neo (Anchor points) để phác thảo ra những logo độc bản, đắt tiền và có bản sắc riêng.",
      warn: "Phụ thuộc font miễn phí, Portfolio của bạn mãi kẹt ở phân khúc bình dân.",
    },
  ],

  // ── Roadmap ──
  roadmapLabel: "Lộ trình kiến thức bên trong",
  roadmapHeading: "Lộ trình 8 chương:\ntừ bản năng đến hệ thống",
  roadmapPreviewHeading: "Trải nghiệm trực quan không gian bên trong ấn phẩm",
  roadmapPreviewDesc: "Mời bạn đọc thử 1 phần chương 6 - Font preview.",
  productsEbookEmbed: "https://heyzine.com/flip-book/38fd95cbdc.html",
  productsVideoGif: "/video-preview2.gif",

  roadmapIframeUrl: "https://heyzine.com/flip-book/38fd95cbdc.html",
  roadmapChaptersHeading: "Hệ thống hóa toàn bộ tư duy thiết kế của bạn:",
  roadmapChaptersGif: "",
  stages: [
    {
      n: "Chương 1–4",
      title: "Nền Tảng Cội Nguồn",
      sub: "Bóc tách 4 dòng Typeface cốt lõi",
      desc: "Hiểu rõ sự uy quyền của Serif, tính công năng của Sans-Serif, sự chính xác của Monospace và nét tự nhiên của Script.",
    },
    {
      n: "Chương 5",
      title: "Giải Mã Brief & Năng Lượng Chữ",
      sub: "Phân tích tính cách thương hiệu",
      desc: "Biết cách lên khung logic thiết kế ngay khi vừa đọc yêu cầu của khách hàng dựa trên lịch sử font chữ.",
    },
    {
      n: "Chương 6–7",
      title: "Bản Đồ Quyết Định",
      sub: "Quy trình lọc font nhanh chóng",
      desc: "Rút ngắn thời gian chọn font từ 3 tiếng xuống còn 5 phút nhờ nắm vững quy tắc phối cặp (Font Pairing) cho 10 ngành hàng.",
    },
    {
      n: "Chương 8",
      title: "Can Thiệp Vi Mô",
      sub: "Anatomy, Kerning & Ink-traps",
      desc: "Đi sâu vào cấu tạo giải phẫu Anatomy. Căn chỉnh Kerning, xử lý bẫy mực (Ink-traps) và tự tay gọt nét để ấn phẩm đạt chuẩn chuyên nghiệp cao nhất.",
    },
  ],

  // ── Bonuses ──
  bonusesLabel: "Quà tặng đi kèm không thể bỏ qua",
  bonusesHeading: "Trọn bộ 5 Bonus độc quyền\ntrị giá 1.250.000đ",
  bonusesSub: "Dành cho các bạn đăng ký trong đợt này",
  bonuses: [
    {
      icon: "🗺️",
      title: "Bản đồ Xưởng chữ Quốc tế & Kho Trial Font",
      desc: "Danh sách các xưởng chữ hàng đầu (Grilli Type, Dinamo...) kèm file Font Trial để bạn thực hành và làm Concept Pitching chuẩn quy trình Agency.",
    },
    {
      icon: "📋",
      title: "\"Cheat-sheet\" Ghép cặp Font 10 Ngành hàng",
      desc: "Công thức có sẵn để bạn áp dụng ngay lập tức cho các dự án F&B, Công nghệ, Mỹ phẩm, Bất động sản... mà không cần thử-sai.",
    },
    {
      icon: "✅",
      title: "Checklist 30 lỗi Typography phổ biến",
      desc: "Bộ lọc kiểm tra lỗi cuối cùng (QC) trước khi xuất file gửi khách hàng. Tránh bị khách soi mói những lỗi sơ đẳng.",
    },
    {
      icon: "🗣️",
      title: "Kịch bản Thuyết trình Ngôn ngữ Thị giác",
      desc: "Mẫu tài liệu chứa sẵn các thuật ngữ chuyên môn giúp bạn dõng dạc bảo vệ phương án thiết kế trước khách hàng khó tính.",
    },
    {
      icon: "📱",
      title: "Hướng dẫn Tối ưu Typography cho UI/UX",
      desc: "Các nguyên lý thiết kế khoảng trắng (Negative Space) để tăng tỷ lệ chuyển đổi cho Website và App di động.",
    },
  ],
  bonusesCta: "ĐỂ TÔI TRUY CẬP NGAY BÂY GIỜ",

  // ── Before/After ──
  baLabel: "Sự thay đổi của bạn",
  baHeading: "Trước và sau khi áp dụng hệ thống này",
  baSub: "Đừng để tư duy \"cảm tính\" tiếp tục làm rào cản thu nhập của bạn.",
  beforeLabel: "TRƯỚC KHI HỌC",
  afterLabel: "SAU KHI ÁP DỤNG",
  beforeItems: [
    "Chọn font theo cảm tính cá nhân, hết thử lại xóa.",
    "Revision (Sửa file) với khách 3–5 vòng mà vẫn chưa ưng.",
    "Không giải thích được quyết định thiết kế của mình.",
    "Mỗi dự án lại phải ngồi \"đoán mò\" lại từ đầu.",
  ],
  afterItems: [
    "Chọn và Phối font trong 5 phút dựa trên hệ thống rành mạch.",
    "Chốt duyệt ngay từ vòng đầu nhờ có lập luận chuyên môn vững chắc.",
    "Tự tin nhận những dự án lớn vì biết cách xử lý chi tiết vi mô (Kerning, Anatomy).",
    "Có một Framework nhất quán dùng được cho mọi dự án.",
  ],

  // ── Final CTA ──
  urgencyBar: "⚠ ĐẶC QUYỀN ĐĂNG KÝ HÔM NAY — CHỈ CÒN {PRICE} VNĐ",
  ctaLabel: "Bước cuối cùng",
  ctaHeading: "Hoàn tất đăng ký và\ntruy cập ngay hôm nay",
  ctaSub: "Đừng để tư duy \"cảm tính\" tiếp tục làm rào cản thu nhập của bạn. Khi các Designer khác vẫn đang loay hoay đoán mò, bạn sẽ làm việc với sự tự tin và tốc độ của một người có hệ thống.",
  countdownLabel: "⏳ Ưu đãi kết thúc sau:",
  valueStackTitle: "Tổng giá trị bạn nhận được:",
  valueStack: [
    { label: "Ebook Typography Thực chiến (100+ trang)", price: "499.000 VNĐ" },
    { label: "Chuỗi Video \"Live Debugging\" thao tác", price: "800.000 VNĐ" },
    { label: "Bộ 5 Quà Tặng Độc Quyền (Value Add)", price: "200.000 VNĐ" },
  ],
  guarantee: "Cam kết chất lượng: Nếu bạn áp dụng hệ thống này mà không thấy tư duy thiết kế của mình sắc bén hơn, hãy liên hệ, tôi sẽ hoàn tiền 100% không cần hỏi lý do.",

  // ── Footer ──
  footerBrand: "FEDU",
  footerDot: ".",
  footerTagline: "Typography Masterclass — fedu.vn",
  footerLinks: ["Privacy Policy", "Terms & Conditions", "Chính sách hoàn tiền", "Liên hệ hỗ trợ"],
  footerCopyright: "COPYRIGHT 2026 | FEDUDESIGN",

  // ── Legacy (Admin/Editor compat — not rendered on page) ──
  cycleLabel: "Không phải lỗi của bạn",
  cycleHeading: "Bạn không làm xấu.\nBạn chỉ đang giao tiếp sai bằng ngôn ngữ thị giác.",
  cyclePara: "Tôi biết bạn đã nỗ lực tìm mọi cách để nâng cấp chất lượng thiết kế của mình:",
  cycleItems: [
    { fail: "Tải hàng ngàn Font Premium trên mạng", why: "nhưng dùng sai ngữ cảnh vì không đọc vị được năng lượng của ngành hàng." },
    { fail: "Bắt chước các layout trên Behance", why: "trông ổn nhưng không hiểu tại sao đúng, áp dụng vào dự án thực tế lập tức sai tổng thể." },
    { fail: "Học thuộc mọi phím tắt phần mềm", why: "nhưng công cụ không dạy bạn cách xử lý tỷ lệ x-height hay bẫy mực (Ink-traps)." },
    { fail: "Cãi tay đôi với khách hàng", why: "bằng cái tôi nghệ sĩ thay vì phân tích tâm lý học hành vi." },
  ],
  cycleConclusion: "Kết cục? Đứa con tinh thần của bạn vẫn bị tàn phá, và bạn dần chấp nhận số phận bị ép giá.",
  discoveryLabel: "Vào phòng Lab",
  discoveryHeading: "Đi thẳng vào \"phòng Lab\"\nbóc tách các tập đoàn tỷ đô…",
  discoveryPara1: "Xuất phát điểm là một Kỹ sư Phần mềm (ĐH Bách Khoa) với 15 năm làm Giảng viên rà lỗi đồ án tại FPT Arena, tôi không nhìn Typography bằng \"cảm hứng\".",
  discoveryPara2: "Sự thật từ các tập đoàn lớn đã chứng minh: nghệ thuật xếp chữ hoàn toàn có thể logic hóa được.",
  brandCards: [
    { brand: "Built Robotics", q: "Tại sao lại bẻ góc chữ R và cắt gọt chữ B?", a: "Can thiệp điểm neo tạo sự cứng cáp công nghiệp." },
    { brand: "SpaceX & Tesla", q: "Vì sao bắt buộc dùng Monospace?", a: "Sự chính xác tuyệt đối của dữ liệu và máy móc." },
    { brand: "Royal Academy of Music", q: "Sự cởi mở của họ đến từ đâu?", a: "Sự tinh tế trong việc kiểm soát không gian âm." },
  ],
  insightBox: "Vấn đề lớn nhất: hầu hết Designer trẻ đang dùng sai \"vibe\" của font chữ, tự tay phá nát định vị thương hiệu của khách hàng ngay từ bản nháp đầu tiên.",
  solutionLabel: "Giải pháp",
  solutionHeading: "Hệ sinh thái\n\"Typography Thực Chiến\"",
  solutionSub: "Tôi đã đóng gói toàn bộ quy trình vào hệ thống này. Không chỉ là Ebook — đây là một trải nghiệm đào tạo kép.",
  benefits: [
    { title: "Bóc tách Anatomy", desc: "luôn có kịch bản lý luận sắc bén khiến khách hàng gật đầu ngay vòng 1." },
    { title: "Tiết kiệm 80% thời gian", desc: "nhờ bản đồ ghép cặp font bất bại cho 10 ngành hàng cốt lõi." },
    { title: "Cứu sống UI/UX trên Mobile", desc: "bằng cách làm chủ thuật toán x-height và độ mở Aperture." },
    { title: "Nâng tầm Portfolio Luxury", desc: "nhờ kỹ năng vi chỉnh Kerning và xử lý Bẫy mực (Ink-traps)." },
    { title: "Sáng tạo độc bản", desc: "chủ động phác thảo Logo Script thủ công thay vì xài font đại trà." },
  ],
  bonusesTitle: "🎁 ĐẶC QUYỀN: BỘ 5 \"VŨ KHÍ\" BỔ TRỢ ĐỘC QUYỀN 🎁",

  blocksMeta: {
    order: ["hero", "pain", "instructor", "products", "skills", "roadmap", "bonuses", "before-after", "cta", "footer"],
    hidden: [],
    media: {},
    custom: {},
  },
};

// ─── File-based helpers (replaces localStorage) ───────────────

export async function loadContent(): Promise<PageContent> {
  try {
    const local = localStorage.getItem("typo_content");
    if (local) return { ...DEFAULT_CONTENT, ...JSON.parse(local) };

    const res = await fetch("/api/content?_=" + Date.now());
    if (!res.ok) return { ...DEFAULT_CONTENT };
    const data = (await res.json()) as Partial<PageContent>;
    return { ...DEFAULT_CONTENT, ...data };
  } catch {
    return { ...DEFAULT_CONTENT };
  }
}

export async function saveContent(content: PageContent): Promise<void> {
  localStorage.setItem("typo_content", JSON.stringify(content));
  
  try {
    const res = await fetch("/api/save-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    if (!res.ok) console.warn("Backend save failed");
  } catch (err) {
    console.warn("Backend is unreachable", err);
  }
}

// ─── React context ────────────────────────────────────────────
const ContentCtx = React.createContext<PageContent>(DEFAULT_CONTENT);

export function useContent(): PageContent {
  return useContext(ContentCtx);
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);

  useEffect(() => {
    loadContent().then(setContent);
  }, []);

  return createElement(ContentCtx.Provider, { value: content }, children);
}
