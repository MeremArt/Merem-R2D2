// const { sendQuestion } = require("./game.js");
const { getAxiosInstance } = require("./axios");

require("dotenv").config();
const axios = require("axios");
const convertCurrency = async (
  messageObj,
  fromCurrency = "USD", // Default from currency is USD
  toCurrency = "NGN", // Default to currency is NGN
  amount = 1 // Default amount is 1 unit
) => {
  try {
    // Consider using a secure environment variable for the API key instead of hardcoding it
    const apiKey = "ac68b524b3a59e2138fce0480b106139"; // Replace with process.env.EXCHANGERATE_API_KEY
    if (!apiKey) {
      throw new Error("Missing environment variable: EXCHANGERATE_API_KEY");
    }

    const response = await axios.get(
      "https://api.exchangeratesapi.io/v1/convert",
      {
        params: {
          access_key: apiKey,
          from: fromCurrency,
          to: toCurrency,
          amount: amount,
        },
      }
    );

    const responseData = response.data;

    if (responseData.success) {
      const convertedAmount = responseData.result;
      return sendMessage(
        messageObj,
        `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`
      );
    } else {
      throw new Error("API response indicates conversion failure.");
    }
  } catch (error) {
    console.error("Error converting currency:", error.message);
    return sendMessage(messageObj, "Failed to convert currency.");
  }
};

const getCryptoNews = async (messageObj) => {
  try {
    const apiKey = "pub_396785e3cfba86a747a093039efd37715c578"; // Replace with your actual API key
    const response = await axios.get("https://newsdata.io/api/1/news", {
      params: {
        apikey: apiKey,
        q: "pegasus",
        language: "en",
      },
    });

    const data = response.data;

    if (data && data.results && data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const news = data.results[randomIndex];

      const newsTitle = news.title;
      const newsLink = news.link;

      const newsMessage = `News:\n${newsTitle}\n\nLink: ${newsLink}`;
      return sendMessage(messageObj, newsMessage);
    } else {
      throw new Error("No crypto news found.");
    }
  } catch (error) {
    console.error("Error fetching crypto news:", error.message);
    return sendMessage(messageObj, "Failed to fetch crypto news.");
  }
};
const precious = [
  "You are loved",
  "You are beautiful",
  "You are worthy",
  "You are capable",
  "You are strong",
  "You are enough",
  "You are deserving of happiness",
  "You are unique and special",
  "You are resilient",
  "You are a work of art",

  // Add more affirmations as needed
];

const sendPrecious = async (messageObj) => {
  try {
    const randomIndex = Math.floor(Math.random() * precious.length);
    const affirmation = precious[randomIndex];

    return sendMessage(messageObj, affirmation);
  } catch (error) {
    console.error("Error fetching affirmation:", error.message);
    return sendMessage(messageObj, "Failed to fetch affirmation.");
  }
};

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

const handleMessage = async (messageObj) => {
  const messageText = messageObj?.text || "";

  if (messageText.startsWith("/")) {
    const command = messageText.substr(1);
    const botInformationString = `
🌐 Crypto Prices: Type "/price" to Get Bitcoin, Ethereum, and Solana prices.

💬 Motivation: Type "/motivation" for an inspiring quote.

🌦️ Weather: "/weather" + city for forecasts.

🌐 Stay informed with global news! Use "/news" to stay up-to-date. 📰
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
      case "news":
        return getCryptoNews(messageObj);
      case "rate":
        return convertCurrency(messageObj);

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
