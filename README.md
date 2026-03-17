# AI 微波炉 / ai-microcourse-hub

一个轻松、自然、活力的内部 AI 微课分享社区原型。

## 当前能力

- 首页社区浏览
- 历史微课分页列表，每页最多 16 条
- 微课详情页
- 免登录报名
- 报名成功页
- 管理员轻运营后台
- 历史微课发布
- 历史微课编辑
- 微课标签和相关推荐配置
- 可切换管理员认证模式：口令 / trusted header

## 本地启动

最省事的方式：

```bash
npm run dev:up
```

这个命令会自动做 4 件事：

- 缺 `.env` / `.env.local` 时自动从示例文件创建
- 缺依赖时自动执行 `npm install`
- 自动执行 `db:push`
- 只有第一次本地启动、数据库还不存在时，才自动灌入演示数据

之后会直接启动开发环境，不会重复清空你已有的数据。

1. 安装依赖

```bash
npm install
```

2. 准备环境变量

```bash
cp .env.example .env
cp .env.example .env.local
```

3. 初始化数据库并灌入演示数据

```bash
npm run db:push
npm run db:seed
```

4. 启动开发环境

```bash
npm run dev
```

默认访问：

- 首页：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

默认管理员口令：

- `microwave-admin`

默认管理员认证模式：

- `password`

## 核心目录

- `src/app`：页面和 API
- `src/components`：交互组件
- `src/lib`：Prisma、聚合查询、工具函数
- `prisma/schema.prisma`：数据模型
- `prisma/seed.mjs`：演示数据

## 部署准备

### 方式一：直接 Node 部署

```bash
npm install
npm run db:push
npm run build
npm run start
```

需要配置：

- `DATABASE_URL`
- `ADMIN_AUTH_MODE`
- `ADMIN_PASSWORD`
- `ADMIN_TRUSTED_HEADER`
- `ADMIN_TRUSTED_USERS`

### 方式二：Docker 部署

```bash
docker compose up --build
```

启动后可用健康检查：

- `GET /api/health`

## 管理员认证模式

### 模式一：口令模式

默认就是这个模式。

```env
ADMIN_AUTH_MODE="password"
ADMIN_PASSWORD="microwave-admin"
```

### 模式二：trusted header

适合放在公司 SSO / 网关 / 反向代理后面，由上游把已认证用户透传成请求头。

```env
ADMIN_AUTH_MODE="trusted_header"
ADMIN_TRUSTED_HEADER="x-internal-user"
ADMIN_TRUSTED_USERS="alice,bob,chenpu"
```

如果 `ADMIN_TRUSTED_USERS` 留空，则任何带上该 header 的请求都可进入后台；正式环境不建议这样配。

## 端到端测试

普通口令模式：

```bash
npm run test:e2e
```

trusted header 模式：

```bash
npm run test:e2e:sso
```

全部跑一遍：

```bash
npm run test:e2e:all
```

## 当前部署建议

这版用 `SQLite` 足够支撑演示和小范围内部试跑。

如果准备正式内网使用，建议尽快升级为：

- `PostgreSQL`
- 正式内网登录鉴权
- 管理员权限分层
- 更稳妥的日志与备份
