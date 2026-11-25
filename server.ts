import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function normalizeBullets(rawBullets: unknown): string[] {
  if (!Array.isArray(rawBullets)) return [];
  return rawBullets
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/^[\s•\-*\d.)]+/, "").trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);
}

async function generateSummaryWithRetry(
  ai: GoogleGenAI,
  payload: {
    title: string;
    category: string;
    excerpt: string;
    content: string[];
  },
  maxRetries = 2
): Promise<string[]> {
  const articleBody = [
    `Judul: ${payload.title}`,
    `Rubrik: ${payload.category}`,
    payload.excerpt ? `Ringkasan Awal: ${payload.excerpt}` : "",
    "Isi Berita:",
    ...payload.content,
  ]
    .filter(Boolean)
    .join("\n\n");

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: articleBody,
        config: {
          systemInstruction:
            "Anda adalah editor senior portal berita KEADILAN.CO.ID. " +
            "Rangkum isi artikel berita menjadi TEPAT 3 poin ringkas berbahasa Indonesia yang faktual, padat, dan informatif (masing-masing 1 kalimat singkat tanpa penomoran atau simbol bullet di dalam teks).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bullets: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description:
                  "Tepat 3 poin ringkasan utama isi artikel berita dalam bahasa Indonesia.",
              },
            },
            required: ["bullets"],
          },
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) {
        throw new Error("EMPTY_SUMMARY_RESPONSE");
      }

      let bullets: string[] = [];
      try {
        const parsed = JSON.parse(rawText) as { bullets?: unknown };
        bullets = normalizeBullets(parsed.bullets);
      } catch {
        bullets = rawText
          .split(/\r?\n+/)
          .map((line) => line.replace(/^[\s•\-*\d.)]+/, "").trim())
          .filter((line) => line.length > 0)
          .slice(0, 3);
      }

      if (bullets.length === 0) {
        throw new Error("EMPTY_SUMMARY_RESPONSE");
      }

      return bullets;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const isTransient =
        message.includes("429") ||
        message.includes("503") ||
        message.includes("UNAVAILABLE") ||
        message.includes("RESOURCE_EXHAUSTED");

      if (!isTransient || attempt === maxRetries) {
        throw err;
      }

      const backoffMs = 500 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/summarize", async (req, res) => {
    const body = req.body as {
      title?: unknown;
      category?: unknown;
      excerpt?: unknown;
      content?: unknown;
    };

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const category = typeof body?.category === "string" ? body.category.trim() : "Umum";
    const excerpt = typeof body?.excerpt === "string" ? body.excerpt.trim() : "";
    const content = Array.isArray(body?.content)
      ? body.content.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      : [];

    if (!title || content.length === 0) {
      res.status(400).json({
        error: "Judul dan isi artikel wajib disertakan untuk membuat ringkasan.",
      });
      return;
    }

    try {
      const ai = createGeminiClient();
      const bullets = await generateSummaryWithRetry(ai, {
        title,
        category,
        excerpt,
        content,
      });
      res.json({ bullets, summary: bullets.join(" ") });
    } catch (err) {
      console.error("[/api/summarize] Gemini API error:", err);
      const message = err instanceof Error ? err.message : String(err);

      if (message === "GEMINI_API_KEY_MISSING") {
        res.status(500).json({
          error:
            "Kunci API Gemini belum dikonfigurasi pada server. Silakan periksa panel Settings > Secrets.",
        });
        return;
      }

      if (
        message.includes("PERMISSION_DENIED") ||
        message.includes("API_KEY_INVALID") ||
        message.includes("403")
      ) {
        res.status(403).json({
          error:
            "Akses Gemini API ditolak atau kunci API tidak valid. Periksa kunci API di panel Settings > Secrets.",
        });
        return;
      }

      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({
          error:
            "Batas permintaan layanan ringkasan AI tercapai sementara. Silakan coba beberapa saat lagi.",
        });
        return;
      }

      if (message.includes("NOT_FOUND") || message.includes("404")) {
        res.status(404).json({
          error:
            "Model AI yang diminta tidak tersedia. Silakan periksa konfigurasi model pada server.",
        });
        return;
      }

      res.status(502).json({
        error: "Gagal menghasilkan ringkasan AI saat ini. Silakan coba lagi.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KEADILAN.CO.ID server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
