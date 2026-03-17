# 开源说明与发布前检查

这份仓库已经适合公开展示，但如果你准备长期对外开源，建议在发布前再确认以下事项。

## 建议先确认的 8 件事

- 许可证：确认是否要补充 `MIT`、`Apache-2.0` 或公司允许的其他 License
- 品牌信息：确认 `AI 微波炉` 这个产品名是否适合长期公开使用
- 演示数据：确认 seed 中的讲师、主题、链接都是可公开内容
- 环境变量：再次确认 `.env`、`.env.local`、数据库文件未被提交
- 管理后台：正式公开演示时避免使用弱口令，优先改成更强口令或 trusted header
- 截图素材：公开截图前确认没有暴露内部昵称、组织名称、会议链接
- 仓库 About：补上简洁描述、Topics、网站地址
- Issue 策略：决定是否开放 issue / PR，还是仅作为作品展示仓库

## 推荐的 GitHub About 配置

仓库描述可直接使用：

> A playful internal AI microcourse hub for talk submissions, course archives, and lightweight community operations.

推荐 Topics：

- `nextjs`
- `react`
- `prisma`
- `playwright`
- `internal-tools`
- `knowledge-sharing`
- `community-platform`
- `ai`

## 推荐的公开说明口径

可以在 README 或 release 中使用下面这段话：

> This project is a lightweight internal-learning community prototype. It focuses on lowering the barrier for AI knowledge sharing inside teams, while giving operators a simple way to archive sessions, recordings, and learning materials.

## 如果准备正式开源

建议补齐：

- `LICENSE`
- 更完整的英文 README 或双语 README
- 产品截图
- 示例环境配置说明
- 部署示例或线上 demo 地址

## 如果主要用于作品展示

可以保持当前结构，只需要：

- README 做到信息完整
- Release 文案更清楚
- 截图质量统一
- 仓库简介与 Topics 补齐
