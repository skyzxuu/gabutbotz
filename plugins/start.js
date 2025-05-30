module.exports = bot => {
  bot.onText(/^\/start$/, msg => {
    const name = msg.from.first_name;
    bot.sendMessage(msg.chat.id, `Hai ${name}, aku Zeline 🤖!\nSiap membantumu di Telegram~`);
  });
};