import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI 微波炉",
  description: "一个轻松、自然、活力的内部 AI 微课分享社区。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="site-frame">
          <header className="site-header">
            <Link className="site-brand" href="/">
              AI 微波炉
            </Link>
            <nav className="site-nav">
              <Link href="/">首页</Link>
              <Link href="/admin">运营后台</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
