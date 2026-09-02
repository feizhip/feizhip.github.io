# 开发计划 · 马泽杰个人作品集 v0.1

> 与 `docs/PRD.md` 配套的执行计划
> 编制日期：2026-09-01
> 原则：**分阶段交付，每阶段可运行可截图可验收**，绝不一口气铺开

---

## 0. 总览

| 阶段 | 名称 | 周期（估算） | 你看到的产出 |
|---|---|---|---|
| 0 | 项目骨架 | 半天 | `npm run dev` 起得来，看到白底 + "Hello" |
| 1 | 数据层 + 主题 | 半天 | 改 JSON 就能换文案，主题色板统一 |
| 2 | Nav + Hero | 半天 | 首页能看了 |
| 3 | Work + Honors | 半天 | 中间内容齐了 |
| 4 | About + 螺旋照片展 | 1 天 | 视觉亮点完成 |
| 5 | Contact + Footer + 动效 | 半天 | 收尾 |
| 6 | 验收 + 截图 | 半天 | 文档 + 5 张关键页面截图 |

合计 **约 3~4 天** 工作量（按每天 4 小时开发算）。

每个阶段结束我都会：
1. 跑 `npm run build` 确保构建过
2. 用 `agent-browser` 截图给你看
3. 在 `docs/screenshots/` 存档
4. 写一段简短的"本阶段完成 / 下阶段预告"给你

---

## 阶段 0 · 项目骨架

**目标**：把 Vite + React + TS 跑起来，结构按 PRD §7 数据分层。

### 步骤
1. 在 `C:\Users\Fanjiu\Downloads\个人 网站项目\` 下初始化：
   - `npm create vite@latest . -- --template react-ts`（用 `.` 当前目录）
   - 选 `y` 覆盖（目录是空的，只有 `_ref/` 和 `docs/`）
2. 安装依赖：
   - 基础：`react` / `react-dom` / `typescript` / `vite` / `@vitejs/plugin-react`
   - 样式：`tailwindcss@3` / `postcss` / `autoprefixer`
   - 动画：`framer-motion`
   - 工具：`clsx`（class 合并）/ `lucide-react`（图标）
3. 初始化 Tailwind（`tailwind.config.js` + `postcss.config.js` + `src/styles/index.css` 引入 `@tailwind` 指令）
4. 建目录结构：
   ```
   src/
     components/   # UI 组件
     data/         # JSON 数据源
     lib/          # 工具：data.ts / cn.ts
     styles/       # tokens.css / globals.css / animations.css
     assets/       # SVG/图片资源
   public/
     images/       # 静态图片
   scripts/        # 备份、校验
   docs/           # PRD + 截图
   _ref/           # 参考素材（已存在）
   _backup/        # 备份（gitignored）
   ```
5. 把 `App.tsx` 临时改成 "Hello MZ Portfolio"，确认 `npm run dev` 起得来。

### 验收
- [ ] `npm install` 退出码 0
- [ ] `npm run dev` 浏览器看到 "Hello MZ Portfolio" 暗底白字
- [ ] `npm run build` 退出码 0
- [ ] `.gitignore` 写好（`_ref/` `_backup/` `node_modules/` `dist/`）

---

## 阶段 1 · 数据层 + 设计 token

**目标**：所有内容都是数据，组件不写死文案；暗色主题色板定下来。

### 1.1 设计 token（`src/styles/tokens.css`）
```css
:root {
  --bg-0: #0a0a0c;       /* 主背景 */
  --bg-1: #111114;       /* 卡片底 */
  --bg-2: #1a1a1f;       /* 浮起层 */
  --fg-0: #f5f5f7;       /* 主文字 */
  --fg-1: #c7c7cc;       /* 副文字 */
  --fg-2: #6e6e76;       /* 弱化 */
  --border: rgba(255,255,255,0.08);
  --accent: #c8a96a;     /* 金（参考站同款暖金） */
  --accent-soft: rgba(200,169,106,0.16);
  --ring: rgba(200,169,106,0.4);
}
```

### 1.2 数据 JSON（首版 6 个文件）
- `src/data/profile.json`
- `src/data/nav.json`
- `src/data/projects.json`（先 2 条）
- `src/data/honors.json`（5 条）
- `src/data/publications.json`（2 条）
- `src/data/about.json`
- `src/data/photos.json`（6 个槽位，src 为空）
- `src/data/contact.json`

### 1.3 数据加载层（`src/lib/data.ts`）
```ts
import profile from '@/data/profile.json';
import nav from '@/data/nav.json';
// ... 一一 import，类型用 import.meta.glob
export const data = { profile, nav, /*...*/ };
```
为每个 JSON 写一份 `*.d.ts` 类型（手动或 `json2ts`）。

### 1.4 Schema 校验脚本（`scripts/validate-data.mjs`）
- 启动 dev / build 时跑一遍
- 校验必填字段、URL 格式、邮箱格式、年份范围
- 失败 → 控制台红字 + 退出码 1

### 验收
- [ ] 改 `profile.json` 的 `name` 字段，页面上 Hero 文字跟着变（写个临时 debug 组件验证）
- [ ] 故意把 `email` 改成 "not-an-email"，跑 `npm run build` 看到清晰报错
- [ ] 截图存档：`docs/screenshots/01-tokens.png`

---

## 阶段 2 · Nav + Hero

**目标**：首页最上面那一屏做出来，能定下整站的视觉调性。

### 2.1 Nav 组件（`src/components/Nav/`）
- 固定顶部，滚动时背景从透明 → `rgba(10,10,12,0.7)` + `backdrop-blur`
- Logo：圆形 32px，`MZ` 字样
- 5 个锚点 + 滚动高亮（`IntersectionObserver`）
- 移动端：抽屉式
- 右侧 `Available for` 圆点徽章，点击跳 `#contact`

