import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT || "4000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    {
      name: "local-api-handler",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url || "", `http://${req.headers.host}`);
          
          if (req.method === "POST" && (url.pathname === "/api/save-content" || url.pathname === "/api/save-theme")) {
            try {
              let body = "";
              for await (const chunk of req) {
                body += chunk;
              }
              const data = JSON.parse(body);
              const isContent = url.pathname === "/api/save-content";
              
              // Safety check: reject suspiciously small payloads for content
              const keyCount = Object.keys(data).length;
              console.log(`[API] ${url.pathname} — ${keyCount} keys, ${body.length} bytes`);
              if (isContent && keyCount < 10) {
                console.warn(`[API] REJECTED: content has only ${keyCount} keys — likely corrupt, not saving`);
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: true, message: `Payload too small (${keyCount} keys) — save rejected to prevent data loss` }));
                return;
              }
              
              const targetFile = path.resolve(
                import.meta.dirname,
                "public",
                isContent ? "content.json" : "theme.json"
              );
              
              const fs = await import("fs/promises");
              await fs.writeFile(targetFile, JSON.stringify(data, null, 2), "utf-8");
              
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true, message: `Saved to ${isContent ? "content.json" : "theme.json"} (${keyCount} keys)` }));
              return;
            } catch (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: true, message: String(err) }));
              return;
            }
          }
          
          if (req.method === "POST" && url.pathname === "/api/deploy") {
            try {
              const { exec } = await import("child_process");
              
              // Run git sequence
              exec("git add . && git commit -m \"Update content & theme via local editor\" && git push", {
                cwd: path.resolve(import.meta.dirname, "..")
              }, (error, stdout, stderr) => {
                if (error) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: true, message: stderr || error.message }));
                } else {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ success: true, message: "Deploy completed!", stdout }));
                }
              });
              return;
            } catch (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: true, message: String(err) }));
              return;
            }
          }

          // ─── Upload file (base64 JSON body) ────────────────────
          if (req.method === "POST" && url.pathname === "/api/upload") {
            try {
              let body = "";
              for await (const chunk of req) body += chunk;
              const { filename, data } = JSON.parse(body) as { filename: string; data: string };

              // Strip data:image/xxx;base64, prefix
              const base64 = data.replace(/^data:[^;]+;base64,/, "");
              const buf = Buffer.from(base64, "base64");

              const fs = await import("fs/promises");
              const uploadsDir = path.resolve(import.meta.dirname, "public", "uploads");
              await fs.mkdir(uploadsDir, { recursive: true });

              // Sanitize filename
              const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^_+/, "");
              const unique = `${Date.now()}_${safe}`;
              await fs.writeFile(path.join(uploadsDir, unique), buf);

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true, url: `/uploads/${unique}` }));
              return;
            } catch (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: true, message: String(err) }));
              return;
            }
          }

          // ─── List uploaded assets ───────────────────────────────
          if (req.method === "GET" && url.pathname === "/api/assets") {
            try {
              const fs = await import("fs/promises");
              const uploadsDir = path.resolve(import.meta.dirname, "public", "uploads");
              await fs.mkdir(uploadsDir, { recursive: true });
              const files = await fs.readdir(uploadsDir);
              const IMAGE_EXT = /\.(gif|jpe?g|png|webp|svg)$/i;
              const assets = files.filter(f => IMAGE_EXT.test(f)).map(f => ({
                name: f,
                url: `/uploads/${f}`,
              }));
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ assets }));
              return;
            } catch (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: true, message: String(err) }));
              return;
            }
          }
          // ─── Delete an uploaded asset ──────────────────────────
          if (req.method === "DELETE" && url.pathname.startsWith("/api/assets/")) {
            try {
              const filename = decodeURIComponent(url.pathname.replace("/api/assets/", ""));
              // Security: no path traversal
              if (filename.includes("/") || filename.includes("..")) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: true, message: "Invalid filename" }));
                return;
              }
              const fs = await import("fs/promises");
              const filePath = path.resolve(import.meta.dirname, "public", "uploads", filename);
              await fs.unlink(filePath);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
              return;
            } catch (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: true, message: String(err) }));
              return;
            }
          }
          
          next();
        });
      }
    },
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api/lead/register": {
        target: "https://typo-landing-api.onrender.com",
        changeOrigin: true,
      },
      "/api/payment": {
        target: "https://typo-landing-api.onrender.com",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
