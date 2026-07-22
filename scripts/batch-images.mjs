#!/usr/bin/env node
// batch-images.mjs — 临江 ARG 关键立绘/档案图
// 用法: node scripts/batch-images.mjs [name...]
// 依赖 .env: OPENAI_API_KEY / OPENAI_BASE_URL / IMAGE_MODEL

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';

function loadEnv() {
  try {
    const txt = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) process.env[m[1]] ||= m[2];
    }
  } catch {}
}
loadEnv();

const SUFFIX =
  '写实摄影，真实手机相册或档案素材质感，自然光线，克制构图，无水印，无可读文字，不要电影海报感，不要夸张表情，不要恐怖妆造。';

const JOBS = [
  {
    name: 'lin-before',
    size: '1024x1024',
    prompt: `27岁东亚男性，普通路人感，自然短黑发，偏瘦，穿灰色连帽衫，左眼下方有一颗很小的痣，普通室内窗边自拍，轻微疲惫，表情自然，不像演员，早期智能手机照片质感。${SUFFIX}`,
  },
  {
    name: 'lin-after',
    size: '1024x1024',
    prompt: `与上一张同一位27岁东亚男性的脸型与发型，自然短黑发，偏瘦，穿浅色干净衬衫，左眼下方完全没有痣，脸部更加对称干净，微笑平稳端正，眼神注视镜头略久，普通真实自拍，不做怪物效果。${SUFFIX}`,
  },
  {
    name: 'zhou-portrait',
    size: '1024x1024',
    prompt: `中国地级市中年男性公务员标准遗像风格证件照，约55-60岁，短发花白，深色西装，白衬衫，表情严肃平静，浅灰背景，正式会议裁切感，不恐怖，不戏剧化。${SUFFIX}`,
  },
  {
    name: 'term-bed',
    size: '1536x1024',
    prompt: `现代私立康复机构单人病房，空床，白色床单整齐覆盖，冷白灯光，克制医疗摄影，无人物无血迹无开膛，略有不安的安静，档案记录质感。${SUFFIX}`,
  },
  {
    name: 'lin-avatar',
    size: '1024x1024',
    prompt: `27岁东亚男性微信头像裁切，普通短发，灰色卫衣，轻微微笑，左眼下有极小痣，手机前置摄像头，日常感。${SUFFIX}`,
  },
];

function runOne(job) {
  return new Promise((res, rej) => {
    const child = spawn('node', [resolve(process.cwd(), 'scripts/gen-image.mjs')], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: process.env,
    });
    let out = '';
    child.stdout.on('data', (d) => {
      out += d;
      process.stdout.write(d);
    });
    child.on('close', (code) => {
      if (code === 0) res(out);
      else rej(new Error(`${job.name} exit ${code}`));
    });
    child.stdin.write(JSON.stringify(job));
    child.stdin.end();
  });
}

const want = process.argv.slice(2);
const list = want.length ? JOBS.filter((j) => want.includes(j.name)) : JOBS;
if (!list.length) {
  console.error('no jobs matched', want);
  process.exit(1);
}
mkdirSync(resolve(process.cwd(), 'assets/img'), { recursive: true });

for (const job of list) {
  const dest = join(resolve(process.cwd(), 'assets/img'), `${job.name}.png`);
  if (existsSync(dest) && process.env.FORCE !== '1') {
    console.error('skip existing', dest, '(FORCE=1 to overwrite)');
    continue;
  }
  console.error('=== generating', job.name, '===');
  await runOne(job);
}
console.error('done');
