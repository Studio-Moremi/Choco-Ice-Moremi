/* License is GPL 3.0.
- made by Studio moremi.
 - support@studio-moremi.kro.kr
*/
// 아 djs commander 안넣었누
const { createAudioResource,StreamType } = require(`@discordjs/voice`);
const ytdl = require('ytdl-core');
module.export = function resource(url) { 
 return createAudioResource(
  ytdl(
   url,
   {
    highWaterMark: 1 << 25,
    quality: 'highestaudio',
    liveBuffer: 4900,
    filter:'audioonly',
   }
 )
}
