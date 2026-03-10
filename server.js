import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

app.post("/api/models", async (req, res) => {
  const baseUrl = normalizeBaseUrl(req.body?.baseUrl);
  const apiKey = String(req.body?.apiKey || "").trim();

  if (!baseUrl || !apiKey) {
    return res.status(400).json({ error: "baseUrl and apiKey are required." });
  }

  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || data?.message || "Failed to load models.";
      return res.status(response.status).json({ error: message, details: data });
    }

    const models = Array.isArray(data?.data)
      ? data.data
          .map((item) => item?.id)
          .filter((id) => typeof id === "string" && id.trim())
          .sort((a, b) => a.localeCompare(b))
      : [];

    return res.json({ models });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach upstream API.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post("/api/chat", async (req, res) => {
  const baseUrl = normalizeBaseUrl(req.body?.baseUrl);
  const apiKey = String(req.body?.apiKey || "").trim();
  const model = String(req.body?.model || "").trim();
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;

  if (!baseUrl || !apiKey || !model) {
    return res.status(400).json({ error: "baseUrl, apiKey, and model are required." });
  }

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "messages is required." });
  }

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || data?.message || "Upstream request failed.";
      return res.status(response.status).json({ error: message, details: data });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: "No assistant content returned.", details: data });
    }

    return res.json({ content, raw: data });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach upstream API.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(port, () => {
  console.log(`Chatbot server running at http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Set another port with PORT=3001 npm start`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});
