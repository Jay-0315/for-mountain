/** 부여 일수 시퀀스 (index = a차수, 상한 20일) */
const GRANT_SCHEDULE = [10, 11, 12, 14, 16, 18, 20, 22, 25, 28, 30] as const;

function getGrantDays(a: number): number {
  return GRANT_SCHEDULE[Math.min(a, GRANT_SCHEDULE.length - 1)];
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

// ─────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────

/**
 * 입사일과 승인된 휴가 목록을 받아 현재 활성 휴가 풀 목록을 반환합니다.
 *
 * 규칙:
 *  - 0~6개월 미만: 5일 preview (만료 = firstGrant + 2년)
 *  - 6개월 이후 매년: 10/11/12/14/16/18/20일 (만료 = 각 부여일 + 2년)
 *  - FIFO 차감: 만료가 가장 빠른 풀부터 소진
 *  - 잔여일수 > 0 인 풀만 반환
 */
export function calcLeavePools(
  joinDateStr: string,
  approvedLeaves: { startDate: string; days: number }[],
  today = new Date()
): LeavePool[] {
  const join = new Date(joinDateStr);

  // firstGrant = 입사 + 6개월
  const firstGrant = new Date(join);
  firstGrant.setMonth(firstGrant.getMonth() + 6);

  const addTwoYears = (d: Date): Date => {
    const r = new Date(d);
    r.setFullYear(r.getFullYear() + 2);
    return r;
  };

  let pools: LeavePool[];

  if (today < firstGrant) {
    // ① 0~6개월 미만: 5일 preview
    pools = [
      {
        grantDate:     join,
        expiryDate:    addTwoYears(firstGrant),
        grantDays:     5,
        usedDays:      0,
        remainingDays: 5,
      },
    ];
  } else {
    // ② firstGrant 이후: 연간 부여 풀 생성
    pools = [];
    let a = 0;
    let grantDate = new Date(firstGrant);

    while (grantDate <= today) {
      const expiryDate = addTwoYears(grantDate);
      // 만료되지 않은 풀만 포함
      if (expiryDate > today) {
        pools.push({
          grantDate:     new Date(grantDate),
          expiryDate,
          grantDays:     getGrantDays(a),
          usedDays:      0,
          remainingDays: getGrantDays(a),
        });
      }
      a++;
      grantDate = new Date(firstGrant);
      grantDate.setFullYear(firstGrant.getFullYear() + a);
    }
  }

  // FIFO 차감: 승인 휴가를 startDate 오름차순으로 정렬 후 가장 오래된 풀부터 차감
  const sorted = [...approvedLeaves].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

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
 *
 * - 0~6개월: firstGrant 에서 10일 부여 예정
 * - 6개월~: 다음 연간 갱신일
 */
export function calcNextGrant(
  joinDateStr: string,
  today = new Date()
): NextGrant {
  const join = new Date(joinDateStr);
  const firstGrant = new Date(join);
  firstGrant.setMonth(firstGrant.getMonth() + 6);

  let a = 0;
  let grantDate = new Date(firstGrant);

  while (grantDate <= today) {
    a++;
    grantDate = new Date(firstGrant);
    grantDate.setFullYear(firstGrant.getFullYear() + a);
  }

  // 0~6개월 미만(a=0): preview 5일이 이미 부여돼 있으므로 추가 부여는 5일
  const days = a === 0 ? 5 : getGrantDays(a);

  return {
    date:      grantDate,
    days,
    daysUntil: daysBetween(today, grantDate),
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
