import express from "express";
import path from "path";
import JSZip from "jszip";
import fs from "fs";
import os from "os";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const ADMIN_EMAILS = [
  'itdepartmentpro33@gmail.com',
  'djbmremix87@gmail.com',
  'itdepartmentpro33@app.internal',
  'djbmremix87@app.internal'
];

// Middleware: Body limits & security headers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Simple in-memory rate limiting for API endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const rateLimitMiddleware = (maxRequests = 60, windowMs = 60000) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }
    next();
  };
};

app.use("/api/", rateLimitMiddleware(100, 60000));

// Admin authentication middleware
const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminEmailHeader = req.headers['x-admin-email'] as string;
  const authHeader = req.headers.authorization;
  
  // Accept if valid admin email header is present or Bearer token is provided
  if (adminEmailHeader && ADMIN_EMAILS.includes(adminEmailHeader.toLowerCase())) {
    return next();
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    if (token && token.length > 10) {
      return next();
    }
  }

  // In local preview/dev environment, allow same-origin requests
  const host = req.get('host') || '';
  if (host.includes('localhost') || host.includes('0.0.0.0') || host.includes('run.app')) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized access. Administrator privilege required." });
};

// AI endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Gemini API key is missing or is the default placeholder. Please set a valid GEMINI_API_KEY in environment variables." });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.text || '') }]
      })),
      config: {
        systemInstruction: systemInstruction ? String(systemInstruction) : undefined,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to process AI request." });
  }
});

// Secure Server-side Telegram Proxy Endpoint
app.post("/api/telegram/send", async (req, res) => {
  try {
    const { action, message, lat, lng, metadata } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat || token === 'your_server_telegram_bot_token_here') {
      return res.status(400).json({ error: "Server Telegram credentials not configured." });
    }

    const allowedActions = ['order', 'staff_location', 'alert', 'message'];
    if (action && !allowedActions.includes(action)) {
      return res.status(400).json({ error: "Invalid notification action." });
    }

    // Format message depending on action type
    let formattedText = message || '';

    if (action === 'order' && metadata) {
      const order = metadata;
      const itemsList = order.items && Array.isArray(order.items)
        ? order.items.map((i: any) => `• <b>${i.name}</b> × ${i.quantity} = ৳${(i.price * i.quantity).toLocaleString()}`).join('\n')
        : '(No items)';
      formattedText = `🚨 <b>NEW ORDER RECEIVED!</b>\n` +
        `🆔 <b>ID:</b> <code>${order.id || 'N/A'}</code>\n` +
        `👤 <b>Customer:</b> ${order.customerName || 'N/A'}\n` +
        `📞 <b>Phone:</b> ${order.customerPhone || 'N/A'}\n` +
        `💰 <b>Total:</b> ৳${Number(order.total || 0).toLocaleString()}\n\n` +
        `📦 <b>Items:</b>\n${itemsList}`;
    } else if (action === 'staff_location' && (lat !== undefined || metadata?.lat !== undefined)) {
      const staffLat = lat !== undefined ? lat : metadata?.lat;
      const staffLng = lng !== undefined ? lng : metadata?.lng;
      const name = metadata?.staffName || metadata?.name || 'Staff Member';

      const locUrl = `https://api.telegram.org/bot${token.trim()}/sendLocation`;
      await fetch(locUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat.trim(), latitude: staffLat, longitude: staffLng })
      });

      formattedText = `📍 <b>GPS CHECK-IN: ${name}</b>\nCoordinates: ${staffLat}, ${staffLng}`;
    }

    if (formattedText) {
      const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat.trim(),
          text: formattedText,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });
      const data = await response.json();
      return res.json({ ok: data.ok, description: data.description });
    }

    res.status(400).json({ error: "Missing payload data." });
  } catch (err: any) {
    console.error("Telegram proxy error:", err);
    res.status(500).json({ error: "Failed to dispatch Telegram message." });
  }
});

const DEPLOYMENTS_DIR = path.join(os.tmpdir(), "deployments");
if (!fs.existsSync(DEPLOYMENTS_DIR)) {
  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
}

app.post("/api/deploy", requireAdminAuth, async (req, res) => {
  try {
    const { file, apkFile, apkFileName } = req.body;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const base64Data = file.split(';base64,').pop();
    if (!base64Data) {
      return res.status(400).json({ error: "Invalid base64 payload" });
    }
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 50 * 1024 * 1024) {
      return res.status(400).json({ error: "ZIP file exceeds maximum allowed size (50MB)." });
    }

    const zip = await JSZip.loadAsync(buffer);
    const entries = Object.keys(zip.files);
    
    if (entries.length > 1000) {
      return res.status(400).json({ error: "ZIP archive contains too many files (max 1000)." });
    }

    const deployId = Math.random().toString(36).substring(2, 8);
    const targetDir = path.join(DEPLOYMENTS_DIR, deployId);
    
    fs.mkdirSync(targetDir, { recursive: true });

    if (apkFile && apkFileName) {
      const safeApkName = path.basename(apkFileName);
      if (/^[a-zA-Z0-9_\-.]+\.apk$/.test(safeApkName)) {
        const apkBase64Data = apkFile.split(';base64,').pop();
        if (apkBase64Data) {
          const apkBuffer = Buffer.from(apkBase64Data, 'base64');
          if (apkBuffer.length <= 100 * 1024 * 1024) {
            fs.writeFileSync(path.join(targetDir, safeApkName), apkBuffer);
          }
        }
      }
    }

    let totalDecompressedSize = 0;
    const promises: Promise<void>[] = [];

    zip.forEach((relativePath, zipEntry) => {
      // Prevent path traversal vulnerabilities
      const normalizedPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(targetDir, normalizedPath);

      // Verify resolved path stays strictly inside target directory
      const relativeToTarget = path.relative(targetDir, filePath);
      if (relativeToTarget.startsWith('..') || path.isAbsolute(relativeToTarget)) {
        throw new Error("Path traversal detected in archive entry.");
      }

      if (!zipEntry.dir) {
        promises.push(
          zipEntry.async("nodebuffer").then((content) => {
            totalDecompressedSize += content.length;
            if (totalDecompressedSize > 200 * 1024 * 1024) {
              throw new Error("Decompressed size limit exceeded (200MB).");
            }
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, content);
          })
        );
      }
    });

    await Promise.all(promises);

    res.json({ success: true, deployId });
  } catch (err: any) {
    console.error("Deploy error:", err);
    res.status(500).json({ error: "Failed to complete deployment process." });
  }
});

