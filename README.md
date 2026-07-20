# 静园 / Serene · ARG 恐怖解谜游戏

一款纯静态、纯前端的细思极恐 ARG。你扮演调查者,从一封转错的邮件进入"静园"心理 App,层层揭开它采集情绪数据、清除"负面人格"的真相,直到第四面墙破裂——发现你自己就是第 48 号样本。

## 运行

```bash
# 需要 Node 20+
node --version

# 测试引擎
npm test

# 本地服务器
npm run serve
# 浏览器打开 http://localhost:5173/
```

## 资产生成(可选)

```bash
# 准备 .env(仓库根,已被 .gitignore 忽略)
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://api.x5m5x.com
# IMAGE_MODEL=gpt-image-2

echo '{"prompt":"...","name":"foo","size":"1024x1024"}' | npm run image
```

模型名 `gpt-image-2` 已通过 `/v1/models` 端点确认可用。

## 推荐游玩路径

1. 打开 `/`
2. 顺着"学员故事"卡片点进「林的博客」
3. 三篇博文都看 → 注意 `IQGG / DOOG / GOOD` 三处伪装(对应 admin 密码谜题)
4. 进论坛 → 看主帖 + 9 楼(看 `doog-news.org` 反写域名)
5. 进聊天 → 看「林 ‖ 妈妈」+「林 ‖ 小 GOOD」
6. 进朋友圈 → 4 张动态
7. 后台输入密码 `GOOD`(从博客/论坛/聊天三处拼出来)→ 进入后台 → 触发档 2
8. 选择:登出 / 接受 / 找隐藏结局

## 文件结构

```
index.html                    # 静园入口
blog/   (4 个文件)            # 林的博客
forum/  (1 个文件)            # 假论坛
chat/   (1 个文件)            # 假微信聊天
social/ (1 个文件)            # 假朋友圈
admin/  (1 个文件)            # 后台(密码 GOOD)
endings/ (3 个文件)           # 三结局
404.html, robots.txt          # ARG 彩蛋层
assets/{css,js,img}/          # 样式 + 引擎 + 9 张图
data/                         # 叙事 JSON
scripts/                      # serve.mjs + gen-image.mjs
tests/                        # Node 内置测试(state + corruption + puzzle + smoke)
```

## 安全提示

`.env` 包含 API key,**切勿提交**(已在 .gitignore 保护)。本项目曾在对话中明文出现该 key,建议定期轮换。

## 部署

本计划不含部署步骤,需手动部署到 GitHub Pages / Netlify 时,把仓库根目录作为静态站点根目录即可。