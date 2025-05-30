const { susunkata } = require("@bochilteam/scraper");

let activeGames = new Map();
const timeout = 60000;

module.exports = bot => {
  global.commands = global.commands || [];
  global.commands.push({
    command: '/susunkata',
    tags: ['game'],
  });
  async function sendQuestion(chatId) {
    const json = await susunkata();
    const clue = json.jawaban.replace(/[AIUEOaiueo]/g, "_");
    const questionText = `SUSUN KATA\n` +
      `Waktu : 60 Detik\n` +
      `Pertanyaan : ${json.soal} [${json.tipe}]\n` +
      `Clue : ${clue}\n\n` +
      `Ketik jawaban langsung di chat.\nKetik "nyerah" untuk menyerah.`;

    const sent = await bot.sendMessage(chatId, questionText);

    const timeoutId = setTimeout(() => {
      if (activeGames.has(chatId)) {
        bot.sendMessage(chatId, `⏰ Waktu habis!\nJawaban: ${json.jawaban}`);
        activeGames.delete(chatId);
      }
    }, timeout);

    activeGames.set(chatId, {
      question: json,
      timeout: timeoutId,
    });
  }

  bot.onText(/^\/susunkata$/, async (msg) => {
    const chatId = msg.chat.id;
    if (activeGames.has(chatId)) {
      return bot.sendMessage(chatId, "❗ Kamu masih punya soal yang belum dijawab!");
    }

    try {
      await sendQuestion(chatId);
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, "⚠️ Gagal mengambil soal.");
    }
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const game = activeGames.get(chatId);
    if (!game || msg.text?.startsWith("/")) return;

    const answer = msg.text.trim().toLowerCase();
    const correct = game.question.jawaban.toLowerCase();

    if (answer === "nyerah") {
      clearTimeout(game.timeout);
      bot.sendMessage(chatId, `❌ Menyerah!\nJawaban: ${game.question.jawaban}`);
      return activeGames.delete(chatId);
    }

    if (answer === correct) {
      clearTimeout(game.timeout);
      bot.sendMessage(chatId, `✅ Benar!`);
      return sendQuestion(chatId);
    } else {
      clearTimeout(game.timeout);
      bot.sendMessage(chatId, `❌ Salah!\nJawaban yang benar: ${game.question.jawaban}`);
      activeGames.delete(chatId);
    }
  });
};