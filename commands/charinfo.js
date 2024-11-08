/* 메이플
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require('axios');
const cheerio = require('cheerio');
const $ = cheerio.load(html.data);
const charImg = $("img.character-image").attr("src");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("메이플캐릭터")
    .setDescription("메이플스토리의 캐릭터의 정보를 알려줘요!")
    .addStringOption((option) =>
      option
        .setName("닉네임")
        .setDescription("정보를 가져올 캐릭터의 닉네임을 써주세요!")
        .setRequired(true)
    ),
    run: async ({ interaction }) => {
        const nickName = interaction.options.get("닉네임").value;
        const html = await axios.get(`https://maple.gg/u/${nickName}`);
        console.log(html);
        const embed = new EmbedBuilder().setTitle(`${nickName}`).addFields(
            {
              name: "레벨",
              value: `${level}`,
            },
            {
              name: "직업",
              value: `${job}`,
            }
          );
          interaction.reply({ embeds: [embed] });
        }
};*/