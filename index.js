const express = require("express");
const app = express();
const { handler } = require("./controller/index");
const axios = require("axios");
require("dotenv").config();

app.use(express.json());

const PORT = process.env.PORT || 10000;

// ✅ FIXED: Specific health endpoint (not wildcard)
app.get("/", async (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Merem-R2D2 Bot is running!",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Additional health check endpoint
app.get("/health", async (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ✅ FIXED: Specific webhook endpoint for Telegram
app.post("/webhook", async (req, res) => {
  try {
    // Your handler already sends response, so just call it
    await handler(req, res);
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    // Only send response if handler didn't already send one
    if (!res.headersSent) {
      res.status(200).send("OK");
    }
  }
});

// ❌ REMOVED: Self-pinging (causes issues)
// Don't ping your own server - hosting platforms handle health checks

// ✅ FIXED: Webhook setup function
const setupWebhook = async () => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.log("⚠️ No TELEGRAM_BOT_TOKEN found");
      return;
    }

    // Clear existing webhook
    await axios.post(`https://api.telegram.org/bot${token}/deleteWebhook`);
    console.log("✅ Cleared existing webhook");

    // Set new webhook
    const webhookUrl = `https://merem-r2d2.onrender.com/webhook`;
    await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
      url: webhookUrl,
    });
    console.log(`✅ Webhook set to: ${webhookUrl}`);
  } catch (error) {
    console.error(
      "❌ Webhook setup error:",
      error.response?.data || error.message
    );
  }
};

// ✅ FIXED: Proper server binding
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health: https://merem-r2d2.onrender.com/`);
  console.log(`🤖 Webhook: https://merem-r2d2.onrender.com/webhook`);

  // Setup webhook after server starts
  setTimeout(async () => {
    await setupWebhook();
    console.log("✅ Bot ready to receive messages!");
  }, 3000);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("📴 Shutting down gracefully...");

  try {
    // Clear webhook on shutdown
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      await axios.post(`https://api.telegram.org/bot${token}/deleteWebhook`);
      console.log("✅ Webhook cleared");
    }
  } catch (error) {
    console.error("Error during shutdown:", error.message);
  }

  process.exit(0);
});

console.log("🤖 Merem-R2D2 Bot starting...");