// Serve static deployments
app.use("/d", express.static(DEPLOYMENTS_DIR));

// Source Code Explorer Endpoints (Safe allowlist)
const ALLOWED_SOURCE_FILES = [
  "src/App.tsx",
  "src/types.ts",
  "src/firebase.ts",
  "src/index.css",
  "src/main.tsx",
  "src/lib/utils.ts",
  "src/lib/telegram.ts",
  "src/lib/cache.ts",
  "package.json",
  "vite.config.ts",
  "tsconfig.json",
  "server.ts",
  "index.html",
  "firestore.rules"
];

app.get("/api/source-code/list", requireAdminAuth, (req, res) => {
  res.json({ files: ALLOWED_SOURCE_FILES });
});

app.get("/api/source-code/file", requireAdminAuth, (req, res) => {
  try {
    const relativePath = String(req.query.path || "");
    if (!ALLOWED_SOURCE_FILES.includes(relativePath)) {
      return res.status(403).json({ error: "Access denied or file not allowed" });
    }
    const fullPath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    res.json({ path: relativePath, content });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read source file." });
  }
});

app.get("/api/source-code/all-combined", requireAdminAuth, (req, res) => {
  try {
    let combined = "";
    for (const relPath of ALLOWED_SOURCE_FILES) {
      const fullPath = path.join(process.cwd(), relPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        combined += `\n/* ========================================== */\n`;
        combined += `/* START OF FILE: ${relPath} */\n`;
        combined += `/* ========================================== */\n\n`;
        combined += content;
        combined += `\n\n`;
      }
    }
    res.json({ combined });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to process source bundle." });
  }
});

app.get("/api/source-code/download-zip", requireAdminAuth, async (req, res) => {
  try {
    const zip = new JSZip();
    for (const relPath of ALLOWED_SOURCE_FILES) {
      const fullPath = path.join(process.cwd(), relPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath);
        zip.file(relPath, content);
      }
    }
    
    const contentBuffer = await zip.generateAsync({ type: "nodebuffer" });
    res.setHeader("Content-Disposition", "attachment; filename=project-source-code.zip");
    res.setHeader("Content-Type", "application/zip");
    res.send(contentBuffer);
  } catch (err: any) {
    console.error("Zip generation failed:", err);
    res.status(500).send("Failed to generate zip file.");
  }
});

app.get("/api/source-code/download-portable-html", requireAdminAuth, async (req, res) => {
  try {
    execSync("npm run build", { stdio: "inherit" });

    const distIndex = path.join(process.cwd(), "dist", "index.html");
    if (!fs.existsSync(distIndex)) {
      return res.status(500).send("Build completed but dist/index.html was not found.");
    }

    let html = fs.readFileSync(distIndex, "utf-8");

    const assetsDir = path.join(process.cwd(), "dist", "assets");
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      
      for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const ext = path.extname(file).toLowerCase();
        
        if (ext === ".css") {
          const cssContent = fs.readFileSync(filePath, "utf-8");
          const linkPattern = new RegExp(`<link[^>]*href=["'][^"']*assets/${file}["'][^>]*>`, "g");
          if (linkPattern.test(html)) {
            html = html.replace(linkPattern, `<style>${cssContent}</style>`);
          } else {
            html = html.replace("</head>", `<style>${cssContent}</style></head>`);
          }
        } else if (ext === ".js") {
          const jsContent = fs.readFileSync(filePath, "utf-8");
          const scriptPattern = new RegExp(`<script[^>]*src=["'][^"']*assets/${file}["'][^>]*>\\s*</script>`, "g");
          if (scriptPattern.test(html)) {
            html = html.replace(scriptPattern, `<script type="module">${jsContent}</script>`);
          } else {
            const scriptPattern2 = new RegExp(`<script[^>]*src=["'][^"']*assets/${file}["'][^>]*></script>`, "g");
            if (scriptPattern2.test(html)) {
              html = html.replace(scriptPattern2, `<script type="module">${jsContent}</script>`);
            } else {
              html = html.replace("</body>", `<script type="module">${jsContent}</script></body>`);
            }
          }
        }
      }
    }

    res.setHeader("Content-Disposition", "attachment; filename=crm-system-portable.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    console.error("Portable HTML generation failed:", err);
    res.status(500).send("Failed to generate portable HTML.");
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.NETLIFY) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.NETLIFY) {
  startServer();
}

export { app };
export default app;
