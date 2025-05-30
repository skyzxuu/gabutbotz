require('dotenv').config();
const axios = require('axios')

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

async function getSpotifyToken() {
  const res = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return res.data.access_token
}

function parseTrackId(urlOrId) {
  if (urlOrId.includes('open.spotify.com/track/')) return urlOrId.split('track/')[1].split('?')[0]
  return urlOrId
}

async function getTrackInfo(trackId, token) {
  const res = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  return res.data
}

async function spotifyDownloadUrl(url) {
  const res1 = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`)
  const { gid, id } = res1.data.result
  const res2 = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${gid}/${id}`)
  return `https://api.fabdl.com${res2.data.result.download_url}`
}

module.exports = bot => {
  global.commands = global.commands || [];
  global.commands.push({
    command: '/spotify',
    tags: ['downloader'],
    description: 'Download lagu dari spotify',
  });
  
  bot.onText(/^\/spotify(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id
    const input = match[1]
    if (!input) {
      await bot.sendMessage(chatId, 'Gunakan: /spotify <query atau url>\nContoh: /spotify Shape of You')
      return
    }
    const loadingMsg = await bot.sendMessage(chatId, 'Sedang mencari lagu dan menyiapkan download...')
    try {
      const token = await getSpotifyToken()
      let trackId
      if (input.includes('open.spotify.com/track/')) trackId = parseTrackId(input)
      else {
        const res = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: 'Bearer ' + token },
          params: { q: input, type: 'track', limit: 1 }
        })
        const items = res.data.tracks.items
        if (!items.length) {
          await bot.editMessageText('Lagu tidak ditemukan', { chat_id: chatId, message_id: loadingMsg.message_id })
          return
        }
        trackId = items[0].id
      }
      const trackInfo = await getTrackInfo(trackId, token)
      const trackUrl = trackInfo.external_urls.spotify
      const downloadUrl = await spotifyDownloadUrl(trackUrl)
      const caption = `🎵 ${trackInfo.artists[0].name} - ${trackInfo.name}\n⏱️ Durasi: ${Math.floor(trackInfo.duration_ms / 60000)}:${Math.floor((trackInfo.duration_ms % 60000) / 1000).toString().padStart(2, '0')}`
      await bot.deleteMessage(chatId, loadingMsg.message_id)
      await bot.sendAudio(chatId, downloadUrl, {
        caption,
        title: trackInfo.name,
        performer: trackInfo.artists[0].name,
        thumb: trackInfo.album.images[0].url
      })
    } catch {
      await bot.editMessageText('Maaf, terjadi kesalahan saat mengambil lagu.', { chat_id: chatId, message_id: loadingMsg.message_id })
    }
  })
}