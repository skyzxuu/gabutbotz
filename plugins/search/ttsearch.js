const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')

module.exports = bot => {
  global.commands = global.commands || [];
  global.commands.push({
    command: '/tiktoksearch',
    tags: ['search'],
    description: 'Cari video dari TikTok',
  });

  bot.onText(/^\/(tiktoksearch|ttsearch)(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id
    const command = match[1]
    const query = match[2]

    if (!query) {
      return bot.sendMessage(chatId, `Contoh penggunaan:\n/${command} trend tiktok`)
    }

    bot.sendMessage(chatId, '🔍 Mencari video TikTok...')

    try {
      const result = await scraper.tiktok.search(query)
      const data = result

      if (!data || !data.no_watermark) {
        return bot.sendMessage(chatId, '❌ Video tidak ditemukan atau tidak bisa diunduh.')
      }

      const caption = `TikTok Search\n` +
                      `- Title : ${data.title || ""}\n` +
                      `- Author : ${data.author}\n` +
                      `- Views : ${data.views?.toLocaleString() || 0}`

      const filename = path.join(tmpdir(), `tiktok_search.mp4`)
      const videoData = await axios.get(data.no_watermark, { responseType: 'arraybuffer' })
      fs.writeFileSync(filename, videoData.data)

      await bot.sendVideo(chatId, filename, {
        caption,
        parse_mode: 'Markdown',
        thumbnail: data.cover
      })

      fs.unlinkSync(filename)
    } catch (e) {
      console.error(e)
      bot.sendMessage(chatId, global.msg.eror)
    }
  })
}