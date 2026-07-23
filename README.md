> **主线：** 临江 · 幸福家园 ARG。官方入口与路径图见 `docs/MAINLINE.md`。  
> 设计：`docs/superpowers/specs/2026-07-22-linjiang-home-arg-design.md`  
> 计划：`docs/superpowers/plans/2026-07-22-linjiang-home-arg-plan.md`  
> 旧「静园」folk 路径已切断入口，勿作准。

# 临江 · 幸福家园 ARG

纯静态、纯前端的细思极恐 ARG。从关于林屿失联的私人备忘进入手机与临江公开信息，穿过政府站 / 弘科 / 幸福家园员工端，直到红字墙。

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

## 主线入口

1. 打开 `/`（说明页）
2. 开始调查 → `/phone/`
3. 经 `/city/` `/bar/` `/hongke/` `/home/` → `/staff/` → `/ending/`

详见 `docs/MAINLINE.md`。旧目录 `admin blog chat contact social forum endings` 仅作归档跳转，不链入主线。

## 文件结构

```
index.html                    # intro 说明页
phone/ city/ home/ hongke/ bar/ staff/ ending/
assets/{css,js,img}/          # 样式 + 状态/谜题引擎 + 图
scripts/                      # serve.mjs 等
tests/                        # Node 内置测试
docs/MAINLINE.md              # 官方路径图
```

## 安全提示

`.env` 包含 API key，**切勿提交**（已在 .gitignore 保护）。

## 部署

把仓库根目录作为静态站点根目录即可（GitHub Pages / Netlify 等）。