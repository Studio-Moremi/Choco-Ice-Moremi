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
    .setName(LANG.channelfarm)
    .setDescription(LANG.channelfarmdesc)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription(LANG.channelfarmoption)
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const channel = interaction.options.getChannel('channel');
    const discordId = interaction.user.id;

    db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], (err, userRow) => {
      if (err) {
        console.error('Database error:', err.message);
        return interaction.reply({ content: LANG.error100, ephemeral: true });
      }
      if (!userRow) {
        return interaction.reply({ content: LANG.error104, ephemeral: true });
      }

      db.get(`SELECT farm_data FROM shared_farm WHERE channel_id = ?`, [channel.id], async (err, farmRow) => {
        if (err) {
          console.error('Database error:', err.message);
          return interaction.reply({ content: LANG.error100, ephemeral: true });
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
              .setPlaceholder(LANG.SelectItem)
              .addOptions([
                { label: LANG.plantLettuce, description: LANG.plantLettuce1, value: 'plant_lettuce' },
                { label: LANG.plantTomato, description: LANG.plantTomato1, value: 'plant_tomato' },
                { label: LANG.plantStrawberry, description: LANG.plantStrawberry1, value: 'plant_strawberry' },
                { label: LANG.waterPlants, description: LANG.waterPlants1, value: 'water_plants' },
                { label: LANG.clearWithered, description: LANG.clearWithered1, value: 'clear_withered' },
                { label: LANG.harvest, description: LANG.harvest1, value: 'harvest' }
              ])
          );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
      });
    });
  }
};
