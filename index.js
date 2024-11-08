require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const { CommandHandler } = require("djs-commander");
const path = require("path");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

new CommandHandler({
  client,
  commandsPath: path.join(__dirname, "commands"),
  utilsPath: path.join(__dirnane, "utils"),
  validationsPath: path.join(__dirname, "validations"),
  modelsPath: path.join (__dirname, "models"),
  
});

client.on("ready", (c) => {
  console.log(`bot is online!`);
});

client.login(process.env.TOKEN);