/* License is GPL 3.0.
- made by studio moremi
 - op@kkutu.store
*/
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: '우편함',
    description: '📬 우편함에 든 편지를 확인해요.'
  },

  run: async ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle('📬 우편함')
      .setDescription('편지가 왔어요!')
      .addFields(
        { name: '[alpha 1.0.1] 업데이트', value: '- /가입 명령어 버그 수정/n- /농장 명령어 추가\n- /공동농장 명령어 추가', inline: true },
        { name: '[alpha 1.0.0] 업데이트', value: '- /가입 명령어 추가\n- /인벤토리 명령어 추가\n- /봇정보 명령어 추가\n- /도움말 명령어 추가', inline: true }
      )
      .setFooter({ text: '오늘도 초코 아이스 모레미와 놀아보세요!' });

    await interaction.reply({ embeds: [embed] });
  },
};
