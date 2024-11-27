/* License is GPL 3.0.
- made by studio moremi
 - op@kkutu.store
*/
/**
 * 쿸으다스 수정 (92 ~ 127)
 * ` -> LANG
 */
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../utils/db');
const LANG = require("../language.json");
const initialSharedFarm = Array(10).fill().map(() => Array(10).fill('🟫'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName(LANG.cofarm)
    .setDescription(LANG.cofarmdesc)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription(LANG.cofarmoption)
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

        const collector = interaction.channel.createMessageComponentCollector({
          filter: i => i.channel.id === channel.id,
          time: 60000,
        });

        collector.on('collect', async (i) => {
          if (i.customId !== 'shared_farm_action') return;

          const action = i.values[0];
          let updateMessage = '';

          if (action === 'plant_lettuce' || action === 'plant_tomato' || action === 'plant_strawberry') {
            const cropEmoji = action === 'plant_lettuce' ? '🥬' : action === 'plant_tomato' ? '🍅' : '🍓';
            updateMessage = `${i.user.username}님이 ${cropEmoji === '🥬' ? '상추' : cropEmoji === '🍅' ? '토마토' : '딸기'}를 심었어요!`;

            for (let row = 0; row < farmData.length; row++) {
              const soilIndex = farmData[row].indexOf('🟫');
              if (soilIndex !== -1) {
                farmData[row][soilIndex] = cropEmoji;
                break;
              }
            }

          } else if (action === 'water_plants') {
            updateMessage = farmData.flat().some(cell => cell === '🥬' || cell === '🍅' || cell === '🍓')
              ? LANG.water
              : LANG.Xwater;

          } else if (action === 'clear_withered') {
            updateMessage = farmData.flat().some(cell => cell === '🧹')
              ? LANG.clearwithered
              : LANG.Xclearwithered;
            farmData.forEach((row, rowIndex) => {
              farmData[rowIndex] = row.map(cell => (cell === '🧹' ? '🟫' : cell));
            });

          } else if (action === 'harvest') {
            const crops = farmData.flat().filter(cell => cell === '🥬' || cell === '🍅' || cell === '🍓');
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
              farmData.forEach((row, rowIndex) => {
                farmData[rowIndex] = row.map(cell => (cell === '🥬' || cell === '🍅' || cell === '🍓' ? '🟫' : cell));
              });
            } else {
              updateMessage = LANG.Xharvest;
            }
          }

          db.run(
            `INSERT INTO shared_farm (channel_id, farm_data) VALUES (?, ?)
            ON CONFLICT(channel_id) DO UPDATE SET farm_data = ?`,
            [channel.id, JSON.stringify(farmData), JSON.stringify(farmData)],
            (err) => {
              if (err) console.error('Error saving farm data:', err.message);
            }
          );

          const updatedEmbed = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle(`공동 농장 (${channel.name} 채널)`)
            .setDescription(farmData.map(row => row.join('')).join('\n'));

          await i.update({ embeds: [updatedEmbed], content: updateMessage, components: [actionRow] });
        });
      });
    });
  }
};
