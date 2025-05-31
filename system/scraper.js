const axios = require('axios');
const fs = require("fs");

module.exports = {
  tiktok: {
    search: async function (query) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await axios({
            method: 'POST',
            url: 'https://tikwm.com/api/feed/search',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'Cookie': 'current_language=en',
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
            },
            data: {
              keywords: query,
              count: 10,
              cursor: 0,
              HD: 1
            }
          });

          const videos = response.data.data.videos;
          if (videos.length === 0) {
            reject("Tidak ada video ditemukan.");
          } else {
            const randomIndex = Math.floor(Math.random() * videos.length);
            const videorndm = videos[randomIndex];

            const result = {
              title: videorndm.title,
              cover: videorndm.cover,
              origin_cover: videorndm.origin_cover,
              no_watermark: videorndm.play,
              watermark: videorndm.wmplay,
              music: videorndm.music,
              author: videorndm.author.nickname,
              views: videorndm.play_count
            };
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    },

    download: async function (query) {
      return new Promise(async (resolve, reject) => {
        try {
          const encodedParams = new URLSearchParams();
          encodedParams.set("url", query);
          encodedParams.set("hd", "1");

          const response = await axios({
            method: "POST",
            url: "https://tikwm.com/api/",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "Cookie": "current_language=en",
              "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            },
            data: encodedParams,
          });

          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      });
    }
  }
};