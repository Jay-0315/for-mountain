"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployeeAccount, type CreateEmployeeAccountResponse } from "@/lib/api";
import { getSessionRole } from "@/lib/session";
import { getCompanySettings, saveCompanySettings } from "../mock-store";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [issued, setIssued] = useState<CreateEmployeeAccountResponse | null>(null);
  const [token] = useState(() =>
    typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""
  );
  const isAdmin = getSessionRole(token) === "ADMIN";

  const [companyName, setCompanyName] = useState("株式会社マウンテン");
  const [companyEmail, setCompanyEmail] = useState("info@for-mountain.co.jp");
  const [companyAddress, setCompanyAddress] = useState("東京都千代田区岩本町2-13-6 リアライズ岩本町ビル 5F");
  const [companyMsg, setCompanyMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [companySaving, setCompanySaving] = useState(false);

  useEffect(() => {
    const settings = getCompanySettings();
    setCompanyName(settings.companyName);
    setCompanyEmail(settings.companyEmail);
    setCompanyAddress(settings.companyAddress);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isAdmin, router]);

  const setupUrl = useMemo(() => {
    if (!issued || typeof window === "undefined") return "";
    const q = new URLSearchParams({ username: issued.username, token: issued.setupToken });
    return `${window.location.origin}/account/setup?${q.toString()}`;
  }, [issued]);

  const legacyCopyText = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!copied) {
      throw new Error("copy-failed");
    }
  };

  const copyText = async (text: string) => {
    if (!text) return;
    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        legacyCopyText(text);
      }
      setAccountMsg({ type: "ok", text: "クリップボードにコピーしました。" });
    } catch {
      try {
        legacyCopyText(text);
        setAccountMsg({ type: "ok", text: "クリップボードにコピーしました。" });
      } catch {
        setAccountMsg({ type: "err", text: "コピーに失敗しました。表示された値を手動でコピーしてください。" });
      }
    }
  };

  const handleIssueAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMsg(null);
    setIssued(null);

    setAccountSaving(true);
    try {
      const response = await createEmployeeAccount(token, employeeNumber.trim());
      setIssued(response);
      setAccountMsg({ type: "ok", text: "社員アカウントを発行しました。" });
      setEmployeeNumber("");
    } catch (err: unknown) {
      setAccountMsg({ type: "err", text: err instanceof Error ? err.message : "発行に失敗しました。" });
    } finally {
      setAccountSaving(false);
    }
  };

  const handleCompanySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanySaving(true);
    setCompanyMsg(null);
    await new Promise((r) => setTimeout(r, 800));
    saveCompanySettings({ companyName, companyEmail, companyAddress });
    setCompanyMsg({ type: "ok", text: "会社情報を保存しました。（※バックエンド連携後に有効）" });
    setCompanySaving(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-bold text-slate-900">設定</h2>

      <SectionCard title="社員アカウント発行">
        <form onSubmit={handleIssueAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">社員番号（ID）</label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              required
              placeholder="M26031025"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">IDは社員番号で固定されます。パスワードは本人が初回設定します。</p>
          </div>

          {accountMsg && (
            <p
              className={`text-xs px-3 py-2 rounded-lg ${
                accountMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              {accountMsg.text}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={accountSaving}
              className="admin-btn-primary px-5 py-2.5 transition-colors"
            >
              {accountSaving ? "発行中..." : "アカウント発行"}
            </button>
          </div>
        </form>

        {issued && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="text-xs">
              <p className="text-slate-500">ID</p>
              <p className="font-mono text-slate-900">{issued.username}</p>
            </div>
            <div className="text-xs">
              <p className="text-slate-500">初期設定トークン</p>
              <div className="flex items-start gap-2">
                <textarea
                  readOnly
                  value={issued.setupToken}
                  rows={3}
                  className="font-mono text-slate-900 break-all flex-1 resize-none rounded border border-slate-200 bg-white px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => void copyText(issued.setupToken)}
                  className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-white"
                >
                  コピー
                </button>
              </div>
            </div>
            <div className="text-xs">
              <p className="text-slate-500">初回パスワード設定URL</p>
              <div className="flex items-start gap-2">
                <textarea
                  readOnly
                  value={setupUrl}
                  rows={4}
                  className="font-mono text-slate-900 break-all flex-1 resize-none rounded border border-slate-200 bg-white px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => void copyText(setupUrl)}
                  className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-white"
                >
                  コピー
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              有効期限: {new Date(issued.setupTokenExpiresAt).toLocaleString("ja-JP")}
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="会社情報">
        <form onSubmit={handleCompanySave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">会社名</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">連絡先メール</label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">住所</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            />
          </div>

          {companyMsg && (
            <p className={`text-xs px-3 py-2 rounded-lg ${
              companyMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              {companyMsg.text}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={companySaving}
              className="admin-btn-primary px-5 py-2.5 transition-colors"
            >
              {companySaving ? "保存中..." : "保存する"}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
