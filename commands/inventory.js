/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

const data = new SlashCommandBuilder()
  .setName('인벤토리')
  .setDescription('아이템과 코인을 보여줘요!');

module.exports = {
  data,
  run: async ({ interaction }) => {
    const discordId = interaction.user.id;

    db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        interaction.reply('에러가 발생했어요! 해당 에러가 지속될 경우 관리자에게 문의하세요. [Database Error.]');
        return;
      }

      if (!row) {
        return interaction.reply({
          content: '계정에 로그인되지 않았어요. `/가입`을 통해 로그인해봐요!',
          ephemeral: true,
        });
      }

      const coinBalance = row.coins;

      db.all(`SELECT item_name FROM inventory WHERE discord_id = ?`, [discordId], (err, items) => {
        if (err) {
          console.error('Database error:', err.message);
          interaction.reply('에러가 발생했어요! 해당 에러가 지속될 경우 관리자에게 문의하세요. [Database Error.]');
          return;
        }

        const itemList = items.length > 0 ? items.map(item => item.item_name).join('\n') : '아이템이 없어요.';

        const embed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle(`${interaction.user.username}님의 인벤토리`)
          .setDescription(`현재 코인: ${coinBalance} :coin:`)
          .addFields({ name: '아이템 목록', value: itemList });

        interaction.reply({ embeds: [embed] });
      });
    });
  },
};
