"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchEmployees, fetchLeaves, type EmployeeDto, type LeaveDto } from "@/lib/api";
import { getSessionPayload } from "@/lib/session";
import {
  calcLeavePools,
  calcNextGrant,
  formatDateDisplay,
} from "@/lib/leaveUtils";

const STATUS_COLOR: Record<string, string> = {
  待機中: "bg-yellow-100 text-yellow-700",
  承認:   "bg-green-100 text-green-700",
  拒否:   "bg-red-100 text-red-600",
};

export default function MyPage() {
  const [employee, setEmployee] = useState<EmployeeDto | null>(null);
  const [leaves,   setLeaves]   = useState<LeaveDto[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token   = typeof window === "undefined" ? null : window.sessionStorage.getItem("admin_token");
    const subject = getSessionPayload(token).sub;

    Promise.all([fetchEmployees(), fetchLeaves()])
      .then(([employees, leaveRecords]) => {
        const currentEmployee = employees.find((e) => e.employeeNumber === subject) ?? null;
        setEmployee(currentEmployee);
        setLeaves(
          currentEmployee
            ? leaveRecords.filter((l) => l.employeeId === currentEmployee.id)
            : []
        );
      })
      .catch(() => { setEmployee(null); setLeaves([]); })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const today          = new Date();
    const approvedLeaves = leaves.filter((l) => l.status === "承認");

    const pools = employee?.joinDate
      ? calcLeavePools(employee.joinDate, approvedLeaves, today)
      : [];

    const nextGrant = employee?.joinDate
      ? calcNextGrant(employee.joinDate, today)
      : null;

    return {
      total:    leaves.length,
      pending:  leaves.filter((l) => l.status === "待機中").length,
      approved: leaves.filter((l) => l.status === "承認").length,
      pools,
      nextGrant,
    };
  }, [leaves, employee]);

  return (
    <div className="max-w-4xl space-y-6">
      {/* ── 헤더 ── */}
      <div className="rounded-2xl overflow-hidden border border-orange-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4">
          <h2 className="text-lg font-bold text-white">マイページ</h2>
          <p className="mt-0.5 text-sm text-orange-100">本人の情報と休暇申請状況を確認できます。</p>
        </div>
      </div>

      {/* ── 사원 정보 ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        {employee ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">氏名</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{employee.name}</p>
              <p className="mt-1 text-xs text-slate-400">{employee.nameKana}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">所属</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {employee.department} / {employee.position}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-400">{employee.employeeNumber}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">현재 로그인 정보와 연결된 사원 정보가 없습니다.</p>
        )}
      </div>

      {/* ── 잔여 휴가 카드 ── */}
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
        {summary.pools.length === 0 ? (
          <p className="text-sm text-slate-400">有給休暇の残日数はありません</p>
        ) : (
          <div className="space-y-5">
            {summary.pools.map((pool, i) => {
              const pct = Math.max(0, Math.min(100, (pool.remainingDays / pool.grantDays) * 100));
              const urgent = pool.remainingDays <= 3;
              return (
                <div key={i}>
                  {/* 헤더: 기한 + 잔여일수 합친 한 문장 */}
                  <p className={`text-sm font-medium ${urgent ? "text-red-600" : "text-orange-700"}`}>
                    <span className="font-bold">{formatDateDisplay(pool.expiryDate)}</span>
                    までに
                    <span className={`font-bold ${urgent ? "text-red-500" : "text-orange-500"}`}> {pool.remainingDays}日 </span>
                    消化が必要です！
                  </p>
                  {/* 큰 숫자 */}
                  <div className="mt-1 flex items-end gap-1.5">
                    <span className={`text-5xl font-bold leading-none ${urgent ? "text-red-500" : "text-orange-500"}`}>
                      {pool.remainingDays}
                    </span>
                    <span className="mb-0.5 text-base font-medium text-orange-400">
                      日 / {pool.grantDays}日
                    </span>
                  </div>
                  {/* 진행 바 */}
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
                    <div
                      className={`h-full rounded-full transition-all ${urgent ? "bg-red-400" : "bg-orange-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {/* 하단 row: 사용済み(좌) + 다음 부여(우, 마지막 풀에만) */}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-orange-500">使用済み {pool.usedDays}日</p>
                    {i === summary.pools.length - 1 && summary.nextGrant && (
                      <p className="text-xs font-semibold text-orange-400">
                        あと{summary.nextGrant.daysUntil}日で{summary.nextGrant.days}日分の休暇が増えますよ！
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 통계 카드 ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">総申請数</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">待機中</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">承認済み</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{summary.approved}</p>
        </div>
      </div>

      {/* ── 휴가 이력 테이블 ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-xs font-semibold text-slate-500">本人の休暇履歴</p>
          <Link href="/admin/leave" className="text-xs font-semibold text-orange-500 hover:underline">
            休暇管理へ
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          </div>
        ) : leaves.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">休暇申請履歴がありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">休暇種類</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">期間</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">日数</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-5 py-3.5 text-slate-700">{leave.leaveType}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {leave.startDate}{leave.startDate !== leave.endDate ? ` ~ ${leave.endDate}` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{leave.days}日</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[leave.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
