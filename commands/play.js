/* License is GPL 3.0.
- made by Studio moremi
 - support@studio-moremi.kro.kr
*/
const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../index.js');

module.exports = {
 data: new SlashCommandBuilder()
  .setName('재생') 
  .setDescription('음악을 재생합니다.')
  .addStringOption((otpion) => {
   return otpion.setName('url')
   .setDescription('유튜브 링크를 입력하세요.')
   .setRequired(true);
  }),
 async execute(interaction) { 
  if(interaction.member.voice.channel) { 
   const url = interaction.options.data[0].value;
   
    queue.push({
     url: url
    })
     
    if(queue.length == 0) {
   	 stream(interaction,url, (({player, connection}) => {
      queue.shift();
      queue.push({
       url: url,
       player: player,
       connection: connection,
       isClear: false
      })
      
      await interaction.reply('음악이 추가되었습니다.');
     });
    }
  } else {
   await interaction.reply('음성채널에 접속해주세요.');
  }
 },
};
