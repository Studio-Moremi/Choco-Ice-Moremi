const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('도움말')
  .setDescription('도움말을 보여줘요.')
  .addStringOption(option =>
    option
      .setName('help')
      .setDescription('조회할 도움말을 선택하세요.')
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
        .setDescription([
          '/가입 - 초코 아이스 모레미에 가입해요.',
          '/인벤토리 - 인벤토리를 확인할 수 있어요.',
          '/봇정보 - 초코 아이스 모레미에 대해 알려줘요.',
          '/농장 - 자신의 농장을 보여줘요.',
          '/공동농장 - 채널의 공동농장을 보여줘요.'
        ].join('\n'));
    }

    await interaction.reply({ embeds: [embed] });
  },
};