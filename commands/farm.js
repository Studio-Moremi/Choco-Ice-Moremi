const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const db = require('../utils/db');

const initialFarm = Array(5).fill(Array(5).fill('🟫'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('농장')
    .setDescription('개인 농장을 보여주고 관리할 수 있어요!'),

  run: async ({ interaction }) => {
    const discordId = interaction.user.id;

    db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return interaction.reply({ content: '에러가 발생했어요! 관리자에게 문의하세요.', ephemeral: true });
      }
      if (!row) {
        return interaction.reply({ content: '계정에 로그인되지 않았어요. /가입을 통해 로그인해봐요!', ephemeral: true });
      }

      let farmStatus = initialFarm.map(row => row.join('')).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle(`${interaction.user.username}님의 농장`)
        .setDescription(farmStatus);

      const actionRow = new ActionRowBuilder()
        .addComponents(
          new SelectMenuBuilder()
            .setCustomId('farm_action')
            .setPlaceholder('아이템 선택')
            .addOptions([
              { label: '상추 심기', description: '상추를 심어요.', value: 'lettuce' },
              { label: '토마토 심기', description: '토마토를 심어요.', value: 'tomato' },
              { label: '딸기 심기', description: '딸기를 심어요.', value: 'strawberry' },
              { label: '물주기', description: '모든 작물에 물을 줘요.', value: 'water' },
              { label: '썩은 식물 치우기', description: '썩은 작물을 치워요.', value: 'clear_withered' },
              { label: '수확하기', description: '모든 작물을 수확해요.', value: 'harvest' }
            ])
        );

      interaction.reply({ embeds: [embed], components: [actionRow] });

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

        await i.update({ embeds: [updatedEmbed], content: updateMessage, components: [actionRow] });
      });
    });
  },
};
