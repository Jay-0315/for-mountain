"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("社員番号（ID）を入力してください。");
      return;
    }
    setSending(true);
    try {
      await requestPasswordReset(username.trim());
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">パスワード再設定</h1>
        <p className="mt-1 text-sm text-slate-500">
          登録されたメールアドレスへ、パスワード再設定用のリンクをお送りします。
        </p>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">
              入力されたIDが登録されている場合、再設定リンクをメールで送信しました。メールをご確認ください。
            </p>
            <Link href="/admin" className="admin-btn-primary block w-full py-2.5 text-center">
              ログイン画面へ戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">社員番号（ID）</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例：M24101017"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="admin-btn-primary w-full py-2.5 transition-colors"
            >
              {sending ? "送信中..." : "再設定リンクを送信"}
            </button>

            <div className="text-center">
              <Link href="/admin" className="text-xs font-medium text-slate-400 hover:text-orange-500">
                ログイン画面へ戻る
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
