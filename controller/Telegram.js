// const { sendQuestion } = require("./game.js");
const { getAxiosInstance } = require("./axios");

require("dotenv").config();
const axios = require("axios");

const getCryptoPrices = async (messageObj) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,solana",
          vs_currencies: "usd",
        },
      }
    );

    const bitcoinPrice = response.data.bitcoin.usd;
    const ethereumPrice = response.data.ethereum.usd;
    const solanaPrice = response.data.solana.usd;

    const pricesMessage = `Bitcoin (BTC): $${bitcoinPrice}\nEthereum (ETH): $${ethereumPrice}\nSolana (SOL): $${solanaPrice}`;
    return sendMessage(messageObj, pricesMessage);
  } catch (error) {
    console.error("Error fetching crypto prices:", error.message);
    return sendMessage(messageObj, "Failed to fetch crypto prices.");
  }
};

const getMotivation = async (messageObj) => {
  try {
    const response = await fetch("https://type.fit/api/quotes");
    const data = await response.json();

    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const motivationQuote = data[randomIndex].text;
      const author = data[randomIndex].author.split(",")[0].trim(); // Remove "type.fit"

      const formattedQuote = `"${motivationQuote}" - ${author}`;
      return sendMessage(messageObj, `Motivation Quote: ${formattedQuote}`);
    } else {
      throw new Error("No motivation quotes found.");
    }
  } catch (error) {
    console.error("Error fetching motivation quote:", error.message);
    return sendMessage(messageObj, "Failed to fetch motivation quote.");
  }
};

const getWeather = async (messageObj) => {
  // Replace 'YOUR_OPENWEATHER_API_KEY' with your actual API key
  const apiKey = process.env.WEATHER_API;
  const chat_id = messageObj?.chat?.id;
  let city = "Lagos"; // Default city

  // Extract city from the message if provided by the user
  const messageTokens = messageObj.text.split(" ");
  const weatherCommandIndex = messageTokens.findIndex(
    (token) => token.toLowerCase() === "/weather"
  );
  if (
    weatherCommandIndex !== -1 &&
    messageTokens.length > weatherCommandIndex + 1
  ) {
    city = messageTokens[weatherCommandIndex + 1];
  }

  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    );

    const weatherDescription = response.data.weather[0].description;
    const temperatureCelsius = response.data.main.temp - 273.15; // Convert from Kelvin to Celsius

    const weatherMessage = `Current weather in ${city}: ${weatherDescription}. Temperature: ${temperatureCelsius.toFixed(
      2
    )}°C`;

    return sendMessage(messageObj, weatherMessage);
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return sendMessage(messageObj, "Failed to fetch weather information.");
  }
};

const sendMessage = (messageObj, messageText) => {
  const chat_id = messageObj?.chat?.id;
  if (!chat_id) {
    const errorMessage = "Error: chat_id is empty or undefined";
    console.error(errorMessage, messageObj);
    return Promise.reject(errorMessage);
  }

  const data = {
    chat_id: chat_id,
    text: messageText,
  };

  return getAxiosInstance()
    .post("sendMessage", data)
    .then((response) => {
      console.log("Message sent successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error sending message:", error.message);
      throw new Error("Failed to send message.");
    });
};

const handleMessage = (messageObj) => {
  const messageText = messageObj?.text || "";

  if (messageText.startsWith("/")) {
    const command = messageText.substr(1);
    const botInformationString = `
🌐 Crypto Prices: Type "/price" to Get Bitcoin, Ethereum, and Solana prices.

💬 Motivation: Type "/motivation" for an inspiring quote.

🌦️ Weather: "/weather" + city for forecasts.
`;

    console.log(botInformationString);

    switch (command.toLowerCase()) {
      case "start":
        return sendMessage(messageObj, botInformationString);
      case "weather":
        return getWeather(messageObj);
      case "motivation":
        return getMotivation(messageObj);
      case "price":
        return getCryptoPrices(messageObj);
      // case "startgame":

      //   return sendQuestion(messageObj.chat.id);
      default:
        return sendMessage(
          messageObj,
          "Hey, I don't know that command. Try /start, /weather, /motivation, or /price."
        );
    }
  } else if (
    messageText.toLowerCase() === "hi" ||
    messageText.toLowerCase() === "hello"
  ) {
    // Check for variations of "hi" and "hello"
    return sendMessage(
      messageObj,
      "Hey there, I'm Merem-R2D2, a bot created by Merem's-Lab"
    );
  } else {
    return sendMessage(messageObj, messageText);
  }
};

module.exports = { handleMessage };
