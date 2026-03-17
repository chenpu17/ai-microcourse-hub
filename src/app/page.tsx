import Link from "next/link";

import { SignupLauncher } from "@/components/signup-launcher";
import { getHomepageData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type HomePageProps = {
  searchParams?: Promise<{ page?: string }>;
};

const colorClassMap: Record<string, string> = {
  cream: "card-cream",
  mint: "card-mint",
  blue: "card-blue",
  peach: "card-peach"
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) || {};
  const page = Number(params.page || "1");
  const { items, latest, total, totalPages } = await getHomepageData(page);

  return (
    <main className="page-stack">
      <section className="hero-grid">
        <div className="hero-card">
          <div className="hero-card-main">
            <p className="eyebrow">AI 社区 / FEED</p>
            <h1>最近谁在把 AI 真用进工作里</h1>
            <p className="hero-copy">
              这里收的是内部真实经验，不讲大词。10 到 45 分钟的小微课，讲清楚一个可复制方法、
              一个踩坑结论、一个今天就能试的 AI 工作流。
            </p>
          </div>
          <div className="hero-actions">
            <SignupLauncher label="我要热一下" variant="lime" />
            <a className="button button-soft" href="#archive">
              翻历史微课
            </a>
          </div>
        </div>

        <div className="highlight-card">
          <div className="highlight-head">
            <div className="highlight-note">刚归档</div>
            {latest[0] ? <span className="highlight-badge">{latest[0].durationLabel}</span> : null}
          </div>
          <h2>{latest[0]?.title || "今天的微课还在路上"}</h2>
          <p>
            {latest[0]?.summary ||
              "等第一条内容发布之后，这里会优先出现今天最值得看的那节分享。"}
          </p>
          {latest[0] ? (
            <div className="highlight-meta">
              <span>{latest[0].speakerName}</span>
              <span>{latest[0].tags[0]?.tagName || "历史微课"}</span>
            </div>
          ) : null}
          {latest[0] ? (
            <Link className="inline-link" href={`/micro-courses/${latest[0].slug}`}>
              直接去看回放
            </Link>
          ) : null}
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat-pill stat-pill-lime">
          <strong>{total}</strong>
          <span>节历史微课</span>
        </div>
        <div className="stat-pill stat-pill-cream">
          <strong>10-45</strong>
          <span>分钟小分享</span>
        </div>
        <div className="stat-pill stat-pill-peach">
          <strong>免登录</strong>
          <span>先报名再确认</span>
        </div>
      </section>

      <section className="content-grid">
        <div className="content-column">
          <div className="section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">最新分享</p>
                <h2>最近这几节，值得先看</h2>
              </div>
              <span className="section-head-note">内部真实经验，先扫一遍再挑细看</span>
            </div>
            <div className="story-list">
              {latest.map((course, index) => (
                <Link
                  className={`story-card ${colorClassMap[course.cardColorType] || "card-cream"}`}
                  href={`/micro-courses/${course.slug}`}
                  key={course.id}
                >
                  <div className="story-meta-row">
                    <div className="story-meta">
                      <span>{course.tags[0]?.tagName || "历史微课"}</span>
                      <span>{course.durationLabel}</span>
                    </div>
                    <span className="story-rank">第 {index + 1} 条推荐</span>
                  </div>
                  <div className="story-body">
                    <h3>{course.title}</h3>
                    <p>{course.summary}</p>
                  </div>
                  <div className="story-footer">
                    <span>{course.speakerName}</span>
                    <span>回放 / 资料 / 详情</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="sidebar-column">
          <div className="side-panel">
            <p className="eyebrow">今天轻轻推动一下</p>
            <h3>哪怕只是一个真实案例，也值得报上来</h3>
            <p>不需要大课，不需要完整体系。一个真实场景、一个有效模板，就够了。</p>
            <SignupLauncher label="现在就报一个" variant="dark" />
          </div>

          <div className="side-panel side-panel-soft">
            <p className="eyebrow">大家爱听什么</p>
            <div className="tag-cloud">
              <span>AI coding</span>
              <span>Prompt 实战</span>
              <span>提效流</span>
              <span>风险判断</span>
              <span>团队协作</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="archive-section" id="archive">
        <div className="archive-head">
          <div>
            <p className="eyebrow">历史微课</p>
            <h2>一次最多看 16 条，慢慢翻</h2>
          </div>
          <p className="archive-meta">
            第 {Math.min(page, totalPages)} / {totalPages} 页
          </p>
        </div>
        <p className="archive-copy">
          每张卡片都能进入详情页，继续看回放、资料和本节微课到底带走了什么。
        </p>

        <div className="archive-grid">
          {items.map((course) => (
            <Link
              className={`archive-card ${colorClassMap[course.cardColorType] || "card-cream"}`}
              href={`/micro-courses/${course.slug}`}
              key={course.id}
            >
              <div className="archive-top">
                <span className="archive-tag">{course.tags[0]?.tagName || "历史微课"}</span>
                <span className="archive-duration">{course.durationLabel}</span>
              </div>
              <div className="archive-body">
                <h3>{course.title}</h3>
                <p className="archive-speaker">{course.speakerName}</p>
              </div>
              <div className="archive-cta">
                <span>{formatDate(course.publishedAt)}</span>
                <span>回放 / 资料</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="pager-row">
          <span>当前每页最多 16 条历史微课</span>
          <div className="button-row">
            <Link
              className={`button button-soft ${page <= 1 ? "is-disabled" : ""}`}
              href={page <= 1 ? "/" : `/?page=${page - 1}`}
            >
              上一页
            </Link>
            <Link
              className={`button button-lime ${page >= totalPages ? "is-disabled" : ""}`}
              href={page >= totalPages ? `/?page=${totalPages}` : `/?page=${page + 1}`}
            >
              下一页
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
