require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const summarizeRoutes = require("./routes/summarize");
const feedbackRoutes = require("./routes/feedback");
const pdfRoutes = require("./routes/pdf");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json({ limit: "2mb" }));

// Rate limit: 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests. Please wait a minute before trying again." },
});

app.use("/api/summarize", limiter);

app.use("/api/summarize", summarizeRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/pdf", pdfRoutes);  // PDF route added, analytics removed

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✅ SUMMARIZER backend running on http://localhost:${PORT}`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? "Loaded ✅" : "MISSING ⚠️"}`);
});
