/** 현재 시점 기준 유급휴가 부여 정보 */
export type LeaveGrant = {
  grantDays: number;  // 현재 접근 가능한 일수
  grantStart: Date;   // 집계 시작일 (이 날부터 사용분 카운트)
  nextGrant: Date;    // 다음 변경일
  a: number;          // 0=초기풀, 1,2,…=정기 사이클 차수
};

/**
 * 입사일 기반 유급휴가 부여 정보를 계산합니다.
 *
 * 규칙:
 *  - 입사 ~ 6개월 미만  : 5일  (grantStart = joinDate)
 *  - 6개월 ~ 18개월 미만 : 10일 (동일 풀 오픈, grantStart = joinDate 유지)
 *  - 18개월 이후 매년   : 10+a 일 (a=1,2,… 상한 20일)
 */
export function calcLeaveGrant(joinDateStr: string, today = new Date()): LeaveGrant {
  const join = new Date(joinDateStr);

  // 입사 + 6개월
  const firstGrant = new Date(join);
  firstGrant.setMonth(firstGrant.getMonth() + 6);

  // 입사 + 18개월 (= firstGrant + 12개월)
  const secondGrant = new Date(firstGrant);
  secondGrant.setFullYear(secondGrant.getFullYear() + 1);

  // ① 입사 ~ 6개월 미만: 5일
  if (today < firstGrant) {
    return { grantDays: 5, grantStart: join, nextGrant: firstGrant, a: 0 };
  }

  // ② 6개월 ~ 18개월 미만: 10일 (동일 풀, grantStart = joinDate 유지)
  if (today < secondGrant) {
    return { grantDays: 10, grantStart: join, nextGrant: secondGrant, a: 0 };
  }

  // ③ 18개월 이후: 매년 사이클 리셋 (a=1,2,…)
  let a = 1;
  let grantStart = new Date(secondGrant);
  let nextGrant = new Date(secondGrant);
  nextGrant.setFullYear(nextGrant.getFullYear() + 1);

  while (nextGrant <= today) {
    a++;
    grantStart = new Date(nextGrant);
    nextGrant = new Date(nextGrant);
    nextGrant.setFullYear(nextGrant.getFullYear() + 1);
  }

  return { grantDays: Math.min(10 + a, 30), grantStart, nextGrant, a };
}

/** Date → "YYYY-MM-DD" 문자열 */
export function formatDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Date → "YYYY.MM.DD" 표시용 문자열 */
export function formatDateDisplay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 두 날짜 간 일수 차이 (양수) */
export function daysBetween(a: Date, b: Date): number {
  return Math.ceil(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
