"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignupLauncherProps = {
  label: string;
  variant?: "lime" | "dark" | "soft" | "peach";
  className?: string;
};

export function SignupLauncher({
  label,
  variant = "lime",
  className
}: SignupLauncherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      topic: String(formData.get("topic") || ""),
      speakerName: String(formData.get("speakerName") || ""),
      durationLabel: String(formData.get("durationLabel") || ""),
      note: String(formData.get("note") || "")
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(result.error || "提交失败，请稍后再试。");
      return;
    }

    router.push("/success");
  }

  return (
    <>
      <button
        className={`button button-${variant} ${className || ""}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        {label}
      </button>

      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">AI 微波炉 / 报个微课</p>
                <h3>把你真的用过的经验，热一下</h3>
              </div>
              <button
                aria-label="关闭"
                className="ghost-icon"
                onClick={() => setOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form className="form-stack" onSubmit={handleSubmit}>
              <label className="field">
                <span>你想讲什么</span>
                <input
                  name="topic"
                  placeholder="比如：让 AI 帮我写日报，不再每天下班前崩溃"
                  required
                />
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>你是谁</span>
                  <input name="speakerName" placeholder="姓名" required />
                </label>

                <label className="field">
                  <span>预计多长时间</span>
                  <select defaultValue="20 分钟" name="durationLabel">
                    <option>10 分钟</option>
                    <option>15 分钟</option>
                    <option>20 分钟</option>
                    <option>30 分钟</option>
                    <option>45 分钟</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>补充一点上下文</span>
                <textarea
                  name="note"
                  placeholder="可以写你准备讲哪个真实案例，或者想带大家看到什么。"
                  rows={4}
                />
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <div className="modal-actions">
                <button
                  className="button button-soft"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  先不报了
                </button>
                <button className="button button-dark" disabled={loading} type="submit">
                  {loading ? "正在提交..." : "收下这个话题"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
