#!/usr/bin/env node
// gen-image.mjs — OpenAI 兼容图像生成
// 用法: echo '{"prompt":"...","name":"logo","size":"1024x1024"}' | node scripts/gen-image.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// 手动解析 .env(避免依赖)
function loadEnv() {
  try {
    const txt = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) process.env[m[1]] ||= m[2];
    }
  } catch (e) {
    console.error('警告: 无法读取 .env:', e.message);
  }
}
loadEnv();

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => raw += c);
process.stdin.on('end', async () => {
  if (!raw.trim()) { console.error('无 stdin 输入'); process.exit(1); }
  let payload;
  try { payload = JSON.parse(raw.trim()); } catch (e) { console.error('JSON 解析失败:', e.message); process.exit(1); }
  const { prompt, name, size = '1024x1024', n = 1 } = payload;
  if (!prompt || !name) { console.error('需要 prompt 和 name'); process.exit(1); }
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
  const url = `${baseUrl}/v1/images/generations`;
  const body = { model: process.env.IMAGE_MODEL || 'gpt-image-2', prompt, size, n };
  console.error('POST', url, '(model=' + body.model + ')');
  let r;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: { 'authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      break;
    } catch (e) {
      lastErr = e.message;
      console.error(`尝试 ${attempt} 失败: ${e.message}${attempt < 3 ? `, 等待 ${attempt * 2}s 重试` : ''}`);
      await new Promise(r => setTimeout(r, attempt * 2000));
    }
  }
  if (!r) { console.error('网络错误(重试 3 次后):', lastErr); process.exit(2); }
  const text = await r.text();
  if (!r.ok) { console.error('API 错误', r.status, text.slice(0, 500)); process.exit(1); }
  let j;
  try { j = JSON.parse(text); } catch (e) { console.error('返回非 JSON:', text.slice(0, 500)); process.exit(1); }
  const data = j.data || [];
  if (data.length === 0) { console.error('响应里没有 data 数组'); process.exit(1); }
  const dir = resolve(process.cwd(), 'assets/img');
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.b64_json) {
      const buf = Buffer.from(item.b64_json, 'base64');
      const out = join(dir, `${name}${data.length > 1 ? '-' + (i + 1) : ''}.png`);
      writeFileSync(out, buf);
      console.log('wrote', out, buf.length, 'bytes');
    } else if (item.url) {
      console.log('remote url:', item.url, '(请手动下载)');
    } else {
      console.error('第', i, '条无 b64_json / url:', Object.keys(item));
    }
  }
});
