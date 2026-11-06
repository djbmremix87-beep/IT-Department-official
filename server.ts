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

// Middleware: Body limits & security headers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
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
    res.status(500).json({ error: error.message || "Failed to process AI request" });
  }
});

// Secure Server-side Telegram Proxy Endpoint
app.post("/api/telegram/send", async (req, res) => {
  try {
    const { botToken, chatId, message, parseMode = 'HTML', lat, lng } = req.body;
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
    const chat = chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat) {
      return res.status(400).json({ error: "Telegram botToken and chatId are required." });
    }

    if (lat !== undefined && lng !== undefined) {
      const url = `https://api.telegram.org/bot${token.trim()}/sendLocation`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat.trim(), latitude: lat, longitude: lng })
      });
      const data = await response.json();
      return res.json(data);
    }

    if (message) {
      const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat.trim(),
          text: String(message),
          parse_mode: parseMode,
          disable_web_page_preview: false
        })
      });
      const data = await response.json();
      return res.json(data);
    }

    res.status(400).json({ error: "Missing message or location coordinates." });
  } catch (err: any) {
    console.error("Telegram proxy error:", err);
    res.status(500).json({ error: "Telegram error: " + err.message });
  }
});

const DEPLOYMENTS_DIR = path.join(os.tmpdir(), "deployments");
if (!fs.existsSync(DEPLOYMENTS_DIR)) {
  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
}

app.post("/api/deploy", async (req, res) => {
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

    const zip = await JSZip.loadAsync(buffer);
    const deployId = Math.random().toString(36).substring(2, 8);
    const targetDir = path.join(DEPLOYMENTS_DIR, deployId);
    
    fs.mkdirSync(targetDir, { recursive: true });

    if (apkFile) {
        const apkBase64Data = apkFile.split(';base64,').pop();
        if (apkBase64Data) {
          const apkBuffer = Buffer.from(apkBase64Data, 'base64');
          fs.writeFileSync(path.join(targetDir, apkFileName || 'app.apk'), apkBuffer);
        }
    }

    const promises: Promise<void>[] = [];

    zip.forEach((relativePath, zipEntry) => {
      // Prevent path traversal vulnerabilities
      const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
      if (!zipEntry.dir) {
        promises.push(
          zipEntry.async("nodebuffer").then((content) => {
            const filePath = path.join(targetDir, safePath);
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
    res.status(500).json({ error: "Failed to deploy: " + err.message });
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

app.get("/api/source-code/list", (req, res) => {
  res.json({ files: ALLOWED_SOURCE_FILES });
});

app.get("/api/source-code/file", (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/source-code/all-combined", (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/source-code/download-zip", async (req, res) => {
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
    res.status(500).send("Failed to generate zip: " + err.message);
  }
});

app.get("/api/source-code/download-portable-html", async (req, res) => {
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
    res.status(500).send("Failed to generate portable HTML: " + err.message);
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
