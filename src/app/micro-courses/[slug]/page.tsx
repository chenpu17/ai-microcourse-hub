import Link from "next/link";
import { notFound } from "next/navigation";

import { SignupLauncher } from "@/components/signup-launcher";
import { getCourseBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="page-stack">
      <section className="detail-hero">
        <div className="detail-hero-main">
          <p className="eyebrow">回放已归档 / {course.tags[0]?.tagName || "历史微课"}</p>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          <div className="chip-row">
            <span className="chip chip-mint">主讲 / {course.speakerName}</span>
            <span className="chip chip-peach">时长 / {course.durationLabel}</span>
            <span className="chip chip-plain">{formatDate(course.publishedAt)}</span>
          </div>
        </div>

        <div className="detail-hero-side detail-action-panel">
          <p className="eyebrow">这节微课现在可以做什么</p>
          <h2>看回放 / 拿资料 / 抄模板</h2>
          <p>适合想先快速试起来的人，内容不长，但足够你今天就跑一遍自己的工作流。</p>
          <div className="button-column detail-action-buttons">
            <a className="button button-lime" href={course.replayUrl} target="_blank">
              打开会议回放
            </a>
            <div className="materials-stack">
              <p className="materials-title">资料链接</p>
              <div className="materials-list">
                {course.materialLinks.map((link, index) => (
                  <a
                    className="button button-soft materials-link"
                    href={link}
                    key={link}
                    target="_blank"
                  >
                    查看资料 {index + 1}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <div className="detail-main">
          <article className="detail-card detail-summary-card">
            <h2>这节课讲了什么</h2>
            <p>{course.summary}</p>
          </article>

          <article className="detail-card detail-card-mint detail-takeaways-card">
            <h2>你能直接带走的 3 个点</h2>
            <ul className="detail-list">
              {course.takeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <section className="detail-related-section">
            <h2 className="section-title">相关微课</h2>
            <div className="related-grid">
              {course.relatedCourses.map((item) => (
                <Link className="detail-card compact-card" href={`/micro-courses/${item.slug}`} key={item.id}>
                  <h3>{item.title}</h3>
                  <p>
                    {item.durationLabel} / {item.tags[0]?.tagName || "历史微课"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-side">
          <div className="detail-card detail-speaker-card">
            <h3>这次是谁在讲</h3>
            <strong>{course.speakerName}</strong>
            <p>{course.speakerBio}</p>
          </div>

          <div className="detail-card detail-card-blue">
            <h3>听完的人怎么说</h3>
            <ul className="detail-list">
              {course.feedbackQuotes.map((quote) => (
                <li key={quote}>{quote}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="bottom-cta detail-bottom-cta">
        <div>
          <h2>看完有点想讲？你的经验也值得热一下</h2>
          <p>
            这里不是大课平台，10 到 45 分钟的小经验就够。只要真实、有用、能帮同事少踩坑，就很适合报上来。
          </p>
        </div>
        <div className="button-column">
          <SignupLauncher label="我也来报一个微课" variant="lime" />
          <Link className="button button-soft" href="/#archive">
            继续翻历史微课
          </Link>
        </div>
      </section>
    </main>
  );
}
