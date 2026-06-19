import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const router = Router();

const PUBLIC_DIR = path.resolve(process.cwd(), "../typo-landing/public");

router.post("/save-content", async (req, res) => {
  try {
    const content = req.body;
    if (!content || typeof content !== "object") {
      res.status(400).json({ error: "Invalid content payload" });
      return;
    }
    const filePath = path.join(PUBLIC_DIR, "content.json");
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "save-content failed");
    res.status(500).json({ error: "Failed to save content" });
  }
});

router.post("/save-theme", async (req, res) => {
  try {
    const theme = req.body;
    if (!theme || typeof theme !== "object") {
      res.status(400).json({ error: "Invalid theme payload" });
      return;
    }
    const filePath = path.join(PUBLIC_DIR, "theme.json");
    await fs.writeFile(filePath, JSON.stringify(theme, null, 2), "utf-8");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "save-theme failed");
    res.status(500).json({ error: "Failed to save theme" });
  }
});

export default router;
