/* License is GPL 3.0.
- made by Studio Moremi.
 - support@studio-moremi.kro.kr
*/
// djs commander 안넣었누
const { joinVoiceChannel } = require('@discordjs/voice');

module.export = function connection(interaction) { 
 return joinVoiceChannel({
  channelId: interaction.member.voice.channel.id, 
  guildId: interaction.member.voice.channel.guild.id, 
  adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
  selfMute: false,
  selfDeaf: true,
 });
}
