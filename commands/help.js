/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
/**
* 쿸으다스 수정
* lang 추가
**/
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LANG = require("..\language.json");

const data = new SlashCommandBuilder()
  .setName(`help`)
  .setDescription(`helpdesc`)
  .addStringOption(option =>
    option
      .setName('help')
      .setDescription(`helpoption`)
      .addChoices(
        { name: '모레미', value: '모레미' }
      )
      .setRequired(true)
  );

module.exports = {
  data,
  run: async ({ interaction, client }) => {
    const helpType = interaction.options.getString('help');
    let embed;

    if (helpType === '모레미') {
      embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle('초코 아이스 모레미 도움말')
        .setDescription('초코 아이스 모레미의 명령어 들어있어요.')
        .addFields(
          { name: '농장 🧑‍🌾', value: '농장, 공동농장', inline: true },
          { name: '계정 🧑', value: '어카운드연동, 가입', inline: true },
          { name: '정보 📰', value: '도움말, 봇정보, 라이선스, 우편함', inline: true },
          { name: '생활?ㄴ', value: '출석, 인벤토리', inline: true },
          { name: '음악 🎧', value: '틀어, 멈춰, 연결해', inline: true }
        )
        .setFooter('Hello?');
    }

    await interaction.reply({ embeds: [embed] });
  },
};