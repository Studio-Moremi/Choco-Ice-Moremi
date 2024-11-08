const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../utils/db');

module.exports = {
  data: {
    name: '가입',
    description: '초코 아이스 모레미에 가입해요.'
  },
  
  run: async ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle('어떤 항목을 사용하실건가요?')
      .setDescription('아래 버튼을 눌러주세요.');

    const joinButton = new ButtonBuilder()
      .setCustomId('회원가입')
      .setLabel('회원가입')
      .setStyle(ButtonStyle.Primary);

    const loginButton = new ButtonBuilder()
      .setCustomId('로그인')
      .setLabel('로그인')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(joinButton, loginButton);

    await interaction.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
      if (i.customId === '회원가입') {
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

        const disagreeButton = new ButtonBuilder()
          .setCustomId('동의하지 않음')
          .setLabel('동의하지 않음')
          .setStyle(ButtonStyle.Danger);

        const consentRow = new ActionRowBuilder().addComponents(agreeButton, disagreeButton);

        await i.update({ embeds: [consentEmbed], components: [consentRow] });
      }

      if (i.customId === '동의') {
        const modal = new ModalBuilder()
          .setCustomId('아이디입력')
          .setTitle('아이디 만들기');

        const usernameInput = new TextInputBuilder()
          .setCustomId('username')
          .setLabel('사용할 아이디를 입력하세요')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(usernameInput));

        await i.showModal(modal);
      } else if (i.customId === '동의하지 않음') {
        await i.update({ content: '가입이 취소되었어요.', components: [] });
        collector.stop();
      }
    });

    interaction.client.on('interactionCreate', async (modalInteraction) => {
      if (!modalInteraction.isModalSubmit()) return;

      if (modalInteraction.customId === '아이디입력') {
        const username = modalInteraction.fields.getTextInputValue('username');

        db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
          if (row) {
            await modalInteraction.reply({ content: '중복된 아이디에요.', ephemeral: true });
          } else {
            const passwordModal = new ModalBuilder()
              .setCustomId('비밀번호입력')
              .setTitle('비밀번호 만들기');

            const passwordInput = new TextInputBuilder()
              .setCustomId('password')
              .setLabel('6자 이상 12자 이하 비밀번호를 입력하세요')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            passwordModal.addComponents(new ActionRowBuilder().addComponents(passwordInput));

            await modalInteraction.showModal(passwordModal);
          }
        });
      } else if (modalInteraction.customId === '비밀번호입력') {
        const password = modalInteraction.fields.getTextInputValue('password');

        if (password.length >= 6 && password.length <= 12) {
          const discordId = modalInteraction.user.id;
          const username = modalInteraction.fields.getTextInputValue('username');

          db.run(
            `INSERT INTO users (discord_id, username, password) VALUES (?, ?, ?)`,
            [discordId, username, password],
            async (err) => {
              if (err) {
                console.error(err);
                await modalInteraction.reply({ content: '에러가 발생했어요! 해당 에러가 지속될 경우 관리자에게 문의하세요. [Database Run ERROR]', ephemeral: true });
              } else {
                await modalInteraction.reply({ content: '계정이 성공적으로 생성되었어요!', ephemeral: true });
              }
            }
          );
        } else {
          await modalInteraction.reply({ content: '비밀번호는 6자 이상 12자 이하로 설정해야 합니다.', ephemeral: true });
        }
      }
    });
  },
};
