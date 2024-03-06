const { handleMessage } = require("./Telegram");

async function handler(req, res) {
  const { body } = req;
  if (body) {
    const messageObj = body.message;
    await handleMessage(messageObj);
  }
  return res.send("OK");
}

module.exports = { handler };
