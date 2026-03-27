"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelLeave,
  fetchEmployees,
  fetchLeaves,
  type EmployeeDto,
  type LeaveDto,
  updateLeaveStatus,
} from "@/lib/api";
import { getSessionPayload, getSessionRole } from "@/lib/session";

const STATUS_COLOR: Record<string, string> = {
  待機中: "bg-yellow-100 text-yellow-700",
  承認: "bg-green-100 text-green-700",
  拒否: "bg-red-100 text-red-600",
};
const CANCELLABLE_STATUSES = new Set<LeaveDto["status"]>(["待機中", "拒否"]);

export default function LeaveDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leaveId = Number(params.id);
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leave, setLeave] = useState<LeaveDto | null>(null);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token") ?? "";
    setToken(t);
    setIsAdmin(getSessionRole(t) === "ADMIN");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [leaves, employees] = await Promise.all([fetchLeaves(undefined, token), fetchEmployees()]);
      setEmployees(employees);
      setLeave(leaves.find((item) => item.id === leaveId) ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "休暇詳細を読み込めませんでした。");
    } finally {
      setLoading(false);
    }
  }, [leaveId]);

  useEffect(() => {
    if (Number.isNaN(leaveId)) {
      setError("正しい休暇番号ではありません。");
      setLoading(false);
      return;
    }
    load();
  }, [leaveId, load]);

  const currentEmployee = useMemo(
    () => employees.find((employee) => employee.employeeNumber === getSessionPayload(token).sub) ?? null,
    [employees, token]
  );

  const isOwnCancellableLeave = Boolean(
    leave && currentEmployee && leave.employeeId === currentEmployee.id && CANCELLABLE_STATUSES.has(leave.status)
  );

  useEffect(() => {
    if (!leave || isAdmin) return;
    if (!currentEmployee || leave.employeeId !== currentEmployee.id) {
      setError("本人の休暇申請のみ閲覧できます。");
    }
  }, [currentEmployee, isAdmin, leave]);

  const handleStatusUpdate = async (status: LeaveDto["status"]) => {
    if (!leave) return;
    try {
      const updated = await updateLeaveStatus(token, leave.id, status);
      setLeave(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "状態変更に失敗しました。");
    }
  };

  const handleReset = async () => {
    if (!leave || !confirm("この休暇申請を待機中に戻しますか？")) return;
    await handleStatusUpdate("待機中");
  };

  const handleCancel = async () => {
    if (!leave || !confirm("この休暇申請を取り消しますか？")) return;
    try {
      await cancelLeave(token, leave.id);
      router.push("/admin/leave");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "休暇の取消に失敗しました。");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="h-7 w-7 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl space-y-4">
        <Link href="/admin/leave" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          休暇管理へ戻る
        </Link>
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="max-w-4xl space-y-4">
        <Link href="/admin/leave" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          休暇管理へ戻る
        </Link>
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-10 text-center text-sm text-slate-400">
          該当する休暇申請がありません。
        </div>
      </div>
    );
  }

  if (!isAdmin && leave.employeeId !== currentEmployee?.id) {
    return (
      <div className="max-w-4xl space-y-4">
        <Link href="/admin/leave" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          休暇管理へ戻る
        </Link>
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          本人の休暇申請のみ閲覧できます。
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div>
          <Link href="/admin/leave" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            休暇管理へ戻る
          </Link>
          <h2 className="mt-2 text-xl font-bold text-slate-900">休暇詳細</h2>
          <p className="mt-1 text-sm text-slate-400">{leave.appliedAt} 申請</p>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {isAdmin ? (
            leave.status === "待機中" ? (
              <>
                <button onClick={() => handleStatusUpdate("拒否")} className="admin-btn-danger px-4 py-2">
                  拒否
                </button>
                <button onClick={() => handleStatusUpdate("承認")} className="admin-btn-success px-4 py-2">
                  承認
                </button>
              </>
            ) : (
              <button onClick={handleReset} className="admin-btn-secondary px-4 py-2">
                待機中に戻す
              </button>
            )
          ) : isOwnCancellableLeave ? (
            <button onClick={handleCancel} className="admin-btn-danger px-4 py-2">
              申請取消
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">申請者</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{leave.employeeName}</p>
                <p className="mt-1 text-sm text-slate-400">{leave.department}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[leave.status] ?? "bg-slate-100 text-slate-500"}`}>
                {leave.status}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">申請内容</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-medium text-slate-500">休暇種類</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{leave.leaveType}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-medium text-slate-500">日数</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{leave.days}日</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-medium text-slate-500">開始日</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{leave.startDate}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-medium text-slate-500">終了日</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{leave.endDate}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">申請理由</h3>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {leave.reason.trim() ? leave.reason : "記載なし"}
          </p>
        </section>
      </div>
    </div>
  );
}
