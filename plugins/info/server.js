const os = require("os");
const process = require("process");

module.exports = (bot) => {
  bot.onText(/^\/serverinfo$/, async (msg) => {
    const chatId = msg.chat.id;

    const uptime = process.uptime();
    const formatUptime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${h}h ${m}m ${s}s`;
    };

    const info = [
      `🖥️ Server Information`,
      `• OS        : ${os.type()} ${os.release()} (${os.platform()})`,
      `• Arch      : ${os.arch()}`,
      `• CPU       : ${os.cpus()[0].model}`,
      `• Cores     : ${os.cpus().length}`,
      `• RAM Total : ${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
      `• RAM Free  : ${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`,
      `• Uptime    : ${formatUptime(uptime)}`,
      `• Load Avg  : ${os.loadavg().map(n => n.toFixed(2)).join(" / ")}`,
      `• NodeJS    : ${process.version}`,
      `• Work Dir  : ${process.cwd()}`,
    ];

    bot.sendMessage(chatId, info.join("\n"));
  });
};
