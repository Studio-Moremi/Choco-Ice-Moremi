const { PermissionsBitField } = require("discord.js");

module.exports = (interaction, commandObj, handler, client) => {
  if (commandObj.managerOnly) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      interaction.reply({
        content: "관리자 역할을 가진 사람만 이용이 가능해요.",
        ephemeral: true,
      });
      return true;
    }
  }
};