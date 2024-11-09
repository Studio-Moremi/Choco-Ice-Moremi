/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('상태변경')
  .setDescription('봇의 상태를 변경합니다.')
  .addStringOption(option =>
    option
      .setName('상태')
      .setDescription('변경할 상태를 선택하세요')
      .setRequired(true)
      .addChoices(
        { name: '온라인', value: 'online' },
        { name: '방해금지', value: 'dnd' },
        { name: '자리비움', value: 'idle' }
      )
  );

module.exports = {
  data,
  run: async ({ interaction }) => {
    const status = interaction.options.getString('상태');
    const authorNickname = interaction.member.nickname || interaction.user.username;

    if (authorNickname !== 'biduduki') {
      return interaction.reply('이 명령어는 사용 권한이 없습니다.');
    }

    interaction.client.user.setPresence({ status })
      .then(() => interaction.reply(`봇 상태가 '${status}'(으)로 변경되었습니다.`))
      .catch(error => {
        console.error('Error changing status:', error);
        interaction.reply('상태 변경 중 오류가 발생했습니다.');
      });
  },
};