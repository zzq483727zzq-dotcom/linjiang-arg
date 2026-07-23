const normalizeUser = (s) => String(s || '').replace(/\s+/g, '').toLowerCase();
const normalizeCode = (s) => String(s || '').replace(/\s+/g, '').toUpperCase();

export const PUZZLES = {
  'oa-login': {
    fields: ['username', 'password'],
    answer: { username: 'zhouqm', password: '19680315' },
    hint: '用户名为周启明姓名拼音；口令为讣告出生日期 YYYYMMDD。',
    check(input) {
      return normalizeUser(input?.username) === 'zhouqm' &&
        String(input?.password ?? '') === '19680315';
    },
    failHint(n) {
      if (n < 3) return '用户名是拼音小写；口令是 8 位数字日期。';
      if (n < 6) return '方向：追记里的登录名 + 讣告上的出生年月日。';
      return '直接填：zhouqm / 19680315';
    },
  },
  'staff-login': {
    fields: ['username', 'password'],
    answer: { username: 'HY-0317', password: '260317' },
    hint: '工号与临时授权见市政府 OA 对接单。',
    check(input) {
      return normalizeCode(input?.username) === 'HY-0317' &&
        String(input?.password ?? '') === '260317';
    },
    failHint(n) {
      if (n < 3) return '工号形如 HY-####；口令 6 位数字。';
      if (n < 6) return '方向：OA 对接单上的家园侧工号与文号六位。';
      return '直接填：HY-0317 / 260317';
    },
  },
  'hongke-board': {
    fields: ['username', 'password'],
    answer: { username: 'pilot', password: 'hk2026' },
    hint: '试点测试账号写在临江吧爆料帖里。',
    check(input) {
      return normalizeUser(input?.username) === 'pilot' &&
        String(input?.password ?? '') === 'hk2026';
    },
    failHint(n) {
      if (n < 3) return '用户名是英文；口令小写字母+数字。';
      if (n < 6) return '方向：临江吧主帖里的测试账号。';
      return '直接填：pilot / hk2026';
    },
  },
};

export function checkPuzzle(id, input, attemptCount = 1) {
  const p = PUZZLES[id];
  if (!p) throw new Error('unknown puzzle: ' + id);
  const ok = p.check(input);
  return {
    ok,
    hint: ok ? '' : p.failHint(attemptCount),
  };
}
