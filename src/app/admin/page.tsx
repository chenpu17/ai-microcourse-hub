import Link from "next/link";
import { SubmissionStatus } from "@prisma/client";

import { AdminLoginForm } from "@/components/admin-login-form";
import { LogoutButton } from "@/components/logout-button";
import { PublishCourseForm } from "@/components/publish-course-form";
import { SubmissionStatusForm } from "@/components/submission-status-form";
import {
  getAdminAuthState,
  getAdminTrustedHeaderName
} from "@/lib/admin";
import { getAdminDashboardData, getEditableCourse } from "@/lib/data";
import { formatDate, formatTimeRange } from "@/lib/utils";

type AdminPageProps = {
  searchParams?: Promise<{
    archiveFrom?: string;
    editCourse?: string;
    submissionView?: string;
    adminTab?: string;
  }>;
};

const submissionStatusMeta: Record<
  SubmissionStatus,
  { label: string; tone: "lime" | "peach" | "blue" | "ink" | "plain" }
> = {
  NEW: { label: "新报名", tone: "lime" },
  NEED_FOLLOW_UP: { label: "需追问", tone: "peach" },
  SCHEDULED: { label: "已排期", tone: "blue" },
  ARCHIVED: { label: "已归档", tone: "plain" },
  REJECTED: { label: "不推进", tone: "ink" }
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const auth = await getAdminAuthState();
  const params = (await searchParams) || {};
  const requestedAdminTab = params.adminTab === "archive" ? "archive" : "submissions";
  const adminTab =
    params.archiveFrom || params.editCourse ? "archive" : requestedAdminTab;

  if (!auth.authorized) {
    return (
      <main className="narrow-page">
        <AdminLoginForm
          authMode={auth.mode}
          trustedHeaderName={getAdminTrustedHeaderName()}
        />
      </main>
    );
  }

  const {
    submissions,
    recentCourses,
    archiveLedger,
    allCourses,
    metrics,
    archiveSource,
    submissionView
  } = await getAdminDashboardData({
    archiveFromId: params.archiveFrom,
    submissionView: params.submissionView
  });
  const editableCourse = await getEditableCourse(params.editCourse);
  const buildAdminUrl = (
    nextParams: Partial<{
      adminTab: "submissions" | "archive";
      submissionView: "active" | "all" | "done";
      archiveFrom: string;
      editCourse: string;
    }>,
    hash?: string
  ) => {
    const urlParams = new URLSearchParams();
    const nextAdminTab = nextParams.adminTab || adminTab;

    urlParams.set("adminTab", nextAdminTab);

    const nextSubmissionView = nextParams.submissionView || params.submissionView;

    if (nextSubmissionView && nextAdminTab === "submissions") {
      urlParams.set("submissionView", nextSubmissionView);
    }

    const nextArchiveFrom =
      nextParams.archiveFrom === undefined ? params.archiveFrom : nextParams.archiveFrom;
    const nextEditCourse =
      nextParams.editCourse === undefined ? params.editCourse : nextParams.editCourse;

    if (nextArchiveFrom) {
      urlParams.set("archiveFrom", nextArchiveFrom);
    }

    if (nextEditCourse) {
      urlParams.set("editCourse", nextEditCourse);
    }

    const query = urlParams.toString();

    return `/admin${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
  };

  const buildAdminHref = (nextView: "active" | "all" | "done") => {
    return buildAdminUrl(
      {
        adminTab: "submissions",
        submissionView: nextView,
        archiveFrom: "",
        editCourse: ""
      },
      "submission-list"
    );
  };

  return (
    <main className="page-stack">
      <section className="admin-top">
        <div className="admin-top-copy">
          <p className="eyebrow">AI 微波炉 / 轻运营面板</p>
          <h1>把已经成熟的话题，尽快推上本周微课排期</h1>
          <p>
            这不是传统审批台，而是轻运营节奏面板。你只需要判断哪些题目够清晰，哪些人还需要追问，哪些内容可以直接归档。
          </p>
          <div className="chip-row">
            <span className="chip chip-mint">{metrics.newSubmissions} 个近期可跟进线索</span>
            <span className="chip chip-plain">{metrics.archivedCourses} 条内容已归档</span>
          </div>
        </div>
        <div className="admin-top-side">
          <span className="chip chip-plain">
            当前认证：{auth.mode === "password" ? "口令模式" : `SSO 透传 / ${auth.identity}`}
          </span>
          <div className="admin-metric-grid">
            <div className="admin-metric-card admin-metric-card-mint">
              <strong>{metrics.newSubmissions}</strong>
              <span>新报名</span>
            </div>
            <div className="admin-metric-card admin-metric-card-blue">
              <strong>{metrics.activeSubmissions}</strong>
              <span>待处理报名</span>
            </div>
            <div className="admin-metric-card admin-metric-card-peach">
              <strong>{metrics.archivedCourses}</strong>
              <span>已归档内容</span>
            </div>
          </div>
          <div className="button-column">
            <Link className="button button-soft" href="/">
              回社区首页看看呈现
            </Link>
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="section-card admin-mode-card">
        <div className="admin-section-head">
          <div>
            <h2>后台视图</h2>
            <p>把“报名推进”和“历史活动运营”拆开看，管理员判断会直接很多。</p>
          </div>
          <div className="admin-mode-tabs" aria-label="后台主视图">
            <Link
              className={`admin-mode-link ${
                adminTab === "submissions" ? "admin-mode-link-active" : ""
              }`}
              href={buildAdminUrl({
                adminTab: "submissions",
                archiveFrom: "",
                editCourse: ""
              })}
            >
              报名信息
            </Link>
            <Link
              className={`admin-mode-link ${
                adminTab === "archive" ? "admin-mode-link-active" : ""
              }`}
              href={buildAdminUrl({ adminTab: "archive" })}
            >
              历史活动
            </Link>
          </div>
        </div>
      </section>

      <section className="admin-grid">
        <div className="admin-main">
          {adminTab === "submissions" ? (
            <div className="section-card">
              <div className="admin-section-head" id="submission-list">
                <div>
                  <h2>最近报名，先联系谁</h2>
                  <p>
                    默认先看还在推进中的题目，已完成和不推进的报名先收起来，运营视线会更轻一点。
                  </p>
                </div>
                <div className="segmented-tabs" aria-label="报名筛选">
                  <Link
                    className={`tab-link ${submissionView === "active" ? "tab-link-active" : ""}`}
                    href={buildAdminHref("active")}
                  >
                    待处理
                    <span>{metrics.activeSubmissions}</span>
                  </Link>
                  <Link
                    className={`tab-link ${submissionView === "done" ? "tab-link-active" : ""}`}
                    href={buildAdminHref("done")}
                  >
                    已完成
                    <span>{metrics.completedSubmissions}</span>
                  </Link>
                  <Link
                    className={`tab-link ${submissionView === "all" ? "tab-link-active" : ""}`}
                    href={buildAdminHref("all")}
                  >
                    全部
                    <span>{metrics.activeSubmissions + metrics.completedSubmissions}</span>
                  </Link>
                </div>
              </div>

              {submissions.length ? (
                <div className="admin-list">
                  {submissions.map((submission) => {
                    const statusMeta = submissionStatusMeta[submission.status];

                    return (
                      <article className="admin-item" key={submission.id}>
                        <div className="admin-item-head">
                          <div>
                            <div className="submission-meta-row">
                              <span className={`status-pill status-pill-${statusMeta.tone}`}>
                                {statusMeta.label}
                              </span>
                              <span className="chip chip-plain">
                                {formatDate(submission.createdAt)}
                              </span>
                            </div>
                            <h3>{submission.topic}</h3>
                            <p>
                              {submission.speakerName} · {submission.durationLabel}
                            </p>
                          </div>
                        </div>
                        <p className="admin-note">{submission.note || "这条报名还没补充上下文。"}</p>
                        <div className="admin-item-actions">
                          <Link
                            className="button button-peach small"
                            href={buildAdminUrl(
                              {
                                adminTab: "archive",
                                archiveFrom: submission.id,
                                editCourse: ""
                              },
                              "publish-form"
                            )}
                          >
                            转成归档草稿
                          </Link>
                        </div>
                        <SubmissionStatusForm
                          adminComment={submission.adminComment}
                          id={submission.id}
                          status={submission.status}
                        />
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <strong>
                    {submissionView === "done"
                      ? "已完成报名已经清空。"
                      : submissionView === "all"
                        ? "当前还没有任何报名。"
                        : "当前没有待处理报名。"}
                  </strong>
                  <p>
                    {submissionView === "done"
                      ? "这一栏现在是空的，说明最近清理得很干净。"
                      : submissionView === "all"
                        ? "先让大家报第一个微课，后台这里就会慢慢热起来。"
                        : "可以切到“已完成”看看归档过的线索，或者回首页继续收新题目。"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="section-card ledger-card">
              <div className="admin-section-head">
                <div>
                  <h2>历史活动台账</h2>
                  <p>
                    这里用更适合运营复盘的表格看历史微课。主题、主讲人、活动日期和时间段可以直接扫一眼。
                  </p>
                </div>
                <div className="ledger-head-actions">
                  <span className="chip chip-plain">最近 {archiveLedger.length} 条归档</span>
                  <a
                    className="button button-soft small"
                    download
                    href="/api/admin/micro-courses/export"
                  >
                    导出 CSV
                  </a>
                </div>
              </div>

              <div className="ledger-shell">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>主题</th>
                      <th>主讲人</th>
                      <th>活动时间</th>
                      <th>时长</th>
                      <th>资料</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archiveLedger.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <div className="ledger-topic-cell">
                            <strong>{course.title}</strong>
                            <span>{course.tags[0]?.tagName || "历史微课"}</span>
                          </div>
                        </td>
                        <td>{course.speakerName}</td>
                        <td>
                          {course.eventDate ? (
                            <div className="ledger-time-cell">
                              <strong>{formatDate(course.eventDate)}</strong>
                              <span>{formatTimeRange(course.startTime, course.endTime)}</span>
                            </div>
                          ) : (
                            <span className="muted">待补时间</span>
                          )}
                        </td>
                        <td>{course.durationLabel}</td>
                        <td>
                          <span className="ledger-count-pill">
                            {course.materialsUrl
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean).length}{" "}
                            份资料
                          </span>
                        </td>
                        <td>
                          <div className="ledger-actions">
                            <Link
                              className="button button-soft small"
                              href={`/micro-courses/${course.slug}`}
                            >
                              查看
                            </Link>
                            <Link
                              className="button button-peach small"
                              href={buildAdminUrl(
                                {
                                  adminTab: "archive",
                                  editCourse: course.id,
                                  archiveFrom: ""
                                },
                                "publish-form"
                              )}
                            >
                              编辑
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside className="admin-side">
          {adminTab === "submissions" ? (
            <>
              <div className="side-panel">
                <h2>报名处理节奏</h2>
                <p>
                  先在这里判断题目是否清晰、主讲人是否可约，再决定是否推进到历史活动归档流里。两步拆开后，管理会顺很多。
                </p>
              </div>

              <div className="detail-card detail-card-mint">
                <h3>刚归档的内容</h3>
                <ul className="detail-list">
                  {recentCourses.map((course) => (
                    <li className="recent-course-item" key={course.id}>
                      <div className="recent-course-links">
                        <Link href={`/micro-courses/${course.slug}`}>{course.title}</Link>
                        <Link
                          className="button button-soft small"
                          href={buildAdminUrl(
                            {
                              adminTab: "archive",
                              editCourse: course.id,
                              archiveFrom: ""
                            },
                            "publish-form"
                          )}
                        >
                          去历史活动
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="side-panel" id="publish-form">
                <h2>马上就能做的动作</h2>
                <p>
                  把已讲完的内容补上标题、主讲人、活动时间、回放链接和资料地址，再顺手挂上相关推荐和标签，就能更像一个真的内容社区。
                </p>
                {archiveSource ? (
                  <div className="draft-banner">
                    <strong>当前正在从报名生成归档草稿</strong>
                    <span>
                      {archiveSource.topic} / {archiveSource.speakerName} /{" "}
                      {archiveSource.durationLabel}
                    </span>
                  </div>
                ) : null}
                {editableCourse ? (
                  <div className="draft-banner draft-banner-blue">
                    <strong>当前正在编辑历史微课</strong>
                    <span>
                      {editableCourse.title} / {editableCourse.speakerName} /{" "}
                      {editableCourse.durationLabel}
                    </span>
                  </div>
                ) : null}
                <PublishCourseForm
                  key={editableCourse?.id || archiveSource?.id || "create-course"}
                  courses={allCourses}
                  draft={archiveSource}
                  editableCourse={editableCourse}
                />
              </div>

              <div className="detail-card detail-card-mint">
                <h3>刚归档的内容</h3>
                <ul className="detail-list">
                  {recentCourses.map((course) => (
                    <li className="recent-course-item" key={course.id}>
                      <div className="recent-course-links">
                        <Link href={`/micro-courses/${course.slug}`}>{course.title}</Link>
                        <Link
                          className="button button-soft small"
                          href={buildAdminUrl(
                            {
                              adminTab: "archive",
                              editCourse: course.id,
                              archiveFrom: ""
                            },
                            "publish-form"
                          )}
                        >
                          编辑
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
