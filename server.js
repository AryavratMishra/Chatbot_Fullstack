// server.js (ESM)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple health route
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/gemini", async (req, res) => {
  try {
    const { contents } = req.body;
    if (!contents) return res.status(400).json({ error: "Missing contents" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server missing API key" });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(500).json({ error: data || "Gemini API error" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("SERVER ERROR", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