### 2.2 Hero 组件（`src/components/Hero/`）
- 大字号中文名（clamp 响应式，桌面 96px / 移动 56px）
- 英文 tagline（`text-2xl`，`tracking-widest`）
- 简介 + 两个 CTA
- **玻璃方碑**（纯 CSS）：
  - 主体：`<div>` + `backdrop-filter: blur`
  - 光柱：SVG 渐变 + `mix-blend-screen`
  - 装饰粒子：12 个 `<span>`，CSS `@keyframes` 缓慢上升
- 状态徽章 `AVAILABLE FOR · Design Strategy / AI / Full-stack`

### 2.3 字体方案
- 中文标题：思源宋体（用 `fontsource-noto-serif-sc`）
- 英文 / 数字：`fontsource-inter`
- 全部走 `woff2`，`<link rel="preload">`

### 验收
- [ ] 桌面 1440px / 平板 768px / 移动 375px 三种宽度截图都好看
- [ ] 滚动时 Nav 背景出现变化
- [ ] 点击 `Explore Work` 平滑滚到下一区（虽然 Work 还没做，但滚动行为要 OK）
- [ ] 截图：`docs/screenshots/02-hero.png`

---

## 阶段 3 · Work + Honors

**目标**：中间内容填齐。

### 3.1 Work 组件（`src/components/Work/`）
- 标题 `WORK` + 中文 `作品 / 项目` 双行
- 2 张卡片，水平排列（移动端竖排）
- 卡片内容：cover（占位 SVG） / 标题 / 时间段 / 简介 / 技术栈 chips
- 卡片 hover：边框颜色 `--accent` + 抬升 `translateY(-4px)`
- 点击卡片 → 下方插入内联详情块（动画展开）
- 详情字段：项目背景 / 个人角色 / 技术栈 / 难点 / 成果 / 链接（如有）

### 3.2 Honors 组件（`src/components/Honors/`）
- 标题 `HONORS`
- 时间线布局（左侧年份，右侧条目）
- 子分组：奖项 / 论文
- 论文每条：标题 + 期刊 + DOI（外链）

### 验收
- [ ] 2 张项目卡片能正常展开/收起
- [ ] 5 条奖项 + 2 条论文全部可读
- [ ] 截图：`docs/screenshots/03-work.png` / `04-honors.png`

---

## 阶段 4 · About + 螺旋照片展（**视觉重头**）

**目标**：参考站同款螺旋照片展做出来。

### 4.1 About 文字区
- 左侧大标题 `关于我`
- 自我介绍段落
- 性格 chips（5 个） + 兴趣 + 技能 chips
- chips 风格：圆角胶囊 + 1px 边框

### 4.2 螺旋照片展（`src/components/SpiralGallery/`）
- 6 个槽位沿 Z 轴螺旋分布（`transform: rotateY(theta) translateZ(radius)`）
- 自动慢速旋转（仅桌面端，可关）
- 鼠标拖拽：监听 `mousedown` / `mousemove` / `mouseup`，计算 `deltaX` 累加到旋转角
- 触屏：监听 `touchstart` / `touchmove` / `touchend`
- 悬停：放大 + 底部半透明 caption
- 键盘：左右箭头切换当前激活卡片
- 退化：移动端（< 768px）改为横向滚动列表
- 占位 SVG 生成脚本：`scripts/gen-placeholders.mjs`
  - 6 张 `photo-01.svg` ~ `photo-06.svg`，暗色 + 大字编号
  - 写入 `public/images/photos/`

### 4.3 性能
- 拖拽时用 `requestAnimationFrame`
- GPU 合成层（`will-change: transform`）
- `prefers-reduced-motion: reduce` → 关闭自动旋转，只允许手动

