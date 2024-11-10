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
        return interaction.reply({ content: '에러가 발생했어요! 관리자에게 문의하세요.', ephemeral: true });
      }
      if (!userRow) {
        return interaction.reply({ content: '계정에 로그인되지 않았어요. /가입을 통해 로그인해봐요!', ephemeral: true });
      }

      db.get(`SELECT farm_data FROM shared_farm WHERE channel_id = ?`, [channel.id], async (err, farmRow) => {
        if (err) {
          console.error('Database error:', err.message);
          return interaction.reply({ content: '에러가 발생했어요! 관리자에게 문의하세요.', ephemeral: true });
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
              .setPlaceholder('아이템 선택')
              .addOptions([
                { label: '상추 심기', description: '상추를 심어요.', value: 'plant_lettuce' },
                { label: '토마토 심기', description: '토마토를 심어요.', value: 'plant_tomato' },
                { label: '딸기 심기', description: '딸기를 심어요.', value: 'plant_strawberry' },
                { label: '물주기', description: '모든 작물에 물을 줘요.', value: 'water_plants' },
                { label: '썩은 식물 치우기', description: '썩은 작물을 치워요.', value: 'clear_withered' },
                { label: '수확하기', description: '모든 작물을 수확해요.', value: 'harvest' }
              ])
          );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
      });
    });
  }
};
