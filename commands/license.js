// 본 코드를 지울 시 라이선스 삭제로 간주합니다
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('라이선스')
  .setDescription('본 봇의 라이선스를 ')
  .addStringOption(option =>
    option
      .setName('help')
      .setDescription('조회할 도움말을 선택하세요.')
      .addChoices(
        { name: '초코 아이스 모레미', value: '초코 아이스 모레미' }
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
        .setTitle('본 봇의 라이선스')
        .setDescription([
          '본 봇의 코드는 **초코 아이스 모레미** 오픈 소스 코드에서 가져왔습니다.\n',
          '이 명령어를 삭제할 시 라이선스 위반으로 간주합니다.\n',
          '레포지토리 주소: [choco-ice-moremi](https://github.com/Teamforest-code/Choco-Ice-Moremi)',
          '제작한 곳: [Studio Moremi](https://discord.gg/QtVTm3bzDW)'
        ].join('\n'));
    }

    await interaction.reply({ embeds: [embed] });
  },
};