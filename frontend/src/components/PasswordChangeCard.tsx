"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";
import { PasswordInput } from "@/components/PasswordInput";

const FIELD_CLASS =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400";

export function PasswordChangeCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 4) {
      setMessage({ type: "err", text: "新しいパスワードは4文字以上で設定してください。" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "err", text: "新しいパスワード確認が一致しません。" });
      return;
    }

    const token = typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? "";
    if (!token) {
      setMessage({ type: "err", text: "ログイン情報が見つかりません。再度ログインしてください。" });
      return;
    }

    setSaving(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setMessage({ type: "ok", text: "パスワードを変更しました。" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "変更に失敗しました。" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold text-slate-500">パスワード変更</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 sm:max-w-xs">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">現在のパスワード</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">新しいパスワード</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">新しいパスワード（確認）</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={FIELD_CLASS}
            />
          </div>
        </div>

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-xs ${
              message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="admin-btn-primary px-5 py-2.5">
            {saving ? "変更中..." : "変更する"}
          </button>
        </div>
      </form>
    </div>
  );
}
