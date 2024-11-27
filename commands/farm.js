/* License is GPL 3.0.
- made by studio moremi
- op@kkutu.store
*/
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../utils/db');
const LANG = require("../language.json");
const defaultFarm = JSON.stringify(Array(5).fill(Array(5).fill('🟫')));

module.exports = {
  data: new SlashCommandBuilder()
    .setName(LANG.farm)
    .setDescription(LANG.farmdesc),

  run: async ({ interaction }) => {
    const discordId = interaction.user.id;

    db.get(`SELECT farm_data FROM personal_farm WHERE discord_id = ?`, [discordId], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return interaction.reply({ content: LANG.error100, ephemeral: true });
      }

      let farmData = row ? JSON.parse(row.farm_data) : JSON.parse(defaultFarm);

      const renderFarm = (data) => data.map(row => row.join('')).join('\n');
      let farmStatus = renderFarm(farmData);

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

      interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });

      const collector = interaction.channel.createMessageComponentCollector({
        filter: i => i.user.id === discordId,
        time: 60000,
      });

      collector.on('collect', async (i) => {
        if (i.customId !== 'farm_action') return;

        const action = i.values[0];
        let updateMessage = '';

        if (action === 'lettuce' || action === 'tomato' || action === 'strawberry') {
          const crop = action === 'lettuce' ? '🥬' : action === 'tomato' ? '🍅' : '🍓';
          let planted = false;

          for (let y = 0; y < farmData.length; y++) {
            for (let x = 0; x < farmData[y].length; x++) {
              if (farmData[y][x] === '🟫') {
                farmData[y][x] = crop;
                planted = true;
                break;
              }
            }
            if (planted) break;
          }

          updateMessage = planted
            ? `${i.user.username}님이 ${action === 'lettuce' ? '상추' : action === 'tomato' ? '토마토' : '딸기'}를 심었어요!`
            : '심을 공간이 없어요.';

        } else if (action === 'water') {
          // 물주기
          const crops = ['🥬', '🍅', '🍓'];
          const watered = farmData.some(row => row.some(cell => crops.includes(cell)));

          updateMessage = watered ? '물을 줬어요!' : '물을 줄 작물이 없어요.';

        } else if (action === 'clear_withered') {
          // 썩은 식물 치우기
          let cleared = false;

          for (let y = 0; y < farmData.length; y++) {
            for (let x = 0; x < farmData[y].length; x++) {
              if (farmData[y][x] === '🧹') {
                farmData[y][x] = '🟫';
                cleared = true;
              }
            }
          }

          updateMessage = cleared ? '썩은 식물을 치웠어요!' : '치울 썩은 식물이 없어요.';

        } else if (action === 'harvest') {
          // 수확하기
          const crops = ['🥬', '🍅', '🍓'];
          const harvestSummary = { '🥬': 0, '🍅': 0, '🍓': 0 };

          for (let y = 0; y < farmData.length; y++) {
            for (let x = 0; x < farmData[y].length; x++) {
              if (crops.includes(farmData[y][x])) {
                harvestSummary[farmData[y][x]]++;
                farmData[y][x] = '🟫';
              }
            }
          }

          const totalCrops = Object.values(harvestSummary).reduce((a, b) => a + b, 0);

          if (totalCrops > 0) {
            updateMessage = `수확 완료! 인벤토리에 추가되었어요: ${Object.entries(harvestSummary)
              .map(([crop, count]) => `${crop === '🥬' ? '상추' : crop === '🍅' ? '토마토' : '딸기'}: ${count}개`)
              .join(', ')}`;
          } else {
            updateMessage = '수확할 수 있는 작물이 없어요.';
          }
        }

        farmStatus = renderFarm(farmData);

        db.run(`INSERT INTO personal_farm (discord_id, farm_data) VALUES (?, ?)
                ON CONFLICT(discord_id) DO UPDATE SET farm_data = ?`,
          [discordId, JSON.stringify(farmData), JSON.stringify(farmData)]
        );

        const updatedEmbed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle(`${interaction.user.username}님의 농장`)
          .setDescription(farmStatus);

        await i.update({ embeds: [updatedEmbed], content: updateMessage, components: [actionRow], ephemeral: true });
      });
    });
  },
};