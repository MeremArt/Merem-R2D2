const express = require("express");
const app = express();
const { handler } = require("./controller/index");
const { PORT } = require("./constants");
require("dotenv").config();
app.use(express.json());

app.post("*", async (req, res) => {
  try {
    await handler(req, res);
    console.log(req.body);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("*", async (req, res) => {
  res.send(await handler(req));
  console.log(req.body);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
