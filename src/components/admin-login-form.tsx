"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AdminLoginFormProps = {
  authMode: "password" | "trusted_header";
  trustedHeaderName: string;
};

export function AdminLoginForm({
  authMode,
  trustedHeaderName
}: AdminLoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authMode === "trusted_header") {
    return (
      <div className="admin-login-card">
        <p className="eyebrow">AI 微波炉 / 轻运营面板</p>
        <h1>当前启用内网透传认证</h1>
        <p className="muted">
          这个环境不会显示口令登录。请从公司内网入口访问，或者让反向代理透传
          <code>{trustedHeaderName}</code> 请求头。
        </p>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(result.error || "口令不对。");
      return;
    }

    router.refresh();
  }

  return (
    <form className="admin-login-card" onSubmit={handleSubmit}>
      <p className="eyebrow">AI 微波炉 / 轻运营面板</p>
      <h1>先输一下管理员口令</h1>
      <p className="muted">
        第一版原型先用最轻的口令鉴权，后面再替换成正式内网登录。
      </p>
      <label className="field">
        <span>管理员口令</span>
        <input
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="输入 ADMIN_PASSWORD"
          type="password"
          value={password}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-dark" disabled={loading} type="submit">
        {loading ? "正在进入..." : "进入轻运营后台"}
      </button>
    </form>
  );
}
