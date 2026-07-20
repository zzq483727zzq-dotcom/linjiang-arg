// puzzle.js - 谜题答案校验器

// 仅后台密码一项(其他谜题的"答案"都是解开新站点,见 nav.js)
// 真值 "GOOD",在博客最后一篇、论坛某楼、聊天客服名"小 GOOD" 三处被分别用
//   凯撒+2 (IQGG) / 反转 (DOOG) / 直书 (GOOD) 的方式遮蔽,玩家集合三处即可解出
const ADMIN_ANSWER = 'GOOD';

export const PUZZLES = {
  'admin-password': {
    prompt: '你能从这些痕迹中推测出我们的内部代号吗？',
    hint: '三个地方提到了它,只是用了不同的伪装。拼起来,心里说一遍。',
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
