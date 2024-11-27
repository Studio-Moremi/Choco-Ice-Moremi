/* License is GPL 3.0.
- made by studio moremi
- op@kkutu.store
*/
/**
 * 쿸으다스 수정 (9 ~ 94)
 * /출석 추가
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');
const LANG = require('../language.json');

const data = new SlashCommandBuilder()
  .setName(LANG.attendance)
  .setDescription(LANG.attendance1);

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month, year) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

module.exports = {
  data,
  run: async ({ interaction }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const attendanceReward = isWeekend ? 2 : 1;

    const discordId = interaction.user.id;

    db.get(`SELECT * FROM attendance WHERE discord_id = ? AND year = ? AND month = ?`, [discordId, year, month], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return interaction.reply(LANG.error100);
      }

      let attendanceData;
      if (row) {
        attendanceData = JSON.parse(row.days);
        if (attendanceData.includes(day)) {
          return interaction.reply(LANG.alreadyChecked);
        }
      } else {
        attendanceData = [];
      }

      attendanceData.push(day);
      db.run(`REPLACE INTO attendance (discord_id, year, month, days) VALUES (?, ?, ?, ?)`, [discordId, year, month, JSON.stringify(attendanceData)], (err) => {
        if (err) {
          console.error('Database error:', err.message);
          return interaction.reply(LANG.error100);
        }

        db.run(`UPDATE users SET coins = coins + ? WHERE discord_id = ?`, [attendanceReward, discordId], (err) => {
          if (err) {
            console.error('Database error:', err.message);
            return interaction.reply(LANG.error100);
          }

          const daysInMonth = getDaysInMonth(month, year);
          let bonusAwarded = false;
          for (let weekStart = 1; weekStart <= daysInMonth; weekStart += 7) {
            const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(day => day <= daysInMonth);
            if (weekDays.every(day => attendanceData.includes(day))) {
              db.run(`UPDATE users SET coins = coins + 7 WHERE discord_id = ?`, [discordId], (err) => {
                if (err) {
                  console.error('Database error:', err.message);
                }
              });
              bonusAwarded = true;
              break;
            }
          }

          const embed = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle(`${year}년 ${month}월 출석 체크`)
            .setDescription(`🗓️ 오늘 출석 완료! 보상: 💎 ${attendanceReward}개${bonusAwarded ? '\n🎉 한 줄 출석 보너스! 추가 보상: 💎 7개' : ''}`)
            .setFooter({ text: LANG.footerWeekendDouble });

          return interaction.reply({ embeds: [embed] });
        });
      });
    });
  },
};
