const axios = require('axios');

module.exports = bot => {
  global.commands = global.commands || [];
  global.commands.push({
    command: '/flux',
    tags: ['ai'],
    description: 'Hasilkan gambar dari prompt',
  });
  
  bot.onText(/^\/flux(?:\s+(.*))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = match[1];

    if (!prompt) {
      return bot.sendMessage(chatId, `Contoh penggunaan:\n/flux kucing astronot di bulan`);
    }

    const loadingMsg = await bot.sendMessage(chatId, '🎨 Membuat gambar dari prompt kamu...');

    try {
      const response = await axios.get(`${api.fast}/aiimage/flux/diffusion?prompt=${encodeURIComponent(prompt)}`, {
        responseType: 'arraybuffer'
      });

      const buffer = Buffer.from(response.data);

      await bot.sendPhoto(chatId, buffer);
    } catch (err) {
      console.error(err);
      bot.editMessageText('❌ Gagal menghasilkan gambar.', {
        chat_id: chatId,
        message_id: loadingMsg.message_id
      });
    }
  });
}