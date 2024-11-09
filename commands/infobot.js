const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: '봇정보',
    description: '초코 아이스 모레미에 대해 알려줘요.'
  },

  run: async ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle('봇 정보')
      .setDescription('초코 아이스 모레미에 대한 정보에요.')
      .addFields(
        { name: 'Name', value: 'Choco Ice Moremi', inline: true },
        { name: 'version', value: 'alpha 1.0.1', inline: true },
        { name: 'Package', value: 'Package list', inline: true },
        { name: 'Package2', value: 'discord.js - 14.16.3', inline: true },
        { name: 'Package3', value: 'mongoose - 8.8.0', inline: true },
        { name: 'Package4', value: 'dotenv - 16.4.5', inline: true },
        { name: 'Package5', value: 'axios - 1.7.7', inline: true },
        { name: 'Package6', value: 'cheerio - 1.0.0', inline: true },
        { name: 'Package7', value: 'sqlite3 - 5.1.7', inline: true },
        { name: 'Package8', value: 'djs-commander - 0.0.50', inline: true },
        { name: 'Package9', value: 'nodemon - 3.1.7', inline: true },
        { name: 'Developer', value: 'Made by [Studio Moremi](https://discord.gg/fFZaQ54SGS)', inline: true },
      )
      .setFooter({ text: '오늘도 초코 아이스 모레미와 놀아보세요!' });

    await interaction.reply({ embeds: [embed] });
  },
};