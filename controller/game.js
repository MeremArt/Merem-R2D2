const fetch = require("node-fetch");
const TelegramBot = require("node-telegram-bot-api");
const { MY_TOKEN } = require("../constants");

// Replace 'YOUR_BOT_TOKEN' with your Telegram Bot API token
const token = MY_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Open Trivia Database API endpoint for fetching questions
const apiUrl = "https://opentdb.com/api.php?amount=1&type=multiple";

bot.onText(/\/startgame/, (msg) => {
  // Change the command to /startgame
  const chatId = msg.chat.id;
  sendQuestion(chatId);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Handle user's answer only if the message starts with '/answer'
  if (msg.text.startsWith("/answer")) {
    const userAnswer = msg.text.split(" ")[1];
    checkAnswer(chatId, userAnswer);
  }
});

async function sendQuestion(chatId) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results.length > 0) {
      const question = data.results[0].question;
      const options = data.results[0].incorrect_answers;
      const correctOption = data.results[0].correct_answer;

      // Add the correct option to the options array
      options.push(correctOption);

      // Shuffle the options
      const shuffledOptions = shuffleArray(options);

      // Send the question and options to the user
      const message = `${question}\n\n${shuffledOptions
        .map((option, index) => `${index + 1}. ${option}`)
        .join("\n")}`;
      bot.sendMessage(chatId, message, {
        reply_markup: {
          inline_keyboard: [
            shuffledOptions.map((option, index) => ({
              text: (index + 1).toString(),
              callback_data: `/answer ${index + 1}`, // Include the command in the callback_data
            })),
          ],
        },
      });
    } else {
      bot.sendMessage(
        chatId,
        "Sorry, something went wrong. Please try again later."
      );
    }
  } catch (error) {
    console.error("Error fetching question:", error.message);
    bot.sendMessage(
      chatId,
      "Sorry, something went wrong. Please try again later."
    );
  }
}

function checkAnswer(chatId, userAnswer) {
  const correctOption =
    userAnswer.split(" ")[1] === "1" ? "correct_answer" : "incorrect_answers";
  bot.sendMessage(
    chatId,
    `Your answer: ${userAnswer}\n\nThe correct answer is: ${correctOption}`
  );
}

function shuffleArray(array) {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

console.log("Bot is running...");

// Export the sendQuestion function
module.exports = { sendQuestion };
