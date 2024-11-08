/* 메이플
const { SlashCommandBuilder } = require("discord.js");
const memberDB = require("../models/memberSchema");

module.exports = {
  run: async ({ interaction }) => {
    const inputNick = interaction.options.get("닉네임").value;
    const inputGrade = interaction.options.get("직위").value;
    const ifexist = await memberDB.exists({ nickName: inputNick });
    if (!ifexist) {
      interaction.reply("길드원 정보가 존재하지 않습니다.");
      return;
    }
    try {
      await memberDB.updateOne({ nickName: inputNick }, { grade: inputGrade });
      interaction.reply(
        `${inputNick} 길드원의 직위가 ${inputGrade} 으로 변경되었습니다.`
      );
    } catch (error) {
      interaction.reply(`error editing info: ${error}`);
    }
  },
  data: new SlashCommandBuilder()
    .setName("메이플 직위변경")
    .setDescription("길드원의 직위를 변경합니다.")
    .addStringOption((option) =>
      option
        .setName("닉네임")
        .setDescription("직위를 변경할 캐릭터의 닉네임")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("직위")
        .setDescription("변경할 캐릭터의 직위")
        .setRequired(true)
    ),
  managerOnly: true,
}; */