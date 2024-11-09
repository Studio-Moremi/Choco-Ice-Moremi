/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: {
    name: '가입',
    description: '초코 아이스 모레미에 가입해요.'
  },

  run: async ({ interaction }) => {
    const consentEmbed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle('회원가입 안내')
      .setDescription(
        `- 가입하시면 스튜디오 모레미 운영정책에 동의하시는 것으로 간주해요.\n` +
        `- 그리고 스튜디오 모레미 개인정보처리방침에 동의하시는 것으로 간주해요.\n` +
        `이해하셨다면 아래 동의 버튼을 눌러주세요.`
      );

    const agreeButton = new ButtonBuilder()
      .setCustomId('동의')
      .setLabel('동의')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(agreeButton);

    await interaction.reply({ embeds: [consentEmbed], components: [row] });

    const filter = i => i.customId === '동의' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
      const discordId = interaction.user.id;

      db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], async (err, row) => {
        if (err) {
          console.error('Database error:', err.message);
          await i.update({ content: '에러가 발생했어요! 관리자에게 문의하세요. [Database Error]', components: [] });
          return;
        }

        if (row) {
          await i.update({ content: '이미 계정이 존재합니다!', components: [] });
        } else {
          const initialCoins = 2000;
          db.run(
            `INSERT INTO users (discord_id, coins) VALUES (?, ?)`,
            [discordId, initialCoins],
            async (err) => {
              if (err) {
                console.error('Database error:', err.message);
                await i.update({ content: '에러가 발생했어요! 관리자에게 문의하세요. [Database Error]', components: [] });
              } else {
                await i.update({ content: '가입이 성공적으로 완료되었어요! 그리고 2000코인이 지급되었어요!', components: [] });
              }
            }
          );
        }
      });

      collector.stop();
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({ content: '시간 초과로 가입이 취소되었어요. 다시 시도해봐요!', components: [] });
      }
    });
  },
};
