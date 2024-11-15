/* License is GPL 3.0.
- made by studio moremi
- support@studio-moremi.kro.kr
*/
/**
 * 쿸으다스 수정 (65)
 * 중괄호 빼먹었네
 */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db');
const LANG = require("../language.json");

module.exports = {
  data: {
    name: LANG.createuser,
    description: LANG.userdesc
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
      .setLabel(LANG.Yes)
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(agreeButton);

    await interaction.reply({ embeds: [consentEmbed], components: [row] });

    const discordId = interaction.user.id;

    db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], async (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        await interaction.editReply({ content: LANG.error100, components: [] });
        return;
      }

      if (row) {
        await interaction.editReply({ content: LANG.error103, components: [] });
      } else {
        const initialCoins = 10;
        db.run(
          `INSERT INTO users (discord_id, coins) VALUES (?, ?)`,
          [discordId, initialCoins],
          async (err) => {
            if (err) {
              console.error('Database error:', err.message);
              await interaction.editReply({ content: LANG.error100, components: [] });
            } else {
              await interaction.editReply({ content: LANG.createuserO, components: [] });
            }
          }
        );
      }
    });
  }
};
