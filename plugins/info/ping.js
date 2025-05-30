module.exports = bot => {
  global.commands = global.commands || [];
  global.commands.push({
    command: '/ping',
    tags: ['info'],
    description: 'Ping bot',
  });
  
  bot.onText(/^\/ping$/, async msg => {
    const start = Date.now();
    const sent = await bot.sendMessage(msg.chat.id, 'Pong!');
    const latency = Date.now() - start;
    
    bot.editMessageText(`Pong! 🏓 ${latency}ms`, {
      chat_id: sent.chat.id,
      message_id: sent.message_id
    });
  });
};