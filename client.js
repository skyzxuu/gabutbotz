require('dotenv').config();
require('./config');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const pluginsDir = path.join(__dirname, 'plugins');
let loadedPlugins = new Map();

global.commands = [];
global.loadedPlugins = loadedPlugins;

function loadPlugin(filePath) {
  try {
    delete require.cache[require.resolve(filePath)];
    const plugin = require(filePath);
    if (typeof plugin === 'function') {
      plugin(bot);
      console.log(`Plugin loaded: ${filePath}`);
      loadedPlugins.set(filePath, plugin);
    }
  } catch (err) {
    console.error(`Failed to load plugin ${filePath}:`, err);
  }
}

function loadAllPlugins(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadAllPlugins(fullPath);
    } else if (file.endsWith('.js')) {
      loadPlugin(fullPath);
    }
  });
}

loadAllPlugins(pluginsDir);

chokidar.watch(pluginsDir, { ignoreInitial: true })
  .on('add', filePath => {
    if (filePath.endsWith('.js')) {
      loadPlugin(filePath);
    }
  })
  .on('change', filePath => {
    if (filePath.endsWith('.js')) {
      loadPlugin(filePath);
    }
  });

bot.on('message', msg => {
  const time = new Date().toLocaleString();
  const user = `${msg.from.username || msg.from.first_name}`;
  const text = msg.text || '[non-text message]';
  console.log(`[${time}] Pesan dari ${user}: ${text}`);
});

console.log('Bot is running...');