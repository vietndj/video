import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

interface FontFile {
  filename: string;
  family: string;
  weight: string;
  style: string;
  format: string;
  url: string;
}

interface FontGroup {
  family: string;
  files: FontFile[];
}

function parseFontFilename(filename: string): { family: string; weight: string; style: string } {
  const ext = path.extname(filename).toLowerCase();
  const base = filename.replace(ext, "");

  // Strip common vendor prefixes
  let name = base
    .replace(/^SVN-/i, "")
    .replace(/^LCGV-/i, "");

  // Extract style first
  const isItalic = /italic/i.test(name);
  const style = isItalic ? "italic" : "normal";

  // Extract weight
  let weight = "400";
  if (/black/i.test(name)) weight = "900";
  else if (/extrabold|extra-bold/i.test(name)) weight = "800";
  else if (/bold/i.test(name)) weight = "700";
  else if (/semibold|semi-bold|demi/i.test(name)) weight = "600";
  else if (/medium/i.test(name)) weight = "500";
  else if (/light/i.test(name)) weight = "300";
  else if (/thin/i.test(name)) weight = "100";
  else if (/air/i.test(name)) weight = "200";

  // Remove weight/style suffixes to get clean family name
  name = name
    .replace(/-?(BlackItalic|Black|ExtraBoldItalic|ExtraBold|BoldItalic|Bold|SemiBoldItalic|SemiBold|MediumItalic|Medium|RegularItalic|Regular|LightItalic|Light|ThinItalic|Thin|AirItalic|Air)/gi, "")
    .replace(/-LCGV-Display/gi, "")
    .replace(/-Display/gi, "")
    .replace(/[-_]+$/, "")
    .trim();

  // Convert NoeDisplay → Noe Display, CamelCase → spaced
  name = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize casing
  name = name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return { family: name, weight, style };
}

router.get("/fonts", (req, res) => {
  try {
    // process.cwd() = artifacts/api-server when pnpm starts this package
    const fontsDir = path.resolve(
      process.cwd(),
      "..",
      "typo-landing",
      "public",
      "fonts"
    );

    if (!fs.existsSync(fontsDir)) {
      res.json({ fonts: [], error: "Fonts directory not found" });
      return;
    }

    const files = fs.readdirSync(fontsDir);
    const fontExtensions = [".ttf", ".otf", ".woff", ".woff2"];

    const fontFiles: FontFile[] = files
      .filter((f) => fontExtensions.includes(path.extname(f).toLowerCase()))
      .map((filename) => {
        const ext = path.extname(filename).toLowerCase();
        const format = ext === ".ttf" ? "truetype"
          : ext === ".otf" ? "opentype"
          : ext === ".woff2" ? "woff2"
          : "woff";

        const { family, weight, style } = parseFontFilename(filename);
        return {
          filename,
          family,
          weight,
          style,
          format,
          url: `/fonts/${filename}`,
        };
      });

    // Group by family
    const grouped: Record<string, FontGroup> = {};
    for (const f of fontFiles) {
      if (!grouped[f.family]) {
        grouped[f.family] = { family: f.family, files: [] };
      }
      grouped[f.family].files.push(f);
    }

    const fonts = Object.values(grouped).sort((a, b) =>
      a.family.localeCompare(b.family)
    );

    // Also return @font-face CSS for each family
    const css = fonts
      .flatMap((g) =>
        g.files.map(
          (f) =>
            `@font-face {\n  font-family: '${g.family}';\n  src: url('${f.url}') format('${f.format}');\n  font-weight: ${f.weight};\n  font-style: ${f.style};\n  font-display: swap;\n}`
        )
      )
      .join("\n\n");

    res.json({ fonts, css });
  } catch (err) {
    req.log.error({ err }, "Failed to scan fonts directory");
    res.status(500).json({ fonts: [], error: "Failed to scan fonts" });
  }
});

export default router;
