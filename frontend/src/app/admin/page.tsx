"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { setMockAdminSession } from "./mock-store";

const REMEMBERED_USERNAME_KEY = "remembered_admin_username";

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const redirectPath = searchParams.get("redirect");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) router.replace(isSafeRedirectPath(redirectPath) ? redirectPath : "/admin/dashboard");

    const remembered = localStorage.getItem(REMEMBERED_USERNAME_KEY);
    if (remembered) {
      setUsername(remembered);
      setRememberUsername(true);
    }
  }, [redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (rememberUsername) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, username.trim());
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      }

      if (username === "demo" && password === "demo1234") {
        setMockAdminSession();
      } else {
        const { token } = await adminLogin(username, password);
        sessionStorage.setItem("admin_token", token);
      }
      router.replace(isSafeRedirectPath(redirectPath) ? redirectPath : "/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "コードが正しくありません。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">管理者ログイン</h1>
          <p className="text-slate-500 text-sm mt-1">IDとパスワードを入力してください</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                         placeholder:text-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                         placeholder:text-slate-300 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-500">
            <input
              type="checkbox"
              checked={rememberUsername}
              onChange={(e) => setRememberUsername(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
            />
            IDを記憶する
          </label>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full py-2.5 transition-colors"
          >
            {loading ? "認証中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

function isSafeRedirectPath(path: string | null): path is string {
  return Boolean(path && path.startsWith("/admin"));
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AdminPageContent />
    </Suspense>
  );
}
