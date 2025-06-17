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
    const messageText = messageObj?.text || "";
    let amount = 1;

    const tokens = messageText.split(" ");
    if (tokens.length > 1 && !isNaN(tokens[1])) {
      amount = parseFloat(tokens[1]);
    }

    let rate = null;

    try {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD",
        {
          timeout: 5000,
        }
      );
      if (response.data?.rates?.NGN) {
        rate = response.data.rates.NGN;
        console.log("✅ Got rate from ExchangeRate-API:", rate);
      }
    } catch (error) {
      console.log("❌ ExchangeRate-API failed, trying backup...");
    }

    // Source 2: Fallback to your current method
    if (!rate) {
      try {
        const CC = require("currency-converter-lt");
        const currencyConverter = new CC({
          from: "USD",
          to: "NGN",
          amount: 1,
        });
        const result = await currencyConverter.convert();
        rate = parseFloat(result);
        console.log("✅ Got rate from currency-converter-lt:", rate);
      } catch (error) {
        console.log("❌ Currency-converter-lt also failed");
      }
    }

    if (!rate) {
      throw new Error("All currency sources failed");
    }

    const convertedAmount = (amount * rate).toLocaleString("en-NG");
    const formattedRate = rate.toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });

    const conversionMessage = `💱 USD to NGN Exchange Rate\n\n💵 ${amount} USD = ₦${convertedAmount} NGN\n📊 Current Rate: 1 USD = ₦${formattedRate}\n\n🕐 Updated: ${new Date().toLocaleTimeString()}`;

    console.log(conversionMessage);

    await sendMessage(messageObj, conversionMessage);

    return conversionMessage;
  } catch (error) {
    console.error("Error converting currency:", error.message);
    const errorMessage =
      "❌ Failed to fetch exchange rate. Please try again later.";

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
const generateAffirmationWithTypes = async () => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return null;
    }

    // Random affirmation types for variety
    const affirmationTypes = [
      "Generate a confidence-building affirmation for Chinemerem focusing on their inner strength",
      "Create a success-oriented affirmation for Chinemerem about achieving their goals",
      "Write a self-worth affirmation for Chinemerem emphasizing their unique value",
      "Generate a motivation affirmation for Chinemerem about overcoming challenges",
      "Create a gratitude-based affirmation for Chinemerem about their blessings and potential",
    ];

    const randomType =
      affirmationTypes[Math.floor(Math.random() * affirmationTypes.length)];

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `${randomType}. Keep it personal, uplifting, and 1-2 sentences. Make it feel genuine and specifically for Chinemerem.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }

    return null;
  } catch (error) {
    console.error("Error with enhanced Gemini affirmations:", error.message);
    return null;
  }
};

const sendPrecious = async (messageObj) => {
  try {
    // Try AI-generated affirmation first
    const aiAffirmation = await generateAffirmationWithTypes();
    if (aiAffirmation) {
      return sendMessage(
        messageObj,
        `✨ R2D2 Personal Affirmation ✨\n\n${aiAffirmation}`
      );
    }

    // Fallback to hardcoded affirmations if AI fails
    const enhancedMerem = [
      "You are loved beyond measure, Chinemerem ✨",
      "You are capable of amazing things, Chinemerem 💪",
      "You are worthy of all good things, Chinemerem 🌟",
      "You are strong beyond measure, Chinemerem 💎",
      "Believe in yourself, Chinemerem - you have incredible potential 🚀",
      "You are deserving of happiness, Chinemerem 😊",
      "You are unique and bring something special to this world, Chinemerem 🦋",
      "You are resilient and unbreakable, Chinemerem 🛡️",
      "You are intelligent and wise, Chinemerem 🧠",
      "You are creative and innovative, Chinemerem 💡",
      "You are filled with unlimited potential, Chinemerem 🌱",
      "You are blessed with abundance, Chinemerem 🙏",
      "You are surrounded by love and positivity, Chinemerem ☀️",
      "You are making a positive difference in the world, Chinemerem 🌍",
      "You are admired for your authentic self, Chinemerem 👑",
      "You are appreciated more than you know, Chinemerem 💝",
    ];

    const randomIndex = Math.floor(Math.random() * enhancedMerem.length);
    const affirmation = enhancedMerem[randomIndex];

    return sendMessage(
      messageObj,
      `✨ Personal Affirmation ✨\n\n${affirmation}`
    );
  } catch (error) {
    console.error("Error generating affirmation:", error.message);
    return sendMessage(messageObj, "❌ Failed to generate affirmation.");
  }
};

const getCryptoPrices = async (messageObj) => {
  try {
    console.log("🔍 Fetching crypto prices...");

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,solana",
          vs_currencies: "usd",
        },
        timeout: 8000, // 8 second timeout
        headers: {
          Accept: "application/json",
          "User-Agent": "Merem-R2D2-Bot/1.0",
        },
      }
    );

    console.log("✅ Got crypto API response:", response.status);

    // Check if we got valid data
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format from CoinGecko API");
    }

    // Validate individual prices
    const bitcoinPrice = response.data.bitcoin?.usd;
    const ethereumPrice = response.data.ethereum?.usd;
    const solanaPrice = response.data.solana?.usd;

    if (!bitcoinPrice || !ethereumPrice || !solanaPrice) {
      console.error("❌ Missing price data:", response.data);
      throw new Error("Incomplete price data received");
    }

    // Format prices with thousand separators
    const formattedBTC = bitcoinPrice.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const formattedETH = ethereumPrice.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const formattedSOL = solanaPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const pricesMessage = `💰 Crypto Prices:\n\n🟠 Bitcoin (BTC): $${formattedBTC}\n🔷 Ethereum (ETH): $${formattedETH}\n🟣 Solana (SOL): $${formattedSOL}\n\n🕐 Updated: ${new Date().toLocaleTimeString()}`;

    console.log("✅ Sending crypto prices message");
    return sendMessage(messageObj, pricesMessage);
  } catch (error) {
    console.error("❌ Crypto prices error:", error.message);
    console.error("Error details:", error.response?.data || error.stack);

    // More specific error messages
    let errorMessage = "❌ Failed to fetch crypto prices.";

    if (error.code === "ECONNABORTED") {
      errorMessage = "❌ Crypto price request timed out. Please try again.";
    } else if (error.response?.status === 429) {
      errorMessage =
        "❌ Rate limit exceeded. Please wait a moment and try again.";
    } else if (error.response?.status >= 500) {
      errorMessage = "❌ CoinGecko server error. Please try again later.";
    } else if (error.message.includes("Invalid response")) {
      errorMessage = "❌ Invalid data from crypto API. Please try again.";
    }

    return sendMessage(messageObj, errorMessage);
  }
};
const getMotivationSimple = async (messageObj) => {
  try {
    const motivationalQuotes = [
      '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
      '"The way to get started is to quit talking and begin doing." - Walt Disney',
      '"Your limitation—it\'s only your imagination." - Anonymous',
      '"Great things never come from comfort zones." - Anonymous',
      '"Dream it. Wish it. Do it." - Anonymous',
      '"Success doesn\'t just find you. You have to go out and get it." - Anonymous',
      '"The harder you work for something, the greater you\'ll feel when you achieve it." - Anonymous',
      "\"Don't stop when you're tired. Stop when you're done.\" - Anonymous",
      '"Wake up with determination. Go to bed with satisfaction." - Anonymous',
      '"Do something today that your future self will thank you for." - Anonymous',
      '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
      '"The only way to do great work is to love what you do." - Steve Jobs',
      '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      '"Life is what happens to you while you\'re busy making other plans." - John Lennon',
      '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
      '"It is during our darkest moments that we must focus to see the light." - Aristotle',
      '"The only impossible journey is the one you never begin." - Tony Robbins',
      '"In the middle of difficulty lies opportunity." - Albert Einstein',
      '"You miss 100% of the shots you don\'t take." - Wayne Gretzky',
      "\"Whether you think you can or you think you can't, you're right.\" - Henry Ford",
      '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb',
      "\"Your time is limited, don't waste it living someone else's life.\" - Steve Jobs",
      '"The only person you are destined to become is the person you decide to be." - Ralph Waldo Emerson',
      '"Success is walking from failure to failure with no loss of enthusiasm." - Winston Churchill',
      '"Don\'t let yesterday take up too much of today." - Will Rogers',
      '"The secret of getting ahead is getting started." - Mark Twain',
      '"It always seems impossible until it\'s done." - Nelson Mandela',
      '"Don\'t watch the clock; do what it does. Keep going." - Sam Levenson',
      '"A year from now you may wish you had started today." - Karen Lamb',
      '"You are never too old to set another goal or to dream a new dream." - C.S. Lewis',
    ];

    // Use crypto.getRandomValues if available, otherwise use Math.random with timestamp
    let randomIndex;
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      randomIndex = array[0] % motivationalQuotes.length;
    } else {
      // Multiple sources of randomness
      const now = Date.now();
      const random1 = Math.random();
      const random2 = Math.random();
      const seed = (now * random1 * random2) % motivationalQuotes.length;
      randomIndex = Math.floor(seed);
    }

    const selectedQuote = motivationalQuotes[randomIndex];

    // Log for debugging
    console.log(
      `🎯 Selected quote index: ${randomIndex} of ${motivationalQuotes.length}`
    );
    console.log(`📝 Quote preview: ${selectedQuote.substring(0, 30)}...`);

    return sendMessage(messageObj, `💪 Daily Motivation:\n\n${selectedQuote}`);
  } catch (error) {
    console.error("Error in simple motivation:", error.message);
    return sendMessage(
      messageObj,
      "❌ Failed to get motivation quote. Please try again."
    );
  }
};
const getMotivation = async (messageObj) => {
  try {
    console.log("🎯 Starting motivation request...");

    // Try Gemini API first for a fresh quote
    const geminiQuote = await generateMotivationalQuoteWithGemini();
    console.log("🤖 Gemini response:", geminiQuote ? "Success" : "Failed");

    if (
      geminiQuote &&
      !geminiQuote.includes("Theodore Roosevelt") &&
      geminiQuote.length > 10
    ) {
      console.log("✅ Using Gemini AI quote");
      return sendMessage(
        messageObj,
        `💪 AI Motivation Quote:\n\n${geminiQuote}`
      );
    }

    console.log("⚠️ Gemini failed, using fallback quotes");

    // Enhanced fallback quotes with better randomization
    const fallbackQuotes = [
      '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
      '"The way to get started is to quit talking and begin doing." - Walt Disney',
      '"Your limitation—it\'s only your imagination." - Anonymous',
      '"Great things never come from comfort zones." - Anonymous',
      '"Dream it. Wish it. Do it." - Anonymous',
      '"Success doesn\'t just find you. You have to go out and get it." - Anonymous',
      '"The harder you work for something, the greater you\'ll feel when you achieve it." - Anonymous',
      "\"Don't stop when you're tired. Stop when you're done.\" - Anonymous",
      '"Wake up with determination. Go to bed with satisfaction." - Anonymous',
      '"Do something today that your future self will thank you for." - Anonymous',
      '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
      '"The only way to do great work is to love what you do." - Steve Jobs',
      '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      '"Life is what happens to you while you\'re busy making other plans." - John Lennon',
      '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
      '"It is during our darkest moments that we must focus to see the light." - Aristotle',
      '"The only impossible journey is the one you never begin." - Tony Robbins',
      '"In the middle of difficulty lies opportunity." - Albert Einstein',
      '"You miss 100% of the shots you don\'t take." - Wayne Gretzky',
      "\"Whether you think you can or you think you can't, you're right.\" - Henry Ford",
      '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb',
      "\"Your time is limited, don't waste it living someone else's life.\" - Steve Jobs",
      '"The only person you are destined to become is the person you decide to be." - Ralph Waldo Emerson',
      '"Success is walking from failure to failure with no loss of enthusiasm." - Winston Churchill',
      '"Don\'t let yesterday take up too much of today." - Will Rogers',
    ];

    // Better randomization using multiple methods
    const timestamp = Date.now();
    const randomSeed = Math.random() * timestamp;
    const randomIndex = Math.floor(randomSeed % fallbackQuotes.length);

    console.log(
      `🎲 Random selection: index ${randomIndex} of ${fallbackQuotes.length} quotes`
    );

    const selectedQuote = fallbackQuotes[randomIndex];
    console.log(`📝 Selected quote: ${selectedQuote.substring(0, 50)}...`);

    return sendMessage(messageObj, `💪 Motivation Quote:\n\n${selectedQuote}`);
  } catch (error) {
    console.error("❌ Error getting motivation:", error.message);
    console.error("Error stack:", error.stack);

    // Emergency fallback quote
    const emergencyQuote =
      '"The only impossible journey is the one you never begin." - Tony Robbins';
    return sendMessage(messageObj, `💪 Motivation Quote:\n\n${emergencyQuote}`);
  }
};

const generateMotivationalQuoteWithGemini = async () => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.log("No Gemini API key found, using fallback");
      return null;
    }

    // Updated Gemini API endpoint
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'Generate one inspiring motivational quote with author attribution. Keep it under 100 words. Format: "Quote text" - Author Name',
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text.trim();
    } else {
      console.log("Gemini API returned unexpected response format");
      return null;
    }
  } catch (error) {
    console.error(
      "Error with Gemini API:",
      error.response?.status,
      error.response?.data || error.message
    );
    return null;
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
          return getMotivationSimple(messageObj);
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
        "Hey there, I'm Merem-R2D2, a bot created by Merem"
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
