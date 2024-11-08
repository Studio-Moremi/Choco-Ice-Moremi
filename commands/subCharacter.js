/* 메이플
const { SlashCommandBuilder } = require("discord.js");
const memberDB = require("../models/memberSchema");

module.exports = {
  managerOnly: true,
  run: async ({ interaction }) => {
    const inputNick = interaction.options.get("본캐닉네임").value;
    const subCharNick = interaction.options.get("부캐닉네임").value;
    const subCharJob = interaction.options.get("직업").value;

    const ifexist = await memberDB.exists({ nickName: inputNick });
    if (!ifexist) {
      interaction.reply("해당 길드원 정보를 찾을 수 없습니다.");
      return;
    }
    const doc = await memberDB.findOne({ nickName: inputNick });
    const ifsubexist = doc.subChar.includes(subCharNick);
    if (ifsubexist) {
      const targetIndex = doc.subChar.findIndex((e) => e === subCharNick);
      doc.subChar.splice(targetIndex, 1);
      doc.save();
      memberDB.deleteOne({ nickName: subCharNick });
      interaction.reply(
        `${inputNick} 길드원의 부캐 ${subCharNick}의 정보를 삭제했습니다.`
      );
    } else {
      doc.subChar.push(subCharNick);
      doc.save();
      const newSubChar = new memberDB({
        nickName: subCharNick,
        grade: "부캐",
        job: subCharJob,
        subChar: [`${inputNick}`],
      });
      newSubChar.save();
      interaction.reply(
        `${inputNick} 길드원의 부캐 ${subCharNick}의 정보를 생성했습니다. 직업: ${subCharJob}`
      );
    }
  },
  data: new SlashCommandBuilder()
    .setName("부캐")
    .setDescription("길드원의 부캐 정보를 생성/삭제합니다.")
    .addStringOption((option) =>
      option
        .setName("본캐닉네임")
        .setDescription("길드원의 본캐 닉네임")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("부캐닉네임")
        .setDescription("길드원의 부캐 닉네임")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("직업")
        .setDescription(
          "추가할 부캐의 직업 (삭제시에는 아무거나 입력해도 괜찮습니다)"
        )
        .setRequired(true)
    ),
}; */