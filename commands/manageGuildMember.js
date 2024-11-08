/* 메이플
const { SlashCommandBuilder } = require("discord.js");
const memberDB = require("../models/memberSchema");

module.exports = {
  run: async ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    const inputNick = interaction.options.get("닉네임").value;
    const inputJob = interaction.options.get("직업")?.value;
    const inputGrade = interaction.options.get("직위")?.value;

    if (subcommand === "생성") {
      const ifexist = await memberDB.exists({ nickName: inputNick });
      if (ifexist) {
        interaction.reply("이미 존재하는 길드원 정보입니다.");
        return;
      }
      try {
        const newMember = new memberDB({
          nickName: inputNick,
          grade: inputGrade,
          job: inputJob,
        });
        await newMember.save();
        interaction.reply(
          `길드원 정보를 생성했습니다. 닉네임: ${inputNick} | 직업: ${inputJob} | 직위: ${inputGrade}`
        );
      } catch (error) {
        interaction.reply(`error saving info: ${error}`);
      }
    } else if (subcommand === "삭제") {
      const ifexist = await memberDB.exists({ nickName: inputNick });
      if (!ifexist) {
        interaction.reply("존재하지 않는 길드원 정보입니다.");
        return;
      }
      try {
        await memberDB.deleteOne({ nickName: inputNick });
        interaction.reply(`${inputNick} 길드원의 정보를 삭제했습니다.`);
      } catch (error) {
        interaction.reply(`erorr deleting info: ${error}`);
      }
    }
  },
  data: new SlashCommandBuilder()
    .setName("메이플 길드원")
    .setDescription("메이플 길드원 관리 명령어")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("생성")
        .setDescription("길드원 정보를 생성합니다.")
        .addStringOption((option) =>
          option
            .setName("닉네임")
            .setDescription("정보를 생성할 길드원의 닉네임")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("직업")
            .setDescription("정보를 생성할 길드원의 직업")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("직위")
            .setDescription("정보를 생성할 길드원의 직위")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("삭제")
        .setDescription("길드원 정보를 삭제합니다.")
        .addStringOption((option) =>
          option
            .setName("닉네임")
            .setDescription("정보를 삭제할 길드원의 닉네임")
            .setRequired(true)
        )
    ),
    managerOnly: true,
}; */