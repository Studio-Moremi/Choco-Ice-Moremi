/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');
const LANG = require('../language.json')

const data = new SlashCommandBuilder()
  .setName(LANG.inventory)
  .setDescription(LANG.inventoryDesc);

module.exports = {
  data,
  run: async ({ interaction }) => {
    const discordId = interaction.user.id;

    db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        interaction.reply(LANG.error100);
        return;
      }

      if (!row) {
        return interaction.reply({
          content: LANG.error104,
          ephemeral: true,
        });
      }

      const coinBalance = row.coins;

      db.all(`SELECT item_name, quantity FROM inventory WHERE discord_id = ?`, [discordId], (err, items) => {
        if (err) {
          console.error('Database error:', err.message);
          interaction.reply(LANG.error100);
          return;
        }

        const itemList = items.length > 0 
          ? items.map(item => `${item.item_name}: ${item.quantity}개`).join('\n') 
          : LANG.noItem;

        const embed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle(`${interaction.user.username}님의 인벤토리`)
          .setDescription(`현재 코인: ${coinBalance} ${LANG.coin}`)
          .setDescription('현재 딸기:')
          .addFields([{ name: LANG.Itemlist, value: itemList, inline: false }]);

        interaction.reply({ embeds: [embed] });
      });
    });
  },
};
