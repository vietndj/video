import { Router } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "../lib/logger";

const router: Router = Router();

const SEPAY_API_KEY = process.env.SEPAY_API_KEY ?? "";
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const COURSE_AMOUNT = parseInt(process.env.COURSE_AMOUNT ?? "249000", 10);

// Sheet columns: A=Timestamp B=Họ tên C=SĐT D=Email E=Link đăng ký F=Đã thanh toán
const SHEET_NAME = "Trang tính1";
const SHEET_RANGE = `${SHEET_NAME}!A:F`;
const STATUS_COL = "F"; // "Đã thanh toán" column

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

// Extract row number from Google Sheets range string like "Sheet1!A5:F5"
function parseRowFromRange(range: string): number | null {
  const match = range.match(/:?[A-Z]+(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
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
// Called when customer submits registration form.
// Appends a row: [timestamp, name, phone, email, url, "chưa thanh toán"]
// Returns: { rowIndex } so the client can store it and later update the status.
router.post("/lead/register", async (req, res) => {
  try {
    const { name = "", phone = "", email = "", url = "" } = req.body as {
      name?: string;
      phone?: string;
      email?: string;
      url?: string;
    };

    const connectors = new ReplitConnectors();
    const appendUrl = `/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const sheetRes = await connectors.proxy("google-sheet", appendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        values: [[viTimestamp(), name, phone, email, url, "chưa thanh toán"]],
      }),
    });

    const sheetData = await sheetRes.json() as { updates?: { updatedRange?: string }; updatedRange?: string };
    req.log.info({ sheetData }, "Sheet append raw response");

    const updatedRange =
      sheetData.updates?.updatedRange ??
      sheetData.updatedRange ??
      "";
    const rowIndex = parseRowFromRange(updatedRange);

    req.log.info({ name, phone, rowIndex, updatedRange }, "Lead registered to sheet");
    res.json({ success: true, rowIndex });
  } catch (err) {
    logger.error(err, "Error registering lead to sheet");
    res.status(500).json({ error: "Failed to register lead" });
  }
});

// ─── GET /api/payment/check ───────────────────────────────────────────────────
// Polls SePay for a matching transaction since the given timestamp.
router.get("/payment/check", async (req, res) => {
  try {
    const sinceParam = req.query.since as string | undefined;
    const sinceMs = sinceParam ? parseInt(sinceParam, 10) : Date.now() - 30 * 60 * 1000;

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
// Called when payment is confirmed.
// If rowIndex is provided: updates status cell in-place → "done".
// Otherwise: appends a new row (fallback).
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

    const connectors = new ReplitConnectors();

    if (rowIndex && rowIndex > 0) {
      // Update just the status cell (column F) of the existing registration row
      const cellRange = `${SHEET_NAME}!${STATUS_COL}${rowIndex}`;
      const updateUrl = `/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(cellRange)}?valueInputOption=USER_ENTERED`;

      const updateRes = await connectors.proxy("google-sheet", updateUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [["done"]] }),
      });

      const updateData = await updateRes.json();
      req.log.info({ rowIndex, txId: transactionId, updateData }, "Payment confirmed — row updated");
    } else {
      // Fallback: append a new row if no rowIndex stored
      const appendUrl = `/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

      const sheetRes = await connectors.proxy("google-sheet", appendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: [[viTimestamp(), name, phone, email, url, "done"]],
        }),
      });

      const sheetData = await sheetRes.json();
      req.log.info({ txId: transactionId, sheetData }, "Payment confirmed — row appended (no rowIndex)");
    }

    res.json({ success: true });
  } catch (err) {
    logger.error(err, "Error confirming payment to sheet");
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

export default router;
