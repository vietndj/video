import { Router } from "express";
import { logger } from "../lib/logger";

const router: Router = Router();

const SEPAY_API_KEY = process.env.SEPAY_API_KEY ?? "";
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL ?? "";
const COURSE_AMOUNT = parseInt(process.env.COURSE_AMOUNT ?? "249000", 10);

interface SePayTransaction {
  id: string;
  bank_brand_name: string;
  account_number: string;
  transaction_date: string;
  amount_in: string;
  amount_out: string;
  transaction_content: string;
  reference_number: string;
}

interface SePayResponse {
  status: number;
  transactions?: SePayTransaction[];
}

function viTimestamp() {
  return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

// ─── GET /api/payment/bank-info ───────────────────────────────────────────────
router.get("/payment/bank-info", (_req, res) => {
  res.json({
    bank: process.env.SEPAY_BANK ?? "TPBank",
    account: process.env.SEPAY_ACCOUNT ?? "00008834042",
    holder: process.env.SEPAY_HOLDER ?? "NGUYEN DUC VIET",
    amount: COURSE_AMOUNT,
    content: "TYPO [HO TEN]",
  });
});

// ─── POST /api/lead/register ──────────────────────────────────────────────────
router.post("/lead/register", async (req, res) => {
  try {
    const { name = "", phone = "", email = "", url = "" } = req.body as {
      name?: string;
      phone?: string;
      email?: string;
      url?: string;
    };

    if (!GOOGLE_SCRIPT_URL) {
      req.log.warn("GOOGLE_SCRIPT_URL is not set. Cannot save to Google Sheets.");
      res.json({ success: true, rowIndex: -1 });
      return;
    }

    const payload = {
      action: "append",
      values: [viTimestamp(), name, phone, email, url, "chưa thanh toán"]
    };

    const sheetRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const sheetData = await sheetRes.json() as any;
    req.log.info({ name, phone, sheetData }, "Lead registered to sheet via Google Script");
    
    res.json({ success: true, rowIndex: sheetData.rowIndex ?? -1 });
  } catch (err) {
    logger.error(err, "Error registering lead to sheet");
    res.status(500).json({ error: "Failed to register lead" });
  }
});

// ─── GET /api/payment/check ───────────────────────────────────────────────────
router.get("/payment/check", async (req, res) => {
  try {
    const sinceParam = req.query.since as string | undefined;
    const sinceMs = sinceParam ? parseInt(sinceParam, 10) : Date.now() - 30 * 60 * 1000;

    if (!SEPAY_API_KEY) {
      res.json({ found: false, error: "SEPAY_API_KEY not configured" });
      return;
    }

    const sepayRes = await fetch("https://my.sepay.vn/userapi/transactions/list?limit=20", {
      headers: {
        Authorization: `Bearer ${SEPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await sepayRes.json() as SePayResponse;

    if (!data.transactions) {
      res.json({ found: false });
      return;
    }

    const match = data.transactions.find((tx) => {
      const amountIn = parseFloat(tx.amount_in);
      const txTime = new Date(tx.transaction_date).getTime();
      return amountIn === COURSE_AMOUNT && txTime >= sinceMs;
    });

    if (match) {
      req.log.info({ txId: match.id, amount: match.amount_in }, "Payment match found");
      res.json({ found: true, transaction: match });
      return;
    }

    res.json({ found: false });
  } catch (err) {
    logger.error(err, "Error checking SePay transactions");
    res.status(500).json({ error: "Failed to check payment" });
  }
});

// ─── POST /api/payment/confirm ────────────────────────────────────────────────
router.post("/payment/confirm", async (req, res) => {
  try {
    const { name = "", phone = "", email = "", url = "", transactionId = "", rowIndex } = req.body as {
      name?: string;
      phone?: string;
      email?: string;
      url?: string;
      transactionId?: string;
      rowIndex?: number;
    };

    if (!GOOGLE_SCRIPT_URL) {
      res.json({ success: true });
      return;
    }

    // Notice we use "update_status" by phone number now!
    const payload = {
      action: "update_status",
      phone: phone,
      status: "Đã thanh toán"
    };

    const updateRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const updateData = await updateRes.json();
    req.log.info({ phone, txId: transactionId, updateData }, "Payment confirmed — sheet updated via Google Script");

    res.json({ success: true });
  } catch (err) {
    logger.error(err, "Error confirming payment to sheet");
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// ─── POST /api/sepay/webhook ──────────────────────────────────────────────────
// Receives webhooks directly from SePay when a transaction occurs
router.post("/sepay/webhook", async (req, res) => {
  try {
    const data = req.body;
    req.log.info({ webhookData: data }, "Received SePay Webhook");

    // data typically contains: id, gateway, transactionDate, accountNumber, subAccount, amountIn, amountOut, transferType, content...
    const amountIn = parseFloat(data.amountIn || data.amount_in || "0");
    const content = String(data.content || data.transaction_content || "").toUpperCase();
    
    // Only process if it's an incoming payment of the exact amount
    if (amountIn === COURSE_AMOUNT) {
      // Try to extract phone number from transfer content (e.g., "TYPO 0912345678")
      // This regex looks for 10-11 digit phone numbers in the content
      const phoneMatch = content.match(/0[0-9]{9,10}/);
      const extractedPhone = phoneMatch ? phoneMatch[0] : null;

      if (extractedPhone && GOOGLE_SCRIPT_URL) {
        req.log.info(`Extracted phone ${extractedPhone} from SePay webhook content. Updating Google Sheet...`);
        
        const payload = {
          action: "update_status",
          phone: extractedPhone,
          status: "Đã thanh toán"
        };

        const updateRes = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const updateData = await updateRes.json();
        req.log.info({ phone: extractedPhone, updateData }, "SePay Webhook updated Google Sheet successfully");
      } else {
        req.log.info("Could not extract phone number from SePay webhook content, or GOOGLE_SCRIPT_URL not set.");
      }
    }

    res.json({ success: true });
  } catch (err) {
    logger.error(err, "Error processing SePay webhook");
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
