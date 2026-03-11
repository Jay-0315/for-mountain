"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setupInitialPassword } from "@/lib/api";

function AccountSetupPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [username, setUsername] = useState(searchParams.get("username") ?? "");
  const [setupToken, setSetupToken] = useState(searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const canSubmit = useMemo(
    () =>
      username.trim().length > 0 &&
      setupToken.trim().length > 0 &&
      newPassword.length >= 4 &&
      newPassword === confirmPassword,
    [username, setupToken, newPassword, confirmPassword]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "err", text: "パスワード確認が一致しません。" });
      return;
    }
    if (newPassword.length < 4) {
      setMessage({ type: "err", text: "パスワードは4文字以上で設定してください。" });
      return;
    }

    setSaving(true);
    try {
      await setupInitialPassword({
        username: username.trim(),
        setupToken: setupToken.trim(),
        newPassword,
      });
      setMessage({ type: "ok", text: "パスワードを設定しました。ログインしてください。" });
      setTimeout(() => router.push("/admin"), 1200);
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "設定に失敗しました。" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-slate-900">初回パスワード設定</h1>
        <p className="text-sm text-slate-500 mt-1">
          管理者から共有されたトークンでパスワードを設定します。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">社員番号（ID）</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">初期設定トークン</label>
            <textarea
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">新しいパスワード</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">新しいパスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {message && (
            <p className={`text-xs px-3 py-2 rounded-lg ${
              message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="admin-btn-primary w-full py-2.5 transition-colors"
          >
            {saving ? "設定中..." : "パスワード設定"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AccountSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AccountSetupPageContent />
    </Suspense>
  );
}
