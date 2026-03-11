"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchDeptNotices,
  fetchEmployees,
  fetchLeaves,
  type EmployeeDto,
  type LeaveDto,
} from "@/lib/api";
import { isMockAdminSession } from "../mock-store";
import { type Department, type DeptNotice } from "../mock-data";

const MANAGEMENT_JOB_TITLES = new Set(["管理職", "役員"]);
const RESTRICTED_DEPARTMENTS = new Set<string>(["開発 Part1", "開発 Part2"]);
const CALENDAR_FILTER_DEPARTMENTS: Department[] = ["開発 Part1", "開発 Part2"];
const NOTICE_PARENT_MAP: Partial<Record<Department, Department>> = {
  "技術グループ1": "技術本部",
  "技術グループ2": "技術本部",
  "開発 Part1": "技術グループ1",
  "開発 Part2": "技術グループ2",
};
const WEEK_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const LEAVE_BADGE: Record<LeaveRequest["status"], string> = {
  "待機中": "bg-yellow-100 text-yellow-700 ring-yellow-200",
  "承認": "bg-green-100 text-green-700 ring-green-200",
  "否認": "bg-red-100 text-red-600 ring-red-200",
};

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 text-left ${
        onClick ? "transition-colors hover:border-orange-200 hover:bg-orange-50/40" : ""
      }`}
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </Component>
  );
}

function StatChip({
  label,
  value,
  sub,
  color,
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3 text-left shadow-sm ${
        onClick ? "transition-colors hover:border-orange-200 hover:bg-orange-50/40" : ""
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">
          {value}
          {sub && <span className="ml-1 text-xs font-medium text-slate-400">{sub}</span>}
        </p>
      </div>
    </Component>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function formatDay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString("ja-JP", { weekday: "short" });
}

function getTodayKey() {
  return new Date().toLocaleDateString("en-CA");
}

function getWeekdayTextColor(dayIndex: number, isCurrentMonth = true) {
  if (!isCurrentMonth) return "text-slate-300";
  if (dayIndex === 0) return "text-rose-400";
  if (dayIndex === 6) return "text-emerald-400";
  return "text-slate-500";
}

function getWeekendSurface(dayIndex: number, isCurrentMonth = true) {
  if (!isCurrentMonth) return "bg-slate-50/60";
  if (dayIndex === 0) return "bg-red-50/60";
  if (dayIndex === 6) return "bg-green-50/60";
  return "bg-white";
}

function chunkDays<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function parseJwtPayload(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(decoded) as { sub?: string; role?: string };
  } catch {
    return null;
  }
}

function resolveViewer(employees: EmployeeDto[]) {
  if (typeof window === "undefined") {
    return { employee: null as Employee | null, canViewAll: true, tokenRole: "ADMIN", subject: null as string | null };
  }

  const token = window.sessionStorage.getItem("admin_token");
  if (!token) {
    return { employee: null as Employee | null, canViewAll: false, tokenRole: null as string | null, subject: null as string | null };
  }

  if (isMockAdminSession(token)) {
    return { employee: null as Employee | null, canViewAll: true, tokenRole: "ADMIN", subject: "demo" };
  }

  const payload = parseJwtPayload(token);
  const subject = payload?.sub ?? null;
  const tokenRole = payload?.role ?? null;
  const employee = employees.find((item) => item.employeeNumber === subject) ?? null;
  const canViewAll =
    tokenRole === "ADMIN" ||
    Boolean(
      employee &&
      (MANAGEMENT_JOB_TITLES.has(employee.jobTitle) || !RESTRICTED_DEPARTMENTS.has(employee.department))
    );

  return { employee, canViewAll, tokenRole, subject };
}

function buildCalendarDays(baseMonth: Date) {
  const monthStart = startOfMonth(baseMonth);
  const monthEnd = endOfMonth(baseMonth);
  const start = new Date(monthStart);
  start.setDate(monthStart.getDate() - monthStart.getDay());
  const end = new Date(monthEnd);
  end.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function leaveIncludesDate(leave: LeaveRequest, dateKey: string) {
  return leave.startDate <= dateKey && leave.endDate >= dateKey;
}

function getVisibleNoticeDepartments(department: Department | null | undefined) {
  if (!department) return [] as Department[];

  const result: Department[] = [];
  let current: Department | undefined = department;
  while (current) {
    result.push(current);
    current = NOTICE_PARENT_MAP[current];
  }
  return result;
}

function CalendarDetailModal({
  day,
  birthdays,
  leaves,
  onClose,
  onApplyLeave,
}: {
  day: Date;
  birthdays: EmployeeDto[];
  leaves: LeaveDto[];
  onClose: () => void;
  onApplyLeave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {formatDay(day).replaceAll("-", ".")} ({formatWeekday(day)})
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              誕生日 {birthdays.length}名 · 休暇 {leaves.length}件
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">誕生日</h4>
            {birthdays.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">該当者なし</p>
            ) : (
              <div className="mt-3 space-y-2">
                {birthdays.map((employee) => (
                  <div key={employee.id} className="rounded-xl bg-pink-50 px-4 py-3 text-sm text-pink-700 ring-1 ring-pink-200">
                    <p className="font-semibold">{employee.name}</p>
                    <p className="mt-1 text-xs">{employee.department} / {employee.position}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">休暇予定</h4>
            {leaves.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">該当予定なし</p>
            ) : (
              <div className="mt-3 space-y-2">
                {leaves.map((leave) => (
                  <div
                    key={`${leave.id}-${leave.startDate}`}
                    className={`rounded-xl px-4 py-3 text-sm ring-1 ${LEAVE_BADGE[leave.status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}
                  >
                    <p className="font-semibold">{leave.employeeName}</p>
                    <p className="mt-1 text-xs">
                      {leave.department} · {leave.leaveType} · {leave.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="admin-btn-secondary px-4 py-2">
            閉じる
          </button>
          <button onClick={onApplyLeave} className="admin-btn-primary px-4 py-2">
            休暇申請へ
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryDetailModal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="admin-btn-secondary px-4 py-2">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const todayKey = getTodayKey();
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [deptNotices, setDeptNotices] = useState<DeptNotice[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [leaves, setLeaves] = useState<LeaveDto[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [departmentFilter, setDepartmentFilter] = useState<Department | "全部門">("全部門");
  const [mobileWeekIndex, setMobileWeekIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [summaryModal, setSummaryModal] = useState<"birthdays" | "pendingLeaves" | null>(null);

  useEffect(() => {
    fetchDeptNotices()
      .then((items) => setDeptNotices(items as DeptNotice[]))
      .catch(() => setDeptNotices([]));
  }, []);
  useEffect(() => {
    Promise.all([
      fetchEmployees().catch(() => [] as EmployeeDto[]),
      fetchLeaves().catch(() => [] as LeaveDto[]),
    ])
      .then(([employees, leaves]) => {
        setEmployees(employees);
        setLeaves(leaves);
      })
      .finally(() => setLoadingPeople(false));
  }, []);
  const viewer = useMemo(() => resolveViewer(employees), [employees]);

  const pendingLeavesForViewer = leaves.filter((leave) => {
    if (leave.status !== "待機中") return false;
    if (viewer.canViewAll) return true;
    return leave.employeeId === viewer.employee?.id;
  });
  const pendingLeave = pendingLeavesForViewer.length;
  const effectiveDepartment = viewer.canViewAll
    ? departmentFilter === "全部門"
      ? "全部門"
      : departmentFilter
    : viewer.employee?.department ?? "全部門";

  const visibleLeaves = leaves.filter((leave) => {
    if (effectiveDepartment === "全部門") return true;
    return leave.department === effectiveDepartment;
  });

  const monthDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const monthWeeks = useMemo(() => chunkDays(monthDays, 7), [monthDays]);
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthLeaves = visibleLeaves.filter((leave) => leave.startDate.slice(0, 7) <= monthKey && leave.endDate.slice(0, 7) >= monthKey);
  const approvedCount = monthLeaves.filter((leave) => leave.status === "承認").length;
  const monthBirthdays = useMemo(() => {
    const targetMonth = currentMonth.getMonth() + 1;
    return employees
      .filter((employee) => {
        const birthDate = new Date(employee.birthDate);
        return !Number.isNaN(birthDate.getTime()) && birthDate.getMonth() + 1 === targetMonth;
      })
      .sort((a, b) => {
        const dayDiff = new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate();
        if (dayDiff !== 0) return dayDiff;
        return a.name.localeCompare(b.name, "ja");
      });
  }, [currentMonth, employees]);
  const visibleDeptNotices = useMemo(() => {
    const allowedDepartments = viewer.canViewAll
      ? effectiveDepartment === "全部門"
        ? null
        : new Set<Department | "全部署">([effectiveDepartment, "全部署"])
      : new Set<Department>(getVisibleNoticeDepartments(viewer.employee?.department as Department | undefined));

    const filtered = deptNotices.filter((notice) => (allowedDepartments ? allowedDepartments.has(notice.department) : true));
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  }, [deptNotices, effectiveDepartment, viewer.canViewAll, viewer.employee]);
  const selectedDayKey = selectedDay ? formatDay(selectedDay) : null;
  const selectedDayLeaves = selectedDayKey
    ? visibleLeaves.filter((leave) => leaveIncludesDate(leave, selectedDayKey))
    : [];
  const selectedDayBirthdays = selectedDay
    ? employees.filter((employee) => {
        const birthDate = new Date(employee.birthDate);
        return !Number.isNaN(birthDate.getTime()) && birthDate.getMonth() === selectedDay.getMonth() && birthDate.getDate() === selectedDay.getDate();
      })
    : [];

  return (
    <div className="space-y-6 max-w-6xl">
      {selectedDay && (
        <CalendarDetailModal
          day={selectedDay}
          birthdays={selectedDayBirthdays}
          leaves={selectedDayLeaves}
          onClose={() => setSelectedDay(null)}
          onApplyLeave={() => {
            const dayKey = formatDay(selectedDay);
            setSelectedDay(null);
            router.push(`/admin/leave?view=apply&startDate=${dayKey}&endDate=${dayKey}`);
          }}
        />
      )}
      {summaryModal === "birthdays" && (
        <SummaryDetailModal
          title="今月の誕生日"
          subtitle={`${currentMonth.toLocaleDateString("ja-JP", { month: "long" })} の生誕者一覧`}
          onClose={() => setSummaryModal(null)}
        >
          {monthBirthdays.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">今月の誕生日者はいません。</p>
          ) : (
            <div className="space-y-2">
              {monthBirthdays.map((employee) => (
                <div key={`birthday-summary-${employee.id}`} className="flex items-center gap-3 rounded-xl bg-pink-50 px-4 py-3 ring-1 ring-pink-200">
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-pink-600">
                    {new Date(employee.birthDate).getDate()}日
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{employee.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{employee.department} / {employee.position}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SummaryDetailModal>
      )}
      {summaryModal === "pendingLeaves" && (
        <SummaryDetailModal
          title="未承認の休暇申請"
          subtitle={viewer.canViewAll ? "全体の待機中申請一覧" : "本人の待機中申請一覧"}
          onClose={() => setSummaryModal(null)}
        >
          {pendingLeavesForViewer.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">表示する待機中の休暇申請がありません。</p>
          ) : (
            <div className="space-y-2">
              {pendingLeavesForViewer.map((leave) => (
                <button
                  key={`pending-summary-${leave.id}`}
                  type="button"
                  onClick={() => {
                    setSummaryModal(null);
                    router.push(`/admin/leave/${leave.id}`);
                  }}
                  className="w-full rounded-xl bg-green-50 px-4 py-3 text-left ring-1 ring-green-200 transition-colors hover:bg-green-100/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{leave.employeeName}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {viewer.canViewAll ? `${leave.department} · ` : ""}
                        {leave.leaveType} · {leave.startDate}
                        {leave.startDate !== leave.endDate ? ` ~ ${leave.endDate}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-green-600">
                      待機中
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SummaryDetailModal>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900">ダッシュボード</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <StatChip
          label="未承認の休暇申請"
          value={loadingPeople ? "-" : pendingLeave}
          sub="件"
          color="bg-green-50"
          onClick={() => !loadingPeople && setSummaryModal("pendingLeaves")}
          icon={
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatChip
          label="今月の誕生日"
          value={loadingPeople ? "-" : monthBirthdays.length}
          sub="名"
          color="bg-pink-50"
          onClick={() => !loadingPeople && setSummaryModal("birthdays")}
          icon={
            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v8m-4-4h8m1-7H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2z" />
            </svg>
          }
        />
      </div>

      <div className="hidden gap-4 sm:grid sm:grid-cols-2">
        <StatCard
          label="未承認の休暇申請"
          value={loadingPeople ? "-" : pendingLeave}
          sub="件"
          color="bg-green-50"
          onClick={() => !loadingPeople && setSummaryModal("pendingLeaves")}
          icon={
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="今月の誕生日"
          value={loadingPeople ? "-" : monthBirthdays.length}
          sub="名"
          color="bg-pink-50"
          onClick={() => !loadingPeople && setSummaryModal("birthdays")}
          icon={
            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v8m-4-4h8m1-7H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2z" />
            </svg>
          }
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">休暇カレンダー</h3>
            <p className="mt-1 text-xs text-slate-400">
              {viewer.canViewAll
                ? "開発 Part1・Part2 외 인원은 전체 휴가 일정을 확인할 수 있습니다."
                : `${viewer.employee?.department ?? "所属部門"} の休暇予定のみ表示します。`}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentMonth((prev) => addMonths(prev, -1));
                  setMobileWeekIndex(0);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 text-orange-500 transition-colors hover:border-orange-300 hover:bg-orange-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-32 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  {currentMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentMonth((prev) => addMonths(prev, 1));
                  setMobileWeekIndex(0);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 text-orange-500 transition-colors hover:border-orange-300 hover:bg-orange-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {viewer.canViewAll && (
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {(["全部門", ...CALENDAR_FILTER_DEPARTMENTS] as const).map((department) => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => setDepartmentFilter(department)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      departmentFilter === department
                        ? "admin-pill-active"
                        : "admin-pill"
                    }`}
                  >
                    {department}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">
            {viewer.canViewAll
              ? effectiveDepartment === "全部門"
                ? "全パート表示"
                : `${effectiveDepartment} 表示`
              : `${viewer.employee?.department ?? "所属部門"} 表示`}
          </span>
          <span>当月休暇 {monthLeaves.length}件</span>
          <span>承認済み {approvedCount}件</span>
          <span>誕生日 {monthBirthdays.length}名</span>
        </div>

        <div className="hidden sm:grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {WEEK_LABELS.map((label, index) => (
            <div key={label} className={`px-3 py-2 text-center text-sm font-semibold ${getWeekdayTextColor(index)}`}>
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 sm:hidden">
          {viewer.tokenRole === "ADMIN" ? (
            <div className="col-span-3 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setMobileWeekIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={mobileWeekIndex === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 bg-white text-orange-500 disabled:border-slate-100 disabled:text-slate-300"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <p className="text-base font-semibold text-slate-700">
                  {mobileWeekIndex + 1} / {monthWeeks.length} 週
                </p>
                <button
                  type="button"
                  onClick={() => setMobileWeekIndex((prev) => Math.min(prev + 1, monthWeeks.length - 1))}
                  disabled={mobileWeekIndex === monthWeeks.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 bg-white text-orange-500 disabled:border-slate-100 disabled:text-slate-300"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {monthWeeks
                .filter((_, weekIndex) => weekIndex === mobileWeekIndex)
                .map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                    {week.map((day) => {
                      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                      return (
                        <div key={`week-head-${formatDay(day)}`} className="px-2 py-3.5 text-center">
                          <p className={`text-[15px] font-semibold ${getWeekdayTextColor(day.getDay(), isCurrentMonth)}`}>
                            {formatWeekday(day)}
                          </p>
                          <p className={`mt-1 text-lg font-bold ${isCurrentMonth ? "text-slate-900" : "text-slate-300"}`}>
                            {day.getDate()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {week.map((day) => {
                      const dayKey = formatDay(day);
                      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                      const isPastDay = dayKey < todayKey;
                      const dayLeaves = visibleLeaves.filter((leave) => leaveIncludesDate(leave, dayKey));
                      const dayBirthdays = employees.filter((employee) => {
                        const birthDate = new Date(employee.birthDate);
                        return !Number.isNaN(birthDate.getTime()) && birthDate.getMonth() === day.getMonth() && birthDate.getDate() === day.getDate();
                      });

                      if (!isCurrentMonth) {
                        return null;
                      }

                      return (
                        <button
                          key={`week-body-${dayKey}`}
                          type="button"
                          onClick={() => !isPastDay && setSelectedDay(day)}
                          disabled={isPastDay}
                          className={`w-full px-3 py-4.5 text-left transition-colors ${
                            isPastDay
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : `hover:bg-orange-50/40 ${getWeekendSurface(day.getDay(), isCurrentMonth)}`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`text-lg font-semibold ${isPastDay ? "text-slate-400" : "text-slate-900"}`}>
                              {day.getDate()}日 <span className={isPastDay ? "text-slate-300" : getWeekdayTextColor(day.getDay())}>({formatWeekday(day)})</span>
                            </p>
                            <p className="text-base text-slate-400">
                              誕生日 {dayBirthdays.length}名 · 休暇 {dayLeaves.length}件
                            </p>
                          </div>
                          <div className="mt-2 space-y-1.5">
                            {dayBirthdays.slice(0, 2).map((employee) => (
                              <div
                                key={`admin-mobile-birthday-${employee.id}-${dayKey}`}
                                className={`rounded-lg px-3 py-3.5 text-base ring-1 ${
                                  isPastDay
                                    ? "bg-slate-50 text-slate-400 ring-slate-200"
                                    : "bg-pink-50 text-pink-700 ring-pink-200"
                                }`}
                              >
                                <p className="truncate font-semibold">{employee.name}</p>
                              </div>
                            ))}
                            {dayLeaves.slice(0, 2).map((leave) => (
                              <div
                                key={`admin-mobile-leave-${leave.id}-${dayKey}`}
                                className={`rounded-lg px-3 py-3.5 text-base ring-1 ${
                                  isPastDay ? "bg-slate-50 text-slate-400 ring-slate-200" : LEAVE_BADGE[leave.status]
                                }`}
                              >
                                <p className="truncate font-semibold">{leave.employeeName}</p>
                              </div>
                            ))}
                            {dayBirthdays.length === 0 && dayLeaves.length === 0 && (
                              <p className="rounded-lg bg-slate-50 px-3 py-3.5 text-base text-slate-400">予定なし</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            monthDays
              .filter((day) => day.getMonth() === currentMonth.getMonth())
              .map((day) => {
                const dayKey = formatDay(day);
                const isPastDay = dayKey < todayKey;
                const dayLeaves = visibleLeaves.filter((leave) => leaveIncludesDate(leave, dayKey));
                const dayBirthdays = employees.filter((employee) => {
                  const birthDate = new Date(employee.birthDate);
                  return !Number.isNaN(birthDate.getTime()) && birthDate.getMonth() === day.getMonth() && birthDate.getDate() === day.getDate();
                });
                const eventCount = dayBirthdays.length + dayLeaves.length;

                return (
                  <button
                    key={`mobile-${dayKey}`}
                    type="button"
                    onClick={() => !isPastDay && setSelectedDay(day)}
                    disabled={isPastDay}
                    className={`rounded-2xl border border-slate-100 p-2.5 text-left transition-colors ${
                      isPastDay
                        ? "cursor-not-allowed bg-slate-100"
                        : `hover:border-orange-200 hover:bg-orange-50/40 ${getWeekendSurface(day.getDay())}`
                    }`}
                  >
                    <div className="relative min-h-[64px]">
                      <div className="pr-14">
                        <p className={`flex h-5 items-center text-base font-semibold ${isPastDay ? "text-slate-400" : "text-slate-900"}`}>
                          <span className="inline-flex w-6 justify-end tabular-nums">
                            {day.getDate()}
                          </span>
                          <span className="ml-0.5">日</span>
                        </p>
                        <p className={`mt-1 flex h-4 items-center text-xs font-medium ${isPastDay ? "text-slate-300" : getWeekdayTextColor(day.getDay())}`}>{formatWeekday(day)}</p>
                      </div>
                      <div className="absolute bottom-0 right-0 flex flex-col items-end gap-1">
                        {eventCount > 0 ? (
                          <>
                            <span className={`inline-flex min-w-[38px] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                              isPastDay
                                ? "bg-slate-50 text-slate-400 ring-slate-200"
                                : "bg-orange-50 text-orange-600 ring-orange-200"
                            }`}>
                              休 {dayLeaves.length}
                            </span>
                            <span className={`inline-flex min-w-[38px] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                              isPastDay
                                ? "bg-slate-50 text-slate-400 ring-slate-200"
                                : "bg-pink-50 text-pink-600 ring-pink-200"
                            }`}>
                              E {dayBirthdays.length}
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex min-w-[38px] items-center justify-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-slate-200">
                            無し
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
          )}
        </div>

        <div className="hidden sm:grid sm:grid-cols-7">
          {monthDays.map((day) => {
            const dayKey = formatDay(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isPastDay = dayKey < todayKey;
            const dayLeaves = visibleLeaves.filter((leave) => leaveIncludesDate(leave, dayKey));
            const dayBirthdays = employees.filter((employee) => {
              const birthDate = new Date(employee.birthDate);
              return !Number.isNaN(birthDate.getTime()) && birthDate.getMonth() === day.getMonth() && birthDate.getDate() === day.getDate();
            });

            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => !isPastDay && setSelectedDay(day)}
                disabled={isPastDay}
                className={`min-h-36 border-b border-r border-slate-100 p-3 transition-colors ${
                  isPastDay
                    ? "cursor-not-allowed bg-slate-100"
                    : isCurrentMonth
                    ? `${getWeekendSurface(day.getDay(), true)} hover:bg-orange-50/40`
                    : "bg-slate-50/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isPastDay ? "text-slate-400" : isCurrentMonth ? "text-slate-900" : "text-slate-300"}`}>
                    {day.getDate()}
                  </span>
                  <div className="flex items-center gap-1">
                    {dayBirthdays.length > 0 && (
                      <span className={`text-[10px] font-semibold ${isPastDay ? "text-slate-400" : "text-pink-500"}`}>{dayBirthdays.length}人</span>
                    )}
                    {dayLeaves.length > 0 && (
                      <span className={`text-[10px] font-semibold ${isPastDay ? "text-slate-400" : "text-orange-500"}`}>{dayLeaves.length}件</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {dayBirthdays.slice(0, 2).map((employee) => (
                    <div
                      key={`birthday-${employee.id}-${dayKey}`}
                      className={`rounded-lg px-2.5 py-2 text-[11px] ring-1 transition-all duration-200 ${
                        isPastDay
                          ? "bg-slate-50 text-slate-400 ring-slate-200"
                          : "bg-pink-50 text-pink-700 ring-pink-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <p className="font-semibold truncate">{employee.name}</p>
                      <p className="mt-0.5 truncate">{employee.department}</p>
                    </div>
                  ))}
                  {dayLeaves.slice(0, 3).map((leave) => (
                    <div
                      key={`${leave.id}-${dayKey}`}
                      className={`rounded-lg px-2.5 py-2 text-[11px] ring-1 transition-all duration-200 ${
                        isPastDay
                          ? "bg-slate-50 text-slate-400 ring-slate-200"
                          : `${LEAVE_BADGE[leave.status]} hover:-translate-y-0.5`
                      }`}
                    >
                      <p className="font-semibold truncate">{leave.employeeName}</p>
                      <p className="mt-0.5 truncate">
                        {viewer.canViewAll && effectiveDepartment === "全部門" ? `${leave.department} · ` : ""}
                        {leave.leaveType}
                      </p>
                    </div>
                  ))}
                  {dayBirthdays.length > 2 && (
                    <p className={`text-[11px] font-medium ${isPastDay ? "text-slate-400" : "text-pink-400"}`}>+ {dayBirthdays.length - 2} birthday</p>
                  )}
                  {dayLeaves.length > 3 && (
                    <p className="text-[11px] font-medium text-slate-400">+ {dayLeaves.length - 3} more</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">今月の誕生日</h3>
          <span className="text-xs text-slate-400">
            {currentMonth.toLocaleDateString("ja-JP", { month: "long" })}
          </span>
        </div>
        <div className="divide-y divide-slate-50">
          {loadingPeople ? (
            <div className="px-5 py-8 text-center">
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : monthBirthdays.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">今月の誕生日者はいません。</p>
          ) : (
            monthBirthdays.map((employee) => (
              <div key={employee.id} className="px-5 py-3.5 flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full font-medium shrink-0">
                  {new Date(employee.birthDate).getDate()}日
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800 truncate font-medium">{employee.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400 truncate">{employee.department} / {employee.position}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono shrink-0">
                  {employee.birthDate.slice(5).replace("-", ".")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">部署別公知</h3>
          <a href="/admin/notice" className="text-xs text-orange-500 hover:underline font-medium">
            公知管理へ →
          </a>
        </div>
        <div className="divide-y divide-slate-50">
          {visibleDeptNotices.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">表示できる部署別公知がありません。</p>
          ) : (
            visibleDeptNotices.map((notice: DeptNotice) => (
              <a
                key={notice.id}
                href={`/admin/notice?tab=department&noticeId=${notice.id}`}
                className="block px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-semibold shrink-0">
                    {notice.department}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 truncate">{notice.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{notice.content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{notice.author}</span>
                  <span className="font-mono">{formatDay(new Date(notice.createdAt))}</span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
