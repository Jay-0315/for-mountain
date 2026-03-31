"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchEmployees, fetchLeaves, fetchGroups, resolveLeaderMemberIds, type EmployeeDto } from "@/lib/api";
import { getSessionPayload, getSessionRole } from "@/lib/session";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "ダッシュボード",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/notice",
    label: "お知らせ管理",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    href: "/admin/website",
    label: "ウェブサイト管理",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 10h16M8 7h.01M12 7h.01M16 7h.01" />
      </svg>
    ),
  },
  {
    href: "/admin/leave",
    label: "休暇管理",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/mygroup",
    label: "グループ",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/groups",
    label: "グループ管理",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/employees",
    label: "社員管理",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "設定",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function PAGE_LABEL(pathname: string): string {
  if (pathname.startsWith("/admin/mypage")) return "マイページ";
  if (pathname.startsWith("/admin/mygroup")) return "グループ";
  const item = NAV_ITEMS.find((n) => pathname.startsWith(n.href));
  return item?.label ?? "管理者";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const normalizedPathname = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  const isLoginPage = normalizedPathname === "/admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeDto | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [leaderMemberIds, setLeaderMemberIds] = useState<number[] | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [todayLabel, setTodayLabel] = useState("");
  const role = getSessionRole(token);

  useEffect(() => {
    setToken(sessionStorage.getItem("admin_token"));
    setTodayLabel(new Date().toLocaleDateString("ja-JP"));
  }, []);

  useEffect(() => {
    if (!token && !isLoginPage) {
      router.replace(`/admin?redirect=${encodeURIComponent(normalizedPathname)}`);
      return;
    }
  }, [isLoginPage, normalizedPathname, router, token]);

  useEffect(() => {
    if (isLoginPage) return;
    const { sub } = getSessionPayload(token);
    if (!sub) return;

    Promise.all([fetchEmployees(), fetchGroups(), fetchLeaves(undefined, token ?? "")])
      .then(([employees, groups, leaves]) => {
        const emp = employees.find((e) => e.employeeNumber === sub) ?? null;
        setCurrentEmployee(emp);
        const memberIds = emp ? resolveLeaderMemberIds(groups, emp.id) : null;
        setLeaderMemberIds(memberIds);

        const pending = leaves.filter((l) => l.status === "待機中");
        if (memberIds !== null) {
          setPendingCount(pending.filter((l) => memberIds.includes(l.employeeId)).length);
        } else if (role === "ADMIN") {
          setPendingCount(pending.length);
        } else if (emp) {
          setPendingCount(pending.filter((l) => l.employeeId === emp.id).length);
        }
      })
      .catch(() => {
        setCurrentEmployee(null);
        setLeaderMemberIds(null);
      });
  }, [isLoginPage, role, token]);

  // 로그인 페이지는 레이아웃 없이 그냥 렌더링
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  // 그룹장 여부 (leaderMemberIds=undefined면 아직 로딩중)
  const isLeader = leaderMemberIds !== null && leaderMemberIds !== undefined;
  const isTrueAdmin = role === "ADMIN" && !isLeader;

  // 진짜 ADMIN만: 웹사이트관리
  const SUPER_ADMIN_ONLY = ["/admin/website"];
  // ADMIN 또는 그룹장: 그룹관리, 사원관리, 설정
  const ADMIN_OR_LEADER = ["/admin/groups", "/admin/employees", "/admin/settings"];
  // 일반 USER만: 그룹(mygroup)
  const USER_ONLY_MENUS = ["/admin/mygroup"];

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (role === null) {
      return !SUPER_ADMIN_ONLY.includes(item.href) && !ADMIN_OR_LEADER.includes(item.href) && !USER_ONLY_MENUS.includes(item.href);
    }
    if (leaderMemberIds === undefined && SUPER_ADMIN_ONLY.includes(item.href)) {
      return false;
    }
    if (SUPER_ADMIN_ONLY.includes(item.href)) return isTrueAdmin;
    if (ADMIN_OR_LEADER.includes(item.href)) return role === "ADMIN";
    if (USER_ONLY_MENUS.includes(item.href)) return role !== "ADMIN";
    return true;
  });

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* 상단 오렌지 액센트 바 */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shrink-0" />
        {/* 로고 */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <Image
                src="/mountain-logo.png"
                alt="株式会社マウンテン symbol"
                width={34}
                height={34}
                className="object-contain shrink-0 w-[34px] h-[34px]"
                priority
            />
            <div>
              <p className="text-white font-bold text-sm leading-tight">MOUNTAIN</p>
              <p className="text-slate-400 text-xs">管理システム</p>
            </div>
          </Link>
        </div>

        {/* 네비 */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const active = normalizedPathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md shadow-orange-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.href === "/admin/leave" && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="px-3 py-4 border-t border-slate-700/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                       text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ログアウト
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* 헤더 */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 햄버거 (모바일) */}
              <button
                className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-base font-semibold text-slate-900">
                {PAGE_LABEL(pathname)}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500 font-mono">
                  {todayLabel}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  {currentEmployee ? `今日もお疲れ様です ${currentEmployee.name}さん` : "今日もお疲れ様です"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin/mypage")}
                className="admin-btn-primary rounded-xl px-3 py-1.5 text-xs"
              >
                マイページ
              </button>
            </div>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-100/80">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
