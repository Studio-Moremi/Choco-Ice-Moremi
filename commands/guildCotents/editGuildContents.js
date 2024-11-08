/* 메이플
const { SlashCommandBuilder } = require("discord.js");
const memberDB = require("../../models/memberSchema");

module.exports = {
  managerOnly: true,
  run: async ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    const month = interaction.options.get("month").value;
    const week = interaction.options.get("week").value;
    const targetTime = `${month}-${week}`;

    const ifexist = await memberDB.exists({
      guildContents: {
        $elemMatch: { time: targetTime },
      },
    });
    if (subcommand === "생성") {
      if (ifexist) {
        interaction.reply(
          "이미 해당 주차 길드컨텐츠 참여 내역 정보가 존재합니다."
        );
        return;
      }
      for await (const doc of memberDB.find()) {
        doc.guildContents.push({
          time: targetTime,
          participated: true,
        });
        doc.save();
      }
      interaction.reply(
        `${month}월 ${week}주차 길드컨텐츠 참여 내역을 생성하고 전체 참여내역을 true로 생성하였습니다.`
      );
    } else if (subcommand === "삭제") {
      if (!ifexist) {
        interaction.reply(
          "해당 주차 길드컨텐츠 참여 내역 정보가 존재하지 않습니다."
        );
        return;
      }
      for await (const doc of memberDB.find()) {
        const targetIndex = doc.guildContents.findIndex(
          (e) => e.time === targetTime
        );
        doc.guildContents.splice(targetIndex, 1);
        doc.save();
      }
      interaction.reply(
        `${month}월 ${week}주차 길드컨텐츠 참여 내역을 삭제했습니다.`
      );
    } else if (subcommand === "미참") {
      if (!ifexist) {
        interaction.reply(
          "해당 주차 길드컨텐츠 참여 내역 정보가 존재하지 않습니다."
        );
        return;
      }
      const targetString = interaction.options.get("닉네임").value;
      const targetArr = targetString.split(" ");
      for (var i = 0; i < targetArr.length; i++) {
        const validMember = await memberDB.exists({ nickName: targetArr[i] });
        if (!validMember) {
          interaction.reply(
            `${targetArr[i]} 길드원의 정보를 찾을 수 없습니다.`
          );
          return;
        }
        const doc = await memberDB.findOne({ nickName: targetArr[i] });
        const targetIndex = doc.guildContents.findIndex(
          (e) => e.time === targetTime
        );
        doc.guildContents.splice(targetIndex, 1, {
          time: targetTime,
          participated: false,
        });
        doc.save();
      }
      interaction.reply(
        `다음 길드원의 ${month}월 ${week}주차 길드컨텐츠 참여내역을 false로 설정했습니다.\n${targetArr}`
      );
    } else if (subcommand === "수정") {
      if (!ifexist) {
        interaction.reply(
          "해당 주차 길드컨텐츠 참여 내역 정보가 존재하지 않습니다."
        );
        return;
      }
      const inputNick = interaction.options.get("닉네임").value;
      const inputBool = interaction.options.get("참여여부").value;
      const ifuserexist = memberDB.exists({ nickName: inputNick });
      if (!ifuserexist) {
        interaction.reply(`${inputNick} 길드원의 정보를 찾을 수 없습니다.`);
        return;
      }
      const doc = await memberDB.findOne({ nickName: inputNick });
      const targetIndex = doc.guildContents.findIndex(
        (e) => e.time === targetTime
      );
      doc.guildContents.splice(targetIndex, 1, {
        time: targetTime,
        participated: inputBool,
      });
      doc.save();
      interaction.reply(
        `${inputNick} 길드원의 ${month}월 ${week}주차 길드컨텐츠 참여내역을 ${inputBool}로 설정했습니다.`
      );
    }
  },
  data: new SlashCommandBuilder()
    .setName("메이플 길드컨텐츠")
    .setDescription("주차별 길드컨텐츠 참여 내역 생성/삭제")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("생성")
        .setDescription("주차별 길드컨텐츠 참여내역을 생성합니다.")
        .addNumberOption((option) =>
          option
            .setName("month")
            .setDescription("정보를 입력할 월 정보 | ex) 8월 -> 8")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("week")
            .setDescription("정보를 입력할 주차 정보 | ex) 2주차 -> 2")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("삭제")
        .setDescription("주차별 길드컨텐츠 참여내역을 삭제합니다.")
        .addNumberOption((option) =>
          option
            .setName("month")
            .setDescription("정보를 삭제할 월 정보 | ex) 8월 -> 8")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("week")
            .setDescription("정보를 삭제할 주차 정보 | ex) 2주차 -> 2")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("미참")
        .setDescription("길드컨텐츠에 미참여한 캐릭터 정보를 일괄입력합니다.")
        .addNumberOption((option) =>
          option
            .setName("month")
            .setDescription("정보를 입력할 월 정보 | ex) 8월 -> 8")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("week")
            .setDescription("정보를 입력할 주차 정보 | ex) 2주차 -> 2")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("닉네임")
            .setDescription(
              "일괄입력할 캐릭터 닉네임을 한 칸의 공백(' ')으로 구분해 모두 입력합니다. | ex) 길드원1 길드원2 길드원3 ..."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("수정")
        .setDescription("길드원의 길드컨텐츠 참여 내역을 수정합니다.")
        .addNumberOption((option) =>
          option
            .setName("month")
            .setDescription("정보를 수정할 월 정보 | ex) 8월 -> 8")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("week")
            .setDescription("정보를 수정할 주차 정보 | ex) 2주차 -> 2")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("닉네임")
            .setDescription("정보를 수정할 캐릭터 닉네임")
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("참여여부")
            .setDescription("참여 여부 | 참여시 true, 미참여시 false 입력")
            .setRequired(true)
        )
    ),
}; */