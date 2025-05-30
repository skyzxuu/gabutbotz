const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.5-flash-preview-04-17'
});

module.exports = bot => {
  global.commands = global.commands || [];
  global.commands.push({
    command: '/ai',
    tags: ['ai'],
    description: 'Chat dengan AI',
  });

  bot.onText(/^\/ai(?:\s(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = match[1];

    if (!prompt) {
      return bot.sendMessage(chatId, 'Contoh penggunaan:\n/ai Apa itu teknologi kuantum?');
    }

    try {
      const loading = await bot.sendMessage(chatId, '⏳ Sedang berpikir...');

      const result = await model.generateContent(prompt);
      const text = result?.response?.text();

      await bot.editMessageText(text || 'Tidak ada respons dari Gemini.', {
        chat_id: chatId,
        message_id: loading.message_id,
        parse_mode: 'Markdown'
      });
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, '❌ Gagal mendapatkan jawaban dari Gemini.');
    }
  });
};