// puzzle.js - 谜题答案校验器

// 仅后台密码一项(其他谜题的"答案"都是解开新站点,见 nav.js)
// 真值 "GOOD",在博客最后一篇、论坛某楼、聊天客服名"小 GOOD" 三处被分别用
//   凯撒+2 (IQGG) / 反转 (DOOG) / 直书 (GOOD) 的方式遮蔽,玩家集合三处即可解出
const ADMIN_ANSWER = 'GOOD';

export const PUZZLES = {
  'admin-password': {
    prompt: '代号',
    hint: '客服怎么叫你,客服在内部日志里叫什么,论坛失联楼层的邮箱后缀反着写。',
    answer: ADMIN_ANSWER,
    check(input) {
      return String(input || '').trim().toUpperCase() === ADMIN_ANSWER;
    }
  }
};

export function checkPuzzle(id, input) {
  const p = PUZZLES[id];
  if (!p) throw new Error(`unknown puzzle: ${id}`);
  return { ok: p.check(input), hint: p.hint };
}
