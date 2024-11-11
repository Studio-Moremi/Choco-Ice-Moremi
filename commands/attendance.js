/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
const { EmbedBuilder } = require('discord.js');
const LANG = require('../language.json')

module.exports = {
  data: {
    name: '출석',
    description: '출석으로 보상을 받아요!'
  },

  run: async ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle('출석')
      .addFields(
        { name: '출석 완료!', value: '출석 완료! [0일 연속]', inline: true }
      )

    await interaction.reply({ embeds: [embed] });
  },
};