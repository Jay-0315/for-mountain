"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeLineWorksOAuth } from "@/lib/api";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("LINE WORKSで認証しています...");

  useEffect(() => {
    const code = searchParams?.get("code");
    const state = searchParams?.get("state");
    const error = searchParams?.get("error");
    if (error || !code || !state) {
      setMessage("LINE WORKSログインに失敗しました。ログイン画面へ戻ります。");
      const timer = window.setTimeout(() => router.replace("/admin"), 1500);
      return () => window.clearTimeout(timer);
    }

    exchangeLineWorksOAuth(code, state)
      .then(({ token }) => {
        sessionStorage.setItem("admin_token", token);
        window.dispatchEvent(new Event("admin-session-changed"));
        router.replace("/admin/dashboard");
      })
      .catch((err: unknown) => {
        setMessage(err instanceof Error ? err.message : "LINE WORKSログインに失敗しました。ログイン画面へ戻ります。");
        const timer = window.setTimeout(() => router.replace("/admin"), 1800);
        return () => window.clearTimeout(timer);
      });
  }, [router, searchParams]);

  return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">{message}</div>;
}

export default function LineWorksOAuthCallbackPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><CallbackContent /></Suspense>;
}
