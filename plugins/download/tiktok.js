const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')

module.exports = bot => {
  global.commands = global.commands || []
  global.commands.push({
    command: '/tiktok',
    tags: ['downloader'],
    description: 'Download video dari tiktok'
  })

  bot.onText(/^\/(tiktok|tt)(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id
    const command = match[1]
    const url = match[2]

    if (!url || !url.includes('tiktok.com')) {
      return bot.sendMessage(chatId, `Contoh penggunaan:\n/${command} https://www.tiktok.com/@username/video/1234567890`)
    }

    bot.sendMessage(chatId, 'Sedang memproses...')

    try {
      const res = await scraper.tiktok.download(url)
      const data = res?.data

      if (!data || (!data.play && (!data.images || !data.images.length))) {
        return bot.sendMessage(chatId, '❌ Gagal mengambil data dari TikTok.')
      }

      if (data.images && data.images.length) {
        for (let i = 0; i < data.images.length; i++) {
          const imgUrl = data.images[i]
          const filename = path.join(tmpdir(), `slide${i}.jpg`)
          const imgData = await axios.get(imgUrl, { responseType: 'arraybuffer' })
          fs.writeFileSync(filename, imgData.data)
          await bot.sendPhoto(chatId, filename)
          fs.unlinkSync(filename)
        }
      } else {
        const videoUrl = data.hdplay || data.play
        const caption = `*TikTok Downloader*\n` +
                        `- Judul : ${data.title || 'Tidak ada'}\n` +
                        `- Author : ${data.author?.nickname || '-'}\n` +
                        `- Like : ${data.digg_count?.toLocaleString() || 0}`

        const filename = path.join(tmpdir(), `tiktok.mp4`)
        const videoData = await axios.get(videoUrl, { responseType: 'arraybuffer' })
        fs.writeFileSync(filename, videoData.data)

        await bot.sendVideo(chatId, filename, {
          caption,
          parse_mode: 'Markdown'
        })

        fs.unlinkSync(filename)
      }

    } catch (e) {
      console.error(e)
      bot.sendMessage(chatId, '❌ Gagal memproses video TikTok.')
    }
  })
}