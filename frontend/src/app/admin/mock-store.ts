"use client";

import {
  mockAnnouncements,
  mockDeptNotices,
  mockEmployees,
  mockGroups,
  mockLeaveRequests,
  type DeptNotice,
  type Employee,
  type Group,
  type InternalAnnouncement,
  type LeaveRequest,
} from "./mock-data";

export type IssuedAccount = {
  username: string;
  setupToken: string;
  setupTokenExpiresAt: string;
};

export type CompanySettings = {
  companyName: string;
  companyEmail: string;
  companyAddress: string;
};

const ADMIN_SESSION_KEY = "admin_token";
const DEMO_TOKEN = "mock-admin-token";

const EMPLOYEES_KEY = "mock_admin_employees";
const GROUPS_KEY = "mock_admin_groups";
const LEAVES_KEY = "mock_admin_leaves";
const ANNOUNCEMENTS_KEY = "mock_admin_announcements";
const DEPT_NOTICES_KEY = "mock_admin_dept_notices";
const ISSUED_ACCOUNTS_KEY = "mock_admin_issued_accounts";
const COMPANY_SETTINGS_KEY = "mock_admin_company_settings";

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: "株式会社マウンテン",
  companyEmail: "info@for-mountain.co.jp",
  companyAddress: "東京都千代田区岩本町2-13-6 リアライズ岩本町ビル 5F",
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readList<T>(key: string, fallback: T[]): T[] {
  if (!canUseStorage()) return clone(fallback);

  const raw = window.localStorage.getItem(key);
  if (!raw) return clone(fallback);

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return clone(fallback);
  }
}

function writeList<T>(key: string, value: T[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function setMockAdminSession() {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, DEMO_TOKEN);
}

export function isMockAdminSession(token: string | null | undefined) {
  return token === DEMO_TOKEN;
}

export function getEmployees() {
  return readList<Employee>(EMPLOYEES_KEY, mockEmployees);
}

export function createMockEmployee(data: Omit<Employee, "id">) {
  const employees = getEmployees();
  const created: Employee = { ...data, id: nextId(employees) };
  const next = [...employees, created];
  writeList(EMPLOYEES_KEY, next);
  return created;
}

export function updateMockEmployee(id: number, data: Partial<Omit<Employee, "id">>) {
  const employees = getEmployees();
  let updated: Employee | null = null;
  const next = employees.map((employee) => {
    if (employee.id !== id) return employee;
    updated = { ...employee, ...data };
    return updated;
  });
  writeList(EMPLOYEES_KEY, next);
  return updated;
}

export function getGroups() {
  return readList<Group>(GROUPS_KEY, mockGroups);
}

export function createMockGroup(data: Omit<Group, "id" | "leaderName">) {
  const groups = getGroups();
  const employees = getEmployees();
  const leader = employees.find((employee) => employee.id === data.leaderId);
  const created: Group = {
    ...data,
    id: nextId(groups),
    leaderName: leader?.name ?? "未設定",
  };
  const next = [...groups, created];
  writeList(GROUPS_KEY, next);
  return created;
}

export function updateMockGroup(
  id: number,
  data: Omit<Group, "id" | "leaderName">
) {
  const groups = getGroups();
  const employees = getEmployees();
  const leader = employees.find((employee) => employee.id === data.leaderId);
  let updated: Group | null = null;
  const next = groups.map((group) => {
    if (group.id !== id) return group;
    updated = {
      ...group,
      ...data,
      leaderName: leader?.name ?? "未設定",
    };
    return updated;
  });
  writeList(GROUPS_KEY, next);
  return updated;
}

export function deleteMockGroup(id: number) {
  const next = getGroups().filter((group) => group.id !== id);
  writeList(GROUPS_KEY, next);
}

export function getLeaves() {
  return readList<LeaveRequest>(LEAVES_KEY, mockLeaveRequests);
}

export function createMockLeave(data: {
  employeeId: number;
  leaveType: LeaveRequest["leaveType"];
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}) {
  const leaves = getLeaves();
  const employee = getEmployees().find((item) => item.id === data.employeeId);
  if (!employee) {
    throw new Error("社員情報が見つかりません。");
  }

  const created: LeaveRequest = {
    id: nextId(leaves),
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    leaveType: data.leaveType,
    startDate: data.startDate,
    endDate: data.endDate,
    days: data.days,
    reason: data.reason,
    status: "待機中",
    appliedAt: new Date().toISOString().slice(0, 10),
  };
  const next = [created, ...leaves];
  writeList(LEAVES_KEY, next);
  return created;
}

export function updateMockLeaveStatus(id: number, status: LeaveRequest["status"]) {
  const leaves = getLeaves();
  let updated: LeaveRequest | null = null;
  const next = leaves.map((leave) => {
    if (leave.id !== id) return leave;
    updated = { ...leave, status };
    return updated;
  });
  writeList(LEAVES_KEY, next);
  return updated;
}

export function getAnnouncements() {
  return readList<InternalAnnouncement>(ANNOUNCEMENTS_KEY, mockAnnouncements);
}

export function createMockAnnouncement(
  data: Omit<InternalAnnouncement, "id" | "createdAt">
) {
  const announcements = getAnnouncements();
  const created: InternalAnnouncement = {
    ...data,
    id: nextId(announcements),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const next = [created, ...announcements];
  writeList(ANNOUNCEMENTS_KEY, next);
  return created;
}

export function updateMockAnnouncement(
  id: number,
  data: Omit<InternalAnnouncement, "id" | "createdAt">
) {
  const announcements = getAnnouncements();
  let updated: InternalAnnouncement | null = null;
  const next = announcements.map((announcement) => {
    if (announcement.id !== id) return announcement;
    updated = { ...announcement, ...data };
    return updated;
  });
  writeList(ANNOUNCEMENTS_KEY, next);
  return updated;
}

export function deleteMockAnnouncement(id: number) {
  const next = getAnnouncements().filter((announcement) => announcement.id !== id);
  writeList(ANNOUNCEMENTS_KEY, next);
}

export function getDeptNotices() {
  return readList<DeptNotice>(DEPT_NOTICES_KEY, mockDeptNotices);
}

export function createMockDeptNotice(
  data: Omit<DeptNotice, "id" | "createdAt">
) {
  const notices = getDeptNotices();
  const created: DeptNotice = {
    ...data,
    id: nextId(notices),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const next = [created, ...notices];
  writeList(DEPT_NOTICES_KEY, next);
  return created;
}

export function updateMockDeptNotice(
  id: number,
  data: Omit<DeptNotice, "id" | "createdAt">
) {
  const notices = getDeptNotices();
  let updated: DeptNotice | null = null;
  const next = notices.map((notice) => {
    if (notice.id !== id) return notice;
    updated = { ...notice, ...data };
    return updated;
  });
  writeList(DEPT_NOTICES_KEY, next);
  return updated;
}

export function deleteMockDeptNotice(id: number) {
  const next = getDeptNotices().filter((notice) => notice.id !== id);
  writeList(DEPT_NOTICES_KEY, next);
}

export function issueMockEmployeeAccount(employeeNumber: string): IssuedAccount {
  const username = employeeNumber.trim();
  if (!username) {
    throw new Error("社員番号を入力してください。");
  }

  const accounts = readList<IssuedAccount>(ISSUED_ACCOUNTS_KEY, []);
  const created: IssuedAccount = {
    username,
    setupToken: crypto.randomUUID().replaceAll("-", ""),
    setupTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  writeList(ISSUED_ACCOUNTS_KEY, [created, ...accounts]);
  return created;
}

export function getCompanySettings() {
  if (!canUseStorage()) return clone(DEFAULT_COMPANY_SETTINGS);

  const raw = window.localStorage.getItem(COMPANY_SETTINGS_KEY);
  if (!raw) return clone(DEFAULT_COMPANY_SETTINGS);

  try {
    return JSON.parse(raw) as CompanySettings;
  } catch {
    return clone(DEFAULT_COMPANY_SETTINGS);
  }
}

export function saveCompanySettings(settings: CompanySettings) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
}
