/* License is GPL 3.0.
- made by studio moremi
 - op@kkutu.store
*/
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../utils/db');
const LANG = require("../language.json")
const initialFarm = Array(5).fill(Array(5).fill('🟫'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName(LANG.farm)
    .setDescription(LANG.farmdesc),

  run: async ({ interaction }) => {
    const discordId = interaction.user.id;

    db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return interaction.reply({ content: LANG.error100, ephemeral: true });
      }
      if (!row) {
        return interaction.reply({ content: LANG.error104, ephemeral: true });
      }

      let farmStatus = initialFarm.map(row => row.join('')).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle(`${interaction.user.username}님의 농장`)
        .setDescription(farmStatus);

      const actionRow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('farm_action')
            .setPlaceholder(LANG.SelectItem)
            .addOptions([
              { label: LANG.plantLettuce, description: LANG.plantLettuce1, value: 'lettuce' },
              { label: LANG.plantTomato, description: LANG.plantTomato1, value: 'tomato' },
              { label: LANG.plantStrawberry, description: LANG.plantStrawberry1, value: 'strawberry' },
              { label: LANG.waterPlants, description: LANG.waterPlants1, value: 'water' },
              { label: LANG.clearWithered, description: LANG.clearWithered1, value: 'clear_withered' },
              { label: LANG.harvest, description: LANG.harvest1, value: 'harvest' }
            ])
        );

      interaction.reply({ embeds: [embed], components: [actionRow], ephermal: true });

      const collector = interaction.channel.createMessageComponentCollector({
        filter: i => i.user.id === discordId,
        time: 60000,
      });

      collector.on('collect', async (i) => {
        if (i.customId !== 'farm_action') return;

        const action = i.values[0];
        let updateMessage = '';

        if (action === 'lettuce' || action === 'tomato' || action === 'strawberry') {
          updateMessage = `${i.user.username}님이 ${action === 'lettuce' ? '상추' : action === 'tomato' ? '토마토' : '딸기'}를 심었어요!`;
          farmStatus = farmStatus.replace('🟫', action === 'lettuce' ? '🥬' : action === 'tomato' ? '🍅' : '🍓');

        } else if (action === 'water') {
          updateMessage = farmStatus.includes('🥬') || farmStatus.includes('🍅') || farmStatus.includes('🍓')
            ? '물을 줬어요!'
            : '물을 줄 필요가 없어요.';
          farmStatus = farmStatus.replace(/🥬|🍅|🍓/g, match => match);

        } else if (action === 'clear_withered') {
          updateMessage = farmStatus.includes('🧹')
            ? '썩은 식물을 치웠어요!'
            : '치울 썩은 식물이 없어요.';
          farmStatus = farmStatus.replace(/🧹/g, '🟫');

        } else if (action === 'harvest') {
          const crops = farmStatus.match(/🥬|🍅|🍓/g) || [];
          if (crops.length) {
            const harvestSummary = crops.reduce((acc, crop) => {
              const name = crop === '🥬' ? '상추' : crop === '🍅' ? '토마토' : '딸기';
              acc[name] = (acc[name] || 0) + 1;
              return acc;
            }, {});

            Object.keys(harvestSummary).forEach(cropName => {
              db.run(
                `INSERT INTO inventory (discord_id, item_name, quantity) VALUES (?, ?, ?)
                ON CONFLICT(discord_id, item_name) DO UPDATE SET quantity = quantity + ?`,
                [discordId, cropName, harvestSummary[cropName], harvestSummary[cropName]]
              );
            });

            updateMessage = `수확 완료! 인벤토리에 추가되었어요: ${Object.entries(harvestSummary)
              .map(([name, count]) => `${name}: ${count}개`)
              .join(', ')}`;
            farmStatus = farmStatus.replace(/🥬|🍅|🍓/g, '🟫');
          } else {
            updateMessage = '수확할 수 있는 작물이 없어요.';
          }
        }

        const updatedEmbed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle(`${interaction.user.username}님의 농장`)
          .setDescription(farmStatus);

        await i.update({ embeds: [updatedEmbed], content: updateMessage, components: [actionRow], ephermal: true });
      });
    });
  },
};
