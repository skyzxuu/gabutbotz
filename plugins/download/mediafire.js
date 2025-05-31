const axios = require('axios');

module.exports = bot => {
  global.commands = global.commands || [];
  global.commands.push({
    command: '/mediafire',
    tags: ['downloader'],
    description: 'Download video dari MediaFire',
  });

  bot.onText(/\/(mf|mediafire)(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[2];

    if (!text) {
      return bot.sendMessage(chatId, 'Contoh penggunaan:\n/mediafire https://www.mediafire.com/file/xxxxxx');
    }

    const url = text.trim();
    const mediafireRegex = /^(https?:\/\/)?(www\.)?mediafire\.com\/.+$/i;
    if (!mediafireRegex.test(url)) {
      return bot.sendMessage(chatId, `Format salah!\nContoh: /mediafire https://www.mediafire.com/file/xxxxxx`);
    }

    try {
      const apiUrl = `${api.agatz}/api/mediafire?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      const json = response.data;

      if (json.status !== 200 || !json.data || !json.data.length) {
        return bot.sendMessage(chatId, 'Gagal mengambil informasi file dari Mediafire.');
      }

      const result = json.data[0];

      let fileSizeMB = parseFloat(result.size.replace(/MB|KB|GB/g, '').trim());
      if (result.size.includes('KB')) fileSizeMB /= 1024;
      if (result.size.includes('GB')) fileSizeMB *= 1024;

      if (fileSizeMB > 800) {
        return bot.sendMessage(chatId, `*[ system notice ]* Ukuran file ${result.size} melebihi batas maksimum 800 MB. Proses dibatalkan.`, { parse_mode: 'Markdown' });
      }

      const caption = `ᯤ M E D I A F I R E - D O W N L O A D E R\n
Metadata :
- File : ${decodeURIComponent(result.nama)}
- Type : ${result.mime}
- Size : ${result.size}`;

      const fileResponse = await axios.get(result.link, { responseType: 'arraybuffer' });

      await bot.sendDocument(chatId, Buffer.from(fileResponse.data), {
        filename: decodeURIComponent(result.nama),
        caption,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, global.msg.eror);
    }
  });
};