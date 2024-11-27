/* License is GPL 3.0.
- made by studio moremi
 - op@kkutu.store
*/
// 레벨 관련 설정 파일
const db = require('./db'); // 데이터베이스 연결 파일

const LEVEL_BASE = 100;
const LEVEL_MULTIPLIER = 1.5; // 다음 레벨에 필요한 경험치는 기존 필요한 경험치에 1.5x 하기

/**
 * @param {number} xp
 * @returns {number}
 */
function calculateLevel(xp) {
  let level = 1;
  let xpForNextLevel = LEVEL_BASE;

  while (xp >= xpForNextLevel) {
    xp -= xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(xpForNextLevel * LEVEL_MULTIPLIER);
  }

  return level;
}

/**
 * @param {number} xp
 * @returns {number}
 */
function xpToNextLevel(xp) {
  let level = 1;
  let xpForNextLevel = LEVEL_BASE;

  while (xp >= xpForNextLevel) {
    xp -= xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(xpForNextLevel * LEVEL_MULTIPLIER);
  }

  return xpForNextLevel - xp;
}

/**
 * @param {string} userId
 * @param {number} xp
 * @returns {Promise<{levelUp: boolean, newLevel: number}>}
 */

async function addXp(userId, xp) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT xp FROM users WHERE id = ?`, [userId], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error('User not found'));

      const currentXp = row.xp || 0;
      const newXp = currentXp + xp;

      const oldLevel = calculateLevel(currentXp);
      const newLevel = calculateLevel(newXp);

      db.run(`UPDATE users SET xp = ? WHERE id = ?`, [newXp, userId], (updateErr) => {
        if (updateErr) return reject(updateErr);

        resolve({
          levelUp: newLevel > oldLevel,
          newLevel,
        });
      });
    });
  });
}

module.exports = {
  calculateLevel,
  xpToNextLevel,
  addXp,
};
