"use client";

import { SubmissionStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const statusOptions: { label: string; value: SubmissionStatus }[] = [
  { label: "新报名", value: "NEW" },
  { label: "需追问", value: "NEED_FOLLOW_UP" },
  { label: "已排期", value: "SCHEDULED" },
  { label: "已归档", value: "ARCHIVED" },
  { label: "不推进", value: "REJECTED" }
];

type SubmissionStatusFormProps = {
  id: string;
  status: SubmissionStatus;
  adminComment: string | null;
};

export function SubmissionStatusForm({
  id,
  status,
  adminComment
}: SubmissionStatusFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: formData.get("status"),
        adminComment: formData.get("adminComment")
      })
    });

    setSaving(false);
    router.refresh();
  }

  return (
    <form className="mini-form" onSubmit={handleSubmit}>
      <select defaultValue={status} name="status">
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        defaultValue={adminComment || ""}
        name="adminComment"
        placeholder="联系备注 / 下一步"
      />
      <button className="button button-soft small" disabled={saving} type="submit">
        {saving ? "保存中" : "记一下"}
      </button>
    </form>
  );
}
