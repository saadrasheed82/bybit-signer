import express from "express";
import crypto from "crypto";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Bybit Signer API running");
});

// SIGN ENDPOINT
app.post("/sign", (req, res) => {
  try {
    const {
      apiKey,
      apiSecret,
      timestamp,
      recvWindow = 5000,
      query = "",
      body = ""
    } = req.body;

    if (!apiKey || !apiSecret || !timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const requestBody = typeof body === "object" ? JSON.stringify(body) : body;

    const payload = `${timestamp}${apiKey}${recvWindow}${query}${requestBody}`;

    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(payload)
      .digest("hex");

    return res.json({
      signature,
      timestamp,
      recvWindow,
      payload
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Signing failed" });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Signer running on port " + PORT);
});
