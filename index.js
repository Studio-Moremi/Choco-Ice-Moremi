/* License is GPL 3.0.
- made by studio moremi
 - support@studio-moremi.kro.kr
*/
require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const { CommandHandler } = require("djs-commander");
const path = require("path");

const client = new Client({ // 클라이언트 세팅, 인텐트 세팅
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

new CommandHandler({ // 커맨드 세팅
  client,
  commandsPath: path.join(__dirname, "commands"),
  utilsPath: path.join (__dirname, "utils"),
  streamPath: path.join(__dirname, "commands/stream")
});

client.on("ready", (c) => {
  console.log(`bot is online!`);
});

client.login(process.env.TOKEN); // 봇 실행