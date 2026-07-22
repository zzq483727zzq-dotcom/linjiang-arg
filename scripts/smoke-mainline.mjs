#!/usr/bin/env node
/**
 * smoke-mainline.mjs — HTTP reachability for linjiang mainline pages
 * Usage: node scripts/smoke-mainline.mjs [base]
 * Requires: npm run serve (default http://127.0.0.1:5173)
 */
const base = process.argv[2] || 'http://127.0.0.1:5173';

const PATHS = [
  '/',
  '/phone/',
  '/phone/wechat.html',
  '/phone/chat-lin.html',
  '/phone/chat-gu.html',
  '/phone/moments.html',
  '/phone/mail.html',
  '/phone/xhs.html',
  '/phone/browser.html',
  '/phone/phone.html',
  '/city/',
  '/city/search.html',
  '/city/news-obit.html',
  '/city/news-hongke-a.html',
  '/city/news-hongke-b.html',
  '/city/news-missing.html',
  '/city/intranet/login.html',
  '/bar/',
  '/bar/p-batch.html',
  '/hongke/',
  '/hongke/pipeline.html',
  '/hongke/login.html',
  '/hongke/board.html',
  '/home/',
  '/home/assess.html',
  '/staff/login.html',
  '/staff/dashboard.html',
  '/staff/subject-lin.html',
  '/staff/wall.html',
  '/staff/you.html',
  '/ending/warn.html',
  '/ending/redwall.html',
  '/ending/choice.html',
  '/assets/img/lin-before.png',
  '/assets/img/lin-after.png',
  '/assets/img/zhou-portrait.png',
  '/assets/img/term-bed.png',
  '/assets/img/lin-avatar.png',
  '/assets/js/state.js',
  '/assets/js/puzzle.js',
  '/assets/js/nav.js',
];

let bad = 0;
for (const p of PATHS) {
  const url = base.replace(/\/$/, '') + p;
  try {
    const r = await fetch(url, { redirect: 'manual' });
    const ok = r.status === 200;
    if (!ok) {
      bad++;
      console.log('XX', r.status, p);
    } else {
      console.log('OK', r.status, p);
    }
  } catch (e) {
    bad++;
    console.log('XX ERR', p, e.message);
  }
}
console.log(bad ? `FAIL ${bad}/${PATHS.length}` : `PASS ${PATHS.length}/${PATHS.length}`);
process.exit(bad ? 1 : 0);
