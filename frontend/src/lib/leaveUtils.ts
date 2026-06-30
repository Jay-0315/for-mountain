/** 부여 일수 시퀀스 (index = a차수, 상한 20일) */
const GRANT_SCHEDULE = [10, 11, 12, 14, 16, 18, 20] as const;
const BALANCE_DEDUCTING_LEAVE_TYPES = new Set(["有給", "午前給(有給)", "午後給(有給)", "代休"]);


function getGrantDays(a: number): number {
  return GRANT_SCHEDULE[Math.min(a, GRANT_SCHEDULE.length - 1)];
}

type GrantEvent = { date: Date; days: number };

function addMonthsTo(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

function addYearsTo(d: Date, years: number): Date {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + years);
  return r;
}

/**
 * 입사일 기준 부여 이벤트 목록(시간순).
 *  - 입사일: +5일, 입사 6개월: +5일 (초기 10일)
 *  - 입사 N주년(N≥1): +11 / +12 / +14 / +16 / +18 / +20일
 */
function buildGrantEvents(join: Date, maxYears = 60): GrantEvent[] {
  const events: GrantEvent[] = [
    { date: new Date(join), days: 5 },
    { date: addMonthsTo(join, 6), days: 5 },
  ];
  for (let n = 1; n <= maxYears; n++) {
    events.push({ date: addYearsTo(join, n), days: getGrantDays(n) });
  }
  return events;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type LeavePool = {
  grantDate:     Date;   // 부여일
  expiryDate:    Date;   // 만료일 (grantDate + 2년)
  grantDays:     number; // 이번 부여 일수
  usedDays:      number; // 소진된 일수
  remainingDays: number; // 잔여 일수
};

export type NextGrant = {
  date:      Date;
  days:      number;
  daysUntil: number; // 오늘부터 부여일까지 남은 일수
};

export function requiresLeaveBalance(leaveType: string | null | undefined): boolean {
  return BALANCE_DEDUCTING_LEAVE_TYPES.has(leaveType?.trim() ?? "");
}

// ─────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────

/**
 * 입사일과 승인된 휴가 목록을 받아 현재 활성 휴가 풀 목록을 반환합니다.
 *
 * 규칙:
 *  - 입사일 +5일, 입사 6개월 +5일 (초기 10일)
 *  - 입사 N주년마다 +11/12/14/16/18/20일 (만료 = 각 부여일 + 2년)
 *  - FIFO 차감: 부여일이 오래된 풀부터 소진
 *  - 잔여일수 > 0 인 풀만 반환
 */
export function calcLeavePools(
  joinDateStr: string,
  approvedLeaves: { leaveType?: string | null; startDate: string; days: number }[],
  today = new Date()
): LeavePool[] {
  const join = new Date(joinDateStr);

  // 부여일이 지났고(부여됨) 아직 만료되지 않은 풀만 생성 (시간순)
  const pools: LeavePool[] = buildGrantEvents(join)
    .filter((e) => e.date <= today)
    .map((e) => ({
      grantDate:     e.date,
      expiryDate:    addYearsTo(e.date, 2),
      grantDays:     e.days,
      usedDays:      0,
      remainingDays: e.days,
    }))
    .filter((p) => p.expiryDate > today);

  // FIFO 차감: 승인 휴가를 startDate 오름차순으로 정렬 후 가장 오래된 풀부터 차감
  const sorted = approvedLeaves
    .filter((leave) => requiresLeaveBalance(leave.leaveType))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  for (const leave of sorted) {
    let daysLeft = leave.days;
    for (const pool of pools) {
      if (daysLeft <= 0) break;
      // 이 풀의 유효 기간 내에 해당하는 휴가만 차감
      if (
        leave.startDate >= formatDateStr(pool.grantDate) &&
        leave.startDate < formatDateStr(pool.expiryDate) &&
        pool.remainingDays > 0
      ) {
        const deduct = Math.min(daysLeft, pool.remainingDays);
        pool.usedDays      += deduct;
        pool.remainingDays -= deduct;
        daysLeft           -= deduct;
      }
    }
  }

  // 잔여일수 > 0 인 풀만 반환
  return pools.filter((p) => p.remainingDays > 0);
}

/**
 * 다음 휴가 부여 정보를 반환합니다 (모든 직원 대상).
 * 입사일 기준 부여 이벤트(입사일·6개월·매 주년) 중 오늘 이후 가장 가까운 것.
 */
export function calcNextGrant(
  joinDateStr: string,
  today = new Date()
): NextGrant {
  const join = new Date(joinDateStr);
  const events = buildGrantEvents(join);
  const next = events.find((e) => e.date > today) ?? events[events.length - 1];

  return {
    date:      next.date,
    days:      next.days,
    daysUntil: daysBetween(today, next.date),
  };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Date → "YYYY-MM-DD" 문자열 */
export function formatDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Date → "YYYY.MM.DD" 표시용 문자열 */
export function formatDateDisplay(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 두 날짜 간 일수 차이 (양수, 올림) */
export function daysBetween(a: Date, b: Date): number {
  return Math.ceil(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
