const express = require("express");
const app = express();
const { handler } = require("./controller/index");
const { PORT } = require("./constants");
const axios = require("axios");
require("dotenv").config();

app.use(express.json());

const serverUrl = `https://merem-r2d2.onrender.com`;

const checkServerHealth = () => {
  axios
    .get(serverUrl)
    .then((response) => {
      console.log(`Server is healthy`, response.data);
    })
    .catch((error) => {
      console.error(`Error checking server health:`, error.message);
    });
};

app.post("*", async (req, res) => {
  try {
    await handler(req, res);
    console.log(req.body);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Internal Server Error");
  }
});

const interval = 50000;
setInterval(checkServerHealth, interval);

checkServerHealth();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
