import express from "express";
import path from "path";
import JSZip from "jszip";
import fs from "fs";
import os from "os";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// AI endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Gemini API key is missing or is the default placeholder. Please set a valid GEMINI_API_KEY in the Secrets panel." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message || "Failed to process AI request" });
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
      res.status(400).json({ error: "No file provided" });
      return;
    }

    // Extract base64 data section: data:application/zip;base64,....
    const base64Data = file.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');

    const zip = await JSZip.loadAsync(buffer);
    const deployId = Math.random().toString(36).substring(2, 8);
    const targetDir = path.join(DEPLOYMENTS_DIR, deployId);
    
    fs.mkdirSync(targetDir, { recursive: true });

    // Try to save APK if uploaded
    if (apkFile) {
        const apkBase64Data = apkFile.split(';base64,').pop();
        const apkBuffer = Buffer.from(apkBase64Data, 'base64');
        fs.writeFileSync(path.join(targetDir, apkFileName || 'app.apk'), apkBuffer);
    }

    const promises: Promise<void>[] = [];

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        promises.push(
          zipEntry.async("nodebuffer").then((content) => {
            const filePath = path.join(targetDir, relativePath);
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

// Serve the deployments
app.use("/d", express.static(DEPLOYMENTS_DIR));

// --- Source Code Explorer Endpoints ---
app.get("/api/source-code/list", (req, res) => {
  const safeList = [
    "src/App.tsx",
    "src/types.ts",
    "src/firebase.ts",
    "src/index.css",
    "src/main.tsx",
    "src/lib/utils.ts",
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "server.ts",
    "index.html",
    "firestore.rules"
  ];
  res.json({ files: safeList });
});

app.get("/api/source-code/file", (req, res) => {
  try {
    const relativePath = String(req.query.path || "");
    const safeList = [
      "src/App.tsx",
      "src/types.ts",
      "src/firebase.ts",
      "src/index.css",
      "src/main.tsx",
      "src/lib/utils.ts",
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "server.ts",
      "index.html",
      "firestore.rules"
    ];
    if (!safeList.includes(relativePath)) {
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
    const relativeFiles = [
      "src/App.tsx",
      "src/types.ts",
      "src/firebase.ts",
      "src/index.css",
      "src/main.tsx",
      "src/lib/utils.ts",
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "server.ts",
      "index.html",
      "firestore.rules"
    ];
    let combined = "";
    for (const relPath of relativeFiles) {
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
    const relativeFiles = [
      "src/App.tsx",
      "src/types.ts",
      "src/firebase.ts",
      "src/index.css",
      "src/main.tsx",
      "src/lib/utils.ts",
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "server.ts",
      "index.html",
      "firestore.rules"
    ];
    
    const zip = new JSZip();
    for (const relPath of relativeFiles) {
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
    // 1. Run production build so we have the absolute latest code compiled in /dist
    execSync("npm run build", { stdio: "inherit" });

    // 2. Locate dist/index.html
    const distIndex = path.join(process.cwd(), "dist", "index.html");
    if (!fs.existsSync(distIndex)) {
      return res.status(500).send("Build completed but dist/index.html was not found.");
    }

    let html = fs.readFileSync(distIndex, "utf-8");

    // 3. Scan dist/assets/ for css and js files to inline
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

    // Set download headers
    res.setHeader("Content-Disposition", "attachment; filename=crm-system-portable.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    console.error("Portable HTML generation failed:", err);
    res.status(500).send("Failed to generate portable HTML: " + err.message);
  }
});

app.get("/api/source-code/portable-html-text", async (req, res) => {
  try {
    // 1. Run production build so we have the absolute latest code compiled in /dist
    execSync("npm run build", { stdio: "inherit" });

    // 2. Locate dist/index.html
    const distIndex = path.join(process.cwd(), "dist", "index.html");
    if (!fs.existsSync(distIndex)) {
      return res.status(500).json({ error: "Build completed but dist/index.html was not found." });
    }

    let html = fs.readFileSync(distIndex, "utf-8");

    // 3. Scan dist/assets/ for css and js files to inline
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

    res.json({ html });
  } catch (err: any) {
    console.error("Portable HTML generation failed:", err);
    res.status(500).json({ error: "Failed to generate portable HTML: " + err.message });
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
