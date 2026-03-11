"use client";

import { useState } from "react";
import { mockAttendance, AttendanceRecord } from "../mock-data";

type FilterPeriod = "今日" | "今週" | "今月";
type StatusFilter = "すべて" | "出勤" | "欠勤" | "半休" | "有休";

const STATUS_COLOR: Record<string, string> = {
  出勤: "bg-green-100 text-green-700",
  欠勤: "bg-red-100 text-red-600",
  半休: "bg-yellow-100 text-yellow-700",
  有休: "bg-blue-100 text-blue-700",
  休日: "bg-slate-100 text-slate-500",
};

export default function AttendancePage() {
  const [period, setPeriod] = useState<FilterPeriod>("今日");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("すべて");

  // 목업 데이터는 오늘치만 있으므로 그대로 사용
  const filtered = mockAttendance.filter((a) =>
    statusFilter === "すべて" ? true : a.status === statusFilter
  );

  const summaryCount = (status: string) =>
    mockAttendance.filter((a) => a.status === status).length;

  return (
    <div className="max-w-5xl space-y-5">
      {/* 準備中 배너 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-700">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>勤怠管理機能は現在準備中です。近日公開予定。</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">勤怠管理</h2>
        {/* 기간 필터 */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(["今日", "今週", "今月"] as FilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["出勤", "欠勤", "半休", "有休"] as const).map((status) => (
          <div key={status} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <p className={`text-2xl font-bold ${STATUS_COLOR[status].split(" ")[1]}`}>
              {summaryCount(status)}
            </p>
            <p className="text-slate-500 text-xs mt-1">{status}</p>
          </div>
        ))}
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 flex-wrap">
        {(["すべて", "出勤", "欠勤", "半休", "有休"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors
              ${statusFilter === s
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-500"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            {period} の勤怠記録 — {filtered.length} 件
          </p>
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV出力
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">氏名</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">部署</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">出勤時間</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">退勤時間</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">勤務時間</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((record: AttendanceRecord) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-slate-900 font-medium">{record.employeeName}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-slate-500 text-xs">{record.department}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm text-slate-700">
                      {record.checkIn ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm text-slate-700">
                      {record.checkOut ?? (record.status === "出勤" ? (
                        <span className="text-orange-500">勤務中</span>
                      ) : "—")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="font-mono text-sm text-slate-700">
                      {record.workHours != null ? `${record.workHours.toFixed(1)}h` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[record.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        ※ 実際のデータはバックエンド連携後に表示されます
      </p>
    </div>
  );
}
