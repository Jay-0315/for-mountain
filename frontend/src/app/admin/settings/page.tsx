"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployeeAccount, type CreateEmployeeAccountResponse } from "@/lib/api";
import { getSessionRole } from "@/lib/session";
import { getCompanySettings, saveCompanySettings } from "../mock-store";

type AccountResult = {
  employeeNumber: string;
  ok: boolean;
  data?: CreateEmployeeAccountResponse;
  error?: string;
};

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
  const [rows, setRows] = useState<string[]>([""]);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [results, setResults] = useState<AccountResult[]>([]);
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

  const buildSetupUrl = (resp: CreateEmployeeAccountResponse) => {
    if (typeof window === "undefined") return "";
    const q = new URLSearchParams({ username: resp.username, token: resp.setupToken });
    return `${window.location.origin}/account/setup?${q.toString()}`;
  };

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

  const copyAllSetupUrls = () => {
    const lines = results
      .filter((r) => r.ok && r.data)
      .map((r) => `${r.data!.username}\t${r.data!.name}\t${buildSetupUrl(r.data!)}`);
    if (lines.length > 0) void copyText(lines.join("\n"));
  };

  const addRow = () => setRows((prev) => [...prev, ""]);
  const removeRow = (idx: number) => setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  const updateRow = (idx: number, value: string) => setRows((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const handleIssueAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMsg(null);
    setResults([]);

    const numbers = Array.from(new Set(rows.map((s) => s.trim()).filter(Boolean)));
    if (numbers.length === 0) {
      setAccountMsg({ type: "err", text: "社員番号を入力してください。" });
      return;
    }

    setAccountSaving(true);
    const out: AccountResult[] = [];
    for (const num of numbers) {
      try {
        const data = await createEmployeeAccount(token, num);
        out.push({ employeeNumber: num, ok: true, data });
      } catch (err: unknown) {
        out.push({ employeeNumber: num, ok: false, error: err instanceof Error ? err.message : "発行に失敗しました。" });
      }
    }
    setResults(out);

    const okCount = out.filter((r) => r.ok).length;
    const failCount = out.length - okCount;
    setAccountMsg({
      type: failCount === 0 ? "ok" : "err",
      text: `発行 ${okCount}件成功${failCount > 0 ? ` / ${failCount}件失敗` : ""}`,
    });
    if (failCount === 0) setRows([""]);
    setAccountSaving(false);
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
      <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-400" />
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">設定</h2>
          <p className="mt-0.5 text-sm text-slate-500">管理者アカウントの設定を行います。</p>
        </div>
      </div>

      <SectionCard title="社員アカウント発行">
        <form onSubmit={handleIssueAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">社員番号（ID）</label>
            <div className="space-y-2">
              {rows.map((value, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateRow(idx, e.target.value)}
                    placeholder="M26031025"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono
                               focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length <= 1}
                    aria-label="削除"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              社員番号を追加
            </button>
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

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            {results.some((r) => r.ok) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={copyAllSetupUrls}
                  className="px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  全URLをコピー
                </button>
              </div>
            )}

            {results.map((r) =>
              r.ok && r.data ? (
                <div key={r.employeeNumber} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="text-xs text-slate-500">社員番号</span>
                    <span className="font-mono text-sm text-slate-900">{r.data.username}</span>
                    <span className="text-xs text-slate-500">氏名</span>
                    <span className="text-sm font-medium text-slate-900">{r.data.name}</span>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500">初回パスワード設定リンク</p>
                    <div className="flex items-start gap-2">
                      <textarea
                        readOnly
                        value={buildSetupUrl(r.data)}
                        rows={3}
                        className="font-mono text-slate-900 break-all flex-1 resize-none rounded border border-slate-200 bg-white px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => void copyText(buildSetupUrl(r.data!))}
                        className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-white"
                      >
                        コピー
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    有効期限: {new Date(r.data.setupTokenExpiresAt).toLocaleString("ja-JP")}
                  </p>
                </div>
              ) : (
                <div key={r.employeeNumber} className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
                  <span className="font-mono">{r.employeeNumber}</span> — {r.error}
                </div>
              )
            )}
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
