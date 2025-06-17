// controller/index.js - Enhanced version with error handling
const { handleMessage } = require("./Telegram");

async function handler(req, res) {
  try {
    const { body } = req;

    // Log incoming request for debugging
    console.log("📨 Webhook received:", JSON.stringify(body, null, 2));

    if (body && body.message) {
      const messageObj = body.message;

      // Log message details
      console.log(
        `💬 Processing message from user ${messageObj.from?.id}: "${messageObj.text}"`
      );

      // Handle the message
      await handleMessage(messageObj);

      console.log("✅ Message processed successfully");
    } else {
      console.log("⚠️ No message found in request body");
    }

    // Send response to Telegram
    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Controller error:", error.message);
    console.error("Error stack:", error.stack);

    // Still send OK to Telegram to prevent retries
    return res.status(200).send("OK");
  }
}

module.exports = { handler };