### 验收
- [ ] 鼠标拖拽整条轨道能旋转
- [ ] 悬停任意卡片显示 caption
- [ ] 移动端降级为横滑
- [ ] 6 个占位 SVG 正常显示
- [ ] 截图：`docs/screenshots/05-about.png`（含交互前后 2 张）

---

## 阶段 5 · Contact + Footer + 全局动效

### 5.1 Contact 组件
- 三列：EMAIL / LOCATION / SOCIAL
- 邮箱可点击复制（`navigator.clipboard.writeText` + toast）
- SOCIAL：4 个灰显圆角徽标，hover 时若 `url` 为空 → tooltip "待补"
- 右侧大 `Contact` 按钮（点击同 = 复制邮箱 + 滚到自身）
- 底部一句中文：`期待与你的对话与合作。`

### 5.2 Footer
- 一行版权 + 构建时自动写入"最后更新时间"
- 时间来源：`new Date().toISOString().slice(0,10)`（Vite 构建时）

### 5.3 全局动效收尾
- 所有 section 进入视口淡入（`framer-motion` + `whileInView`）
- 按钮 hover 微动（缩放 1.02 + 边框高亮）
- 移动端 Nav 抽屉动画

### 验收
- [ ] 点邮箱后 toast 出现，剪贴板确实有内容
- [ ] Footer 时间是构建当天
- [ ] 滚到每个 section 都有淡入
- [ ] 截图：`docs/screenshots/06-contact.png` / `07-footer.png`

---

## 阶段 6 · 验收 + 文档 + 截图

### 6.1 截图清单
- `docs/screenshots/` 下：
  - `01-tokens.png`（色板）
  - `02-hero-desktop.png` / `02-hero-mobile.png`
  - `03-work.png`
  - `04-honors.png`
  - `05-about-gallery.png`（交互前） / `05-about-gallery-active.png`（悬停后）
  - `06-contact.png`
  - `07-footer.png`
  - `08-fullpage.png`（整页拼接，agent-browser 整页截图）

### 6.2 文档收尾
- `README.md`：
  - 一句话介绍
  - 3 步跑起来（`npm install` / `npm run dev` / `npm run build`）
  - 改数据去哪里（`src/data/*.json`）
  - 备份在哪（`_backup/`）
- `docs/data-schema.md`：
  - 每个 JSON 的字段表 + 是否必填 + 示例

### 6.3 验收清单
- 把 PRD §10 的复选清单逐条打勾，没过的要写明原因 + 后续处理

### 6.4 交付给你
- 一个 `dist/` 目录（构建产物）
- 启动命令（双击 `start-dev.bat`）—— 我来写好
- `docs/screenshots/` 截图 + 视频（如果需要）

---

## 关键决策记录

| 决策 | 选择 | 理由 |
|---|---|---|
| 框架 | Vite + React + TS | 启动快、暗色生态好、TS 类型护住 JSON schema |
| 样式 | Tailwind + tokens.css | 暗色 token 集中、utility 写响应式快 |
| 动画 | framer-motion | 视口淡入 + 螺旋照片展拖拽都顺手 |
| 数据 | JSON + 校验脚本 | 源码即数据库，HR 看完代码也能改 |
| 部署 | 不部署 | 你已确认 |
| 3D | 不用 Three.js | CSS 够用，省 200KB+ 首屏时间 |
| i18n | 字段中英两份 | 不用框架，第一版只 1 种 UI 语言 |

---

## 风险与回退

| 风险 | 触发条件 | 回退 |
|---|---|---|
| 螺旋照片展在低性能设备卡 | FPS < 30 | 切到横滑列表模式（已设计） |
| Tailwind v4 与 v3 API 变化 | 安装时拿到 v4 | 锁版本到 `tailwindcss@^3.4` |
| 字体加载慢 | 首屏 1.5s+ 白屏 | 退到系统字体栈 `font-serif`（中文）/ `font-sans`（英文） |
| 阶段 4 照片展做不完 | 时间不够 | 拆成 4a（文字版 About）/ 4b（照片展），先把 4a 交付 |

---

## 启动方式（你只需要记住两个命令）

```bash
# 第一次：装依赖
npm install

# 开发：浏览器自动打开
npm run dev

# 打包：产物在 dist/
npm run build
```

我会额外给你一个 **`start-dev.bat`**：双击它就等于"装依赖 + 启动 dev"，不用记命令。
（这个 .bat 我会在阶段 0 末尾写好。）

---

> 计划开始执行前我会再说一次"本阶段目标"和"本阶段我打算这样做"，等你说「继续」再做。**不擅自一口气走完所有阶段。**
