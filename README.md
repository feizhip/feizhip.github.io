# 马泽杰 · 个人作品集

> 第一版 · 暗色单页滚动作品集
> 目标用户：HR / 面试官
> 详细规划：[`docs/PRD.md`](docs/PRD.md) · [`docs/dev-plan.md`](docs/dev-plan.md)

---

## 三步跑起来

```bash
# 1. 装依赖（首次）
npm install

# 2. 启动开发服务器
npm run dev
# 浏览器自动打开 http://localhost:5173

# 3. 打包生产产物
npm run build
# 输出在 dist/ 目录
```

> 不想记命令？**双击项目根目录的 `start-dev.bat`**（自动装依赖 + 启动 + 打开浏览器）。
> 想关掉预览时，关闭黑窗口就行。

---

## 我想改文字/项目内容，去哪里？

**全部内容都在 `src/data/*.json`**（计划在阶段 1 接入，目前是占位）。

| 文件 | 改什么 |
|---|---|
| `src/data/profile.json` | 名字、tagline、自我介绍、CTA 文案 |
| `src/data/projects.json` | 项目/作品列表 |
| `src/data/honors.json` | 奖项 |
| `src/data/publications.json` | 论文 |
| `src/data/about.json` | 关于我文字 + 性格 chips + 技能 |
| `src/data/photos.json` | 螺旋照片展的 6 个槽位 |
| `src/data/contact.json` | 邮箱 / 城市 / 微信 / 手机 / 社交链接 |

改完保存，浏览器会自动刷新（dev server 的 HMR）。

---

## 目录结构

```
个人 网站项目/
├── docs/                    PRD + 开发计划 + 截图存档
├── public/
│   ├── favicon.svg          站点图标
│   └── fonts/               思源宋体 + Inter（npm install 时自动从 fontsource 拷贝）
├── src/
│   ├── components/          UI 组件（阶段 2 起开始填）
│   ├── data/                所有内容数据（JSON）
│   ├── lib/                 工具函数
│   ├── styles/              全局样式 + 设计 token + 字体声明
│   ├── App.tsx              阶段 0 占位页
│   └── main.tsx             入口
├── scripts/                 自动化脚本
│   ├── setup-fonts.mjs      把字体从 node_modules 拷到 public/fonts/
│   └── verify-page.mjs      用本机 Edge 无头跑页面 + 截图 + 抓 console 报错
├── _ref/                    参考素材（视频帧等，不进构建）
├── start-dev.bat            一键启动
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm install` | 装依赖（首次） |
| `npm run dev` | 开发模式（热更新） |
| `npm run build` | 打包生产产物到 `dist/` |
| `npm run preview` | 预览生产产物 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run setup:fonts` | 重跑字体拷贝（加新字重时用） |

---

## 验收脚本

需要对本机截图 / 检查 console 报错时：

```bash
node scripts/verify-page.mjs http://127.0.0.1:5173/ docs/screenshots/my.png 1440 900 3000
```

- 自动用本机 Edge 打开
- 等 3 秒（让字体加载完）后截全屏 PNG
- 把任何 `console.error` / 未捕获异常 / 浏览器日志错误都打印到终端
- 退出码：有报错 = 1，无报错 = 0

---

## 技术选型

Vite + React 18 + TypeScript + Tailwind v3 + framer-motion。**纯静态站**，不接数据库，所有内容 = JSON，源码即数据库。

---

## 当前阶段

**阶段 0 完成**。看阶段进度：见 [`docs/dev-plan.md`](docs/dev-plan.md)。
