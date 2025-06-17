// const { sendQuestion } = require("./game.js");
const { getAxiosInstance } = require("./axios");
const CC = require("currency-converter-lt");
const { Connection, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
require("dotenv").config();
const axios = require("axios");

// Solana wallet
let userWallets = {};

const addUserWallet = (userId, walletAddress) => {
  userWallets[userId] = walletAddress;
};

const getWalletAmount = async (userId) => {
  try {
    const walletAddress = userWallets[userId];
    if (!walletAddress) {
      throw new Error("No wallet address found for the user.");
    }

    const connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "confirmed"
    );
    const publicKey = new PublicKey(walletAddress);
    const balanceInLamports = await connection.getBalance(publicKey);
    const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
    console.log(`Wallet amount for userId ${userId}: ${balanceInSOL} SOL`);
    return balanceInSOL;
  } catch (error) {
    console.error("Error fetching wallet amount:", error.message);
    throw new Error("Failed to fetch wallet amount.");
  }
};

const convertCurrency = async (messageObj) => {
  try {
    const fromCurrency = "USD";
    const toCurrency = "NGN";
    const amountToConvert = 1;

    const currencyConverter = new CC({
      from: fromCurrency,
      to: toCurrency,
      amount: amountToConvert,
    });

    const response = await currencyConverter.convert();

    const conversionMessage = `${amountToConvert} ${fromCurrency} / ${response} ${toCurrency}`;

    console.log(conversionMessage);

    await sendMessage(messageObj, conversionMessage);

    return conversionMessage;
  } catch (error) {
    console.error("Error converting currency:", error.message);
    const errorMessage = "Failed to convert currency.";

    await sendMessage(messageObj, errorMessage);

    return errorMessage;
  }
};

const getCryptoNews = async (messageObj) => {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY;
    const response = await axios.get("https://newsdata.io/api/1/news", {
      params: {
        apikey: apiKey,
        q: "cryptocurrency bitcoin ethereum solana blockchain",
        language: "en",
        category: "technology",
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
const merem = [
  "You are loved",
  "You are Capable",
  "You are worthy",
  "You are capable",
  "You are strong",
  "You are enough",
  "Believe in yourself Chinemerem",
  "You are deserving of happiness",
  "You are unique and special",
  "You are resilient",
  "You are a work of art",
  "You are intelligent",
  "You are creative",
  "You are filled with potential",
  "You are blessed with abundance",
  "You are surrounded by positivity",
  "You are making a difference",
  "You are admired for who you are",
  "You are appreciated",
  "You are on the path to success",
  "You are a source of inspiration",
  // Add more affirmations as needed
];

const sendPrecious = async (messageObj) => {
  try {
    const randomIndex = Math.floor(Math.random() * merem.length);
    const affirmation = merem[randomIndex];

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

const generateMotivationalQuoteWithGemini = async () => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'Generate one inspiring motivational quote with author attribution. Format: "Quote" - Author Name',
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Error with Gemini API:", error.message);
    return "Believe you can and you're halfway there. - Theodore Roosevelt";
  }
};

const getWeather = async (messageObj) => {
  const apiKey = process.env.WEATHER_API;
  const chat_id = messageObj?.chat?.id;
  let city = "Brampton";

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
  let commandCount = 0;
  try {
    const messageText = messageObj?.text || "";
    const userId = messageObj?.from?.id;

    if (!userId) {
      console.error("Error: userId is empty or undefined", messageObj);
      throw new Error("UserId is missing.");
    }
    if (messageText.startsWith("/")) {
      const command = messageText.substr(1);
      commandCount++; // Increment command count
      console.log(
        `Command received: ${command}. Total commands: ${commandCount}`
      );

      const botInformationString = `
🌐 Crypto Prices: Type "/price" to Get Bitcoin, Ethereum, and Solana prices.

💬 Motivation: Type "/motivation" for an inspiring quote.

🌦️ Weather: "/weather" + city for forecasts.

🌐 Stay informed with global news! Use "/news" to stay up-to-date. 📰

💱 Exchange Rate: Type "/rate" for the current exchange rate between USD and NGN.
`;

      switch (command.toLowerCase()) {
        case "start":
          return sendMessage(messageObj, botInformationString);
        case "weather":
          return getWeather(messageObj);
        case "motivation":
          return generateMotivationalQuoteWithGemini(messageObj);
        case "price":
          return getCryptoPrices(messageObj);
        case "news":
          return getCryptoNews(messageObj);
        case "affirmations":
          return sendPrecious(messageObj);
        case "rate":
          return convertCurrency(messageObj);
        case "wallet": {
          const walletAddress = messageText.split(" ")[1];
          if (!walletAddress) {
            return sendMessage(
              messageObj,
              "Please provide a valid wallet address."
            );
          }
          addUserWallet(userId, walletAddress);
          try {
            const walletAmount = await getWalletAmount(userId);
            return sendMessage(
              messageObj,
              `Your wallet amount is ${walletAmount} SOL.`
            );
            console.log("Your wallet amount is ${walletAmount} SOL.");
          } catch (error) {
            console.error("Error fetching wallet amount:", error.message);
            return sendMessage(messageObj, "Failed to fetch wallet amount.");
          }
        }
        default:
          return sendMessage(
            messageObj,
            "Hey, I don't know that command. Try /start, /weather, /motivation, /price or /rate."
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
  } catch (error) {
    console.error("Error handling message:", error.message);
    return sendMessage(messageObj, "Failed to process your message.");
  }
};

module.exports = { handleMessage };
