# AI 微波炉 / ai-microcourse-hub

让内部 AI 经验分享像热饭一样轻松。

`AI 微波炉` 是一个面向公司内部的微课社区：员工可以免登录报名分享 10~45 分钟的小课，管理员可以轻运营式地整理活动、归档视频与资料链接，团队成员则能像逛一个年轻、轻松的小社区一样持续吸收 AI 实战经验。

## 项目亮点

- 轻社区首页：更偏内容社区，不是传统培训系统
- 微课归档：支持历史微课卡片浏览、分页、详情页与相关推荐
- 免登录报名：只填议题、姓名、预计时长即可提交分享意向
- 运营友好：管理员后台分为 `报名信息` 和 `历史活动` 两个 tab，更适合日常维护
- 多资料链接：一场历史微课可配置多个资料链接、录屏链接、延伸阅读
- 两种后台认证：支持 `password` 和 `trusted_header`
- 可直接演示：内置 Prisma + SQLite + seed 数据，拉起就能看效果

## 仓库展示用一句话

适合作为 GitHub 仓库描述：

> A playful internal AI microcourse hub for talk submissions, course archives, and lightweight community operations.

## 页面一览

- `/`：社区首页，展示品牌氛围、近期微课、历史微课列表与报名入口
- `/micro-courses/[slug]`：微课详情页，查看视频回放、资料链接、讲师信息与相关推荐
- `/success`：报名成功与状态反馈页
- `/admin`：管理员轻运营面板，维护报名信息与历史活动

## 快速开始

最省事的方式：

```bash
npm run dev:up
```

这个命令会自动完成以下事情：

- 缺 `.env` / `.env.local` 时自动从示例文件创建
- 缺依赖时自动执行 `npm install`
- 自动执行 `npm run db:push`
- 只有数据库不存在时才自动灌入演示数据

启动后访问：

- 首页：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

默认管理员口令：

- `microwave-admin`

如果你想手动启动：

```bash
npm install
cp .env.example .env
cp .env.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

## 功能能力

- 历史微课卡片列表，每页最多展示 16 条
- 历史微课详情页，支持多个资料链接与录播链接展示
- 免登录报名表单与成功反馈页
- 管理员查看报名、标记完成、隐藏历史报名
- 管理员发布历史活动，维护主题、讲师、日期、起止时间、资料链接
- 后台表格化运营视图，便于按主题、讲师、时间管理内容
- `GET /api/health` 健康检查接口

## 技术栈

- `Next.js 15` + `React 19`
- `Prisma`
- `SQLite`
- `Playwright`
- `TypeScript`

## 常用命令

```bash
npm run dev:up
npm run dev
npm run build
npm run lint
npm run db:push
npm run db:seed
npm run test:e2e
npm run test:e2e:sso
npm run test:e2e:all
```

## 管理员认证模式

### `password`

默认使用口令模式。

```env
ADMIN_AUTH_MODE="password"
ADMIN_PASSWORD="microwave-admin"
```

### `trusted_header`

适合接公司内网网关、SSO 或反向代理，由上游透传已认证用户信息。

```env
ADMIN_AUTH_MODE="trusted_header"
ADMIN_TRUSTED_HEADER="x-internal-user"
ADMIN_TRUSTED_USERS="alice,bob,chenpu"
```

如果 `ADMIN_TRUSTED_USERS` 为空，则任何带该 header 的请求都能进入后台；正式环境不建议这样配置。

## 部署方式

### Node 部署

```bash
npm install
npm run db:push
npm run build
npm run start
```

### Docker 部署

```bash
docker compose up --build
```

部署前建议至少配置：

- `DATABASE_URL`
- `ADMIN_AUTH_MODE`
- `ADMIN_PASSWORD`
- `ADMIN_TRUSTED_HEADER`
- `ADMIN_TRUSTED_USERS`

## 测试

普通口令模式：

```bash
npm run test:e2e
```

trusted header 模式：

```bash
npm run test:e2e:sso
```

全部回归：

```bash
npm run test:e2e:all
```

## GitHub 发布资料

- 首个 release 文案：`docs/release/first-release.md`
- 开源前说明：`docs/release/open-source-note.md`
- 截图清单：`docs/release/screenshots-checklist.md`

## 目录结构

- `src/app`：页面与 API 路由
- `src/components`：前端交互组件
- `src/lib`：数据聚合、Prisma、权限与工具函数
- `prisma/schema.prisma`：数据模型定义
- `prisma/seed.mjs`：演示数据
- `scripts/dev-up.sh`：一键本地启动脚本

## 适用场景

- 企业内部 AI 学习分享社区
- 内部技术午餐会 / 闪电分享 / 微课归档平台
- 轻量运营型知识社区原型

## 后续建议

如果准备正式内网长期使用，建议继续升级：

- `PostgreSQL`
- 正式 SSO 登录
- 管理员权限分层
- 上传文件对象存储
- 运营数据看板与留存统计
