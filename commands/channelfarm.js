/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../utils/db');
const LANG = require("../language.json")
const initialSharedFarm = Array(10).fill(Array(10).fill('🟫'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`channelfarm`)
    .setDescription(`channelfarmdesc`)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription(`channelfarmoption`)
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const channel = interaction.options.getChannel('channel');
    const discordId = interaction.user.id;

    db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], (err, userRow) => {
      if (err) {
        console.error('Database error:', err.message);
        return interaction.reply({ content: `error100`, ephemeral: true });
      }
      if (!userRow) {
        return interaction.reply({ content: `error104`, ephemeral: true });
      }

      db.get(`SELECT farm_data FROM shared_farm WHERE channel_id = ?`, [channel.id], async (err, farmRow) => {
        if (err) {
          console.error('Database error:', err.message);
          return interaction.reply({ content: `error100`, ephemeral: true });
        }

        const farmData = farmRow ? JSON.parse(farmRow.farm_data) : initialSharedFarm;

        const embed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle(`공동 농장 (${channel.name} 채널)`)
          .setDescription(farmData.map(row => row.join('')).join('\n'));

        const actionRow = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('shared_farm_action')
              .setPlaceholder(`SelectItem`)
              .addOptions([
                { label: `plantLettuce`, description: `plantLettuce1`, value: 'plant_lettuce' },
                { label: `plantTomato`, description: `plantTomato1`, value: 'plant_tomato' },
                { label: `plantStrawberry`, description: `plantStrawberry1`, value: 'plant_strawberry' },
                { label: `waterPlants`, description: `waterPlants1`, value: 'water_plants' },
                { label: `clearWithered`, description: `clearWithered1`, value: 'clear_withered' },
                { label: `harvest`, description: `harvest1`, value: 'harvest' }
              ])
          );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
      });
    });
  }
};
