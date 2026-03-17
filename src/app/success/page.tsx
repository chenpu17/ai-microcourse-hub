import Link from "next/link";

import { SignupLauncher } from "@/components/signup-launcher";

export default function SuccessPage() {
  return (
    <main className="narrow-page">
      <section className="success-card">
        <div className="success-topline">
          <p className="eyebrow">AI 微波炉 / 已收下</p>
        </div>

        <div className="success-intro">
          <div className="success-header">
            <div>
              <h1>这次分享，已经热起来了</h1>
              <p>
                管理员已经收到你的报名。接下来他们会看题目、排时间，再来和你确认。
              </p>
            </div>
            <div className="success-badge">报名成功</div>
          </div>

          <div className="chip-row">
            <span className="chip chip-mint">已进入待联系</span>
            <span className="chip chip-peach">排期前会二次确认</span>
          </div>
        </div>

        <div className="success-flow-grid">
          <div className="note-card note-card-peach">
            <h2>接下来会发生什么</h2>
            <ol>
              <li>管理员会先看你的议题和时长</li>
              <li>如果合适，会拉你确认一个可讲时间</li>
              <li>讲完后，回放和资料会被归档到社区里</li>
            </ol>
          </div>

          <div className="note-card">
            <h2>如果你愿意现在就准备</h2>
            <p>
              你可以先整理一个标题、一个例子、一个想讲的结论。微课越真实，越容易打动人。
            </p>
          </div>
        </div>

        <div className="success-actions">
          <div className="button-row">
            <Link className="button button-dark" href="/">
              回到首页
            </Link>
            <Link className="button button-soft" href="/#archive">
              看看历史微课
            </Link>
            <SignupLauncher label="再报一个话题" variant="peach" />
          </div>

          <p className="success-footer">
            如果你 2 天内还没收到联系，也没关系，管理员通常会在每周排期时统一处理。想继续分享，也可以顺手再报一个新话题。
          </p>
        </div>
      </section>
    </main>
  );
}
