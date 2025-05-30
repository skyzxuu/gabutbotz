module.exports = bot => {
  bot.onText(/\/menu/, msg => {
    const chatId = msg.chat.id;
    const isOwner = chatId === global.ownerId;

    const commands = (global.commands || []).filter(cmd => !cmd.ownerOnly || isOwner);

    if (commands.length === 0) {
      return bot.sendMessage(chatId, 'Tidak ada perintah yang tersedia.');
    }
    
    const tagsSet = new Set();
    commands.forEach(cmd => {
      if (cmd.tags && Array.isArray(cmd.tags)) {
        cmd.tags.forEach(t => tagsSet.add(t));
      } else {
        tagsSet.add('Other');
      }
    });

    const tags = Array.from(tagsSet);

    let menuText = `👋 Halo, *${msg.from.first_name}*\n\nDaftar perintah yang tersedia:\n\n`;

    tags.forEach(tag => {
      menuText += `*${tag.toUpperCase()}*\n`;
      commands
        .filter(cmd => (cmd.tags || ['Other']).includes(tag))
        .forEach(cmd => {
          menuText += `${cmd.command} - ${cmd.description || "Tidak ada deskripsi"}\n`;
        });
      menuText += `\n`;
    });

    bot.sendMessage(chatId, menuText, { parse_mode: 'Markdown' });
  });
};