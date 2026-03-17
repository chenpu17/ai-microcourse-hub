"use client";

import { FormEvent, useMemo, useState } from "react";

type PublishCourseFormProps = {
  courses: {
    id: string;
    title: string;
    speakerName: string;
  }[];
  editableCourse?: {
    id: string;
    title: string;
    speakerName: string;
    durationLabel: string;
    eventDateValue: string;
    startTime: string | null;
    endTime: string | null;
    summary: string;
    replayUrl: string;
    materialsUrl: string;
    cardColorType: string;
    speakerBio: string;
    takeawaysText: string;
    feedbackQuotesText: string;
    tagNames: string[];
    relatedIds: string[];
  } | null;
  draft?: {
    id: string;
    topic: string;
    speakerName: string;
    durationLabel: string;
    note: string | null;
  } | null;
};

const presetTags = [
  "AI coding",
  "Prompt 实战",
  "提效流",
  "团队协作",
  "质量守门",
  "风险判断",
  "工作流",
  "模型选型"
];

function createDraftSummary(note: string | null, topic: string) {
  if (note?.trim()) {
    return note.trim();
  }

  return `这节分享会围绕“${topic}”展开，重点讲清楚它在真实工作里是怎么被用起来的，以及哪里最值得复用。`;
}

function parseDurationMinutes(value: string) {
  const match = value.match(/(\d+)/);

  return match ? Number(match[1]) : 20;
}

function addMinutesToTime(startTime: string, minutes: number) {
  const [hours, mins] = startTime.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const nextHours = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const nextMinutes = (total % 60).toString().padStart(2, "0");

  return `${nextHours}:${nextMinutes}`;
}

function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function PublishCourseForm({
  courses,
  draft,
  editableCourse
}: PublishCourseFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const mode = editableCourse ? "edit" : draft ? "archive" : "create";
  const defaultDateValue = editableCourse?.eventDateValue || getTodayDateValue();
  const defaultStartTime = editableCourse?.startTime || "11:00";
  const defaultEndTime =
    editableCourse?.endTime ||
    addMinutesToTime(
      defaultStartTime,
      parseDurationMinutes(editableCourse?.durationLabel || draft?.durationLabel || "20 分钟")
    );
  const selectableCourses = useMemo(
    () => courses.filter((course) => course.id !== editableCourse?.id),
    [courses, editableCourse?.id]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = event.currentTarget;

    const formData = new FormData(form);
    const presetTagValues = formData.getAll("presetTags").map((item) => String(item));
    const customTags = String(formData.get("tags") || "");
    const relatedIds = formData.getAll("relatedIds").map((item) => String(item));
    const payload = {
      title: String(formData.get("title") || ""),
      speakerName: String(formData.get("speakerName") || ""),
      durationLabel: String(formData.get("durationLabel") || ""),
      eventDate: String(formData.get("eventDate") || ""),
      startTime: String(formData.get("startTime") || ""),
      endTime: String(formData.get("endTime") || ""),
      summary: String(formData.get("summary") || ""),
      replayUrl: String(formData.get("replayUrl") || ""),
      materialsUrl: String(formData.get("materialsUrl") || ""),
      sourceSubmissionId: String(formData.get("sourceSubmissionId") || ""),
      tags: customTags,
      presetTags: presetTagValues,
      relatedIds,
      takeawaysText: String(formData.get("takeawaysText") || ""),
      speakerBio: String(formData.get("speakerBio") || ""),
      feedbackQuotesText: String(formData.get("feedbackQuotesText") || ""),
      cardColorType: String(formData.get("cardColorType") || "cream")
    };

    const response = await fetch(
      mode === "edit"
        ? `/api/admin/micro-courses/${editableCourse?.id}`
        : "/api/admin/micro-courses",
      {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      setMessage(result.error || "提交失败，请检查字段。");
      return;
    }

    setMessage(
      mode === "edit"
        ? "历史微课已更新。"
        : payload.sourceSubmissionId
          ? "历史微课已发布，这条报名也已经自动归档。"
          : "历史微课已发布，首页和详情页现在都能看到了。"
    );
    form.reset();
    window.location.assign("/admin?adminTab=archive");
  }

  return (
    <form className="publish-form" data-testid="publish-course-form" onSubmit={handleSubmit}>
      <input name="sourceSubmissionId" type="hidden" value={draft?.id || ""} />

      <div className="field-grid">
        <label className="field">
          <span>标题</span>
          <input
            defaultValue={editableCourse?.title || draft?.topic || ""}
            name="title"
            placeholder="让 AI 帮你整理需求评审纪要"
            required
          />
        </label>
        <label className="field">
          <span>主讲人</span>
          <input
            defaultValue={editableCourse?.speakerName || draft?.speakerName || ""}
            name="speakerName"
            placeholder="陈小麦"
            required
          />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>时长</span>
          <input
            defaultValue={editableCourse?.durationLabel || draft?.durationLabel || ""}
            name="durationLabel"
            placeholder="20 分钟"
            required
          />
        </label>
        <label className="field">
          <span>卡片风格</span>
          <select
            defaultValue={editableCourse?.cardColorType || "cream"}
            name="cardColorType"
          >
            <option value="cream">cream</option>
            <option value="mint">mint</option>
            <option value="blue">blue</option>
            <option value="peach">peach</option>
          </select>
        </label>
      </div>

      <div className="field-grid field-grid-triple">
        <label className="field">
          <span>活动日期</span>
          <input defaultValue={defaultDateValue} name="eventDate" required type="date" />
        </label>
        <label className="field">
          <span>开始时间</span>
          <input defaultValue={defaultStartTime} name="startTime" required type="time" />
        </label>
        <label className="field">
          <span>结束时间</span>
          <input defaultValue={defaultEndTime} name="endTime" required type="time" />
        </label>
      </div>

      <label className="field">
        <span>摘要</span>
        <textarea
          defaultValue={
            editableCourse?.summary ||
            (draft ? createDraftSummary(draft.note, draft.topic) : "")
          }
          name="summary"
          required
          rows={3}
        />
      </label>

      <div className="field-grid">
        <label className="field">
          <span>回放链接</span>
          <input
            defaultValue={editableCourse?.replayUrl || ""}
            name="replayUrl"
            placeholder="https://..."
            required
          />
        </label>
        <label className="field">
          <span>资料链接</span>
          <textarea
            defaultValue={editableCourse?.materialsUrl || ""}
            name="materialsUrl"
            placeholder={"https://...\nhttps://..."}
            required
            rows={3}
          />
          <small className="field-hint">支持多个链接，每行一个。</small>
        </label>
      </div>

      <label className="field">
        <span>自定义标签</span>
        <input
          defaultValue={editableCourse ? editableCourse.tagNames.join(", ") : ""}
          name="tags"
          placeholder="AI coding, 提效流, Prompt 实战"
        />
      </label>

      <fieldset className="field fieldset-block">
        <legend>常用标签，直接勾一下</legend>
        <div className="check-grid">
          {presetTags.map((tag) => (
            <label className="check-item" key={tag}>
              <input
                defaultChecked={editableCourse?.tagNames.includes(tag)}
                name="presetTags"
                type="checkbox"
                value={tag}
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field fieldset-block fieldset-related">
        <legend>相关推荐</legend>
        <p className="fieldset-hint">建议挑 1 到 3 条最相关的历史微课，避免推荐区太拥挤。</p>
        <div className="check-grid check-grid-stack">
          {selectableCourses.map((course) => (
            <label className="check-item check-item-related" key={course.id}>
              <input
                defaultChecked={editableCourse?.relatedIds.includes(course.id)}
                name="relatedIds"
                type="checkbox"
                value={course.id}
              />
              <span>
                {course.title}
                <small>{course.speakerName}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>3 个收获点，按换行分隔</span>
        <textarea
          defaultValue={editableCourse?.takeawaysText || ""}
          name="takeawaysText"
          rows={3}
        />
      </label>

      <label className="field">
        <span>主讲人介绍</span>
        <textarea defaultValue={editableCourse?.speakerBio || ""} name="speakerBio" rows={3} />
      </label>

      <label className="field">
        <span>反馈摘录，按换行分隔</span>
        <textarea
          defaultValue={editableCourse?.feedbackQuotesText || ""}
          name="feedbackQuotesText"
          rows={3}
        />
      </label>

      {message ? <p className="form-note">{message}</p> : null}

      <button className="button button-lime" disabled={loading} type="submit">
        {loading
          ? "提交中..."
          : mode === "edit"
            ? "保存这条历史微课"
            : draft
              ? "发布并归档这条报名"
              : "发布一条历史微课"}
      </button>
    </form>
  );
}
