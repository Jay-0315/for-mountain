// ── 목업 데이터 (백엔드 미구현 동안 UI 개발용) ─────────────────

export type Department =
  | "開発 Part1"
  | "開発 Part2"
  | "技術グループ1"
  | "技術グループ2"
  | "技術本部"
  | "サービスグループ"
  | "営業１グループ"
  | "管理部";

export type Position =
  | "代表取締役"
  | "常務"
  | "部長"
  | "課長"
  | "課長代理"
  | "主任"
  | "社員";

export type JobTitle = "役員" | "管理職" | "一般社員";

export type EmployeeStatus = "在籍" | "休職" | "退職";

export const DEPARTMENTS: Department[] = [
  "開発 Part1",
  "開発 Part2",
  "技術グループ1",
  "技術グループ2",
  "技術本部",
  "サービスグループ",
  "営業１グループ",
  "管理部",
];

export interface Employee {
  id: number;
  employeeNumber: string;  // 社員番号
  name: string;
  nameKana: string;        // フリガナ
  nationality: string;     // 国籍
  birthDate: string;       // 生年月日
  department: Department;
  position: Position;      // 職級
  jobTitle: JobTitle;      // 職責
  joinDate: string;
  email: string;
  status: EmployeeStatus;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: Department;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  status: "出勤" | "欠勤" | "半休" | "有休" | "休日";
}

export type LeaveStatus = "待機中" | "承認" | "拒否";
export type LeaveType = "有給休暇" | "慶弔休暇" | "病気休暇" | "無給休暇";

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  department: Department;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
}

// ── 사내 전체 공지 ────────────────────────────────────────────
export interface InternalAnnouncement {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned: boolean;
}

// ── 그룹 관리 ─────────────────────────────────────────────────
export interface Group {
  id: number;
  name: Department;          // 그룹명 = 부서명
  leaderId: number;          // 그룹장 employeeId
  leaderName: string;
  memberIds: number[];       // 멤버 employeeId 목록
  description: string;
}

export const mockGroups: Group[] = [
  {
    id: 1,
    name: "開発 Part1",
    leaderId: 5,
    leaderName: "申尚勲",
    memberIds: [5, 6, 7, 9, 15, 16],
    description: "フロントエンド・バックエンド開発 Part1",
  },
  {
    id: 2,
    name: "開発 Part2",
    leaderId: 3,
    leaderName: "朴誠珉",
    memberIds: [3, 12, 13, 14, 17],
    description: "フロントエンド・バックエンド開発 Part2",
  },
  {
    id: 3,
    name: "技術グループ1",
    leaderId: 8,
    leaderName: "山中公明",
    memberIds: [8],
    description: "インフラ・セキュリティ・クラウド担当 グループ1",
  },
  {
    id: 4,
    name: "技術グループ2",
    leaderId: 10,
    leaderName: "樋口達也",
    memberIds: [10],
    description: "ネットワーク・サーバー運用担当 グループ2",
  },
  {
    id: 5,
    name: "技術本部",
    leaderId: 2,
    leaderName: "洪性模",
    memberIds: [2],
    description: "技術全体統括",
  },
  {
    id: 6,
    name: "サービスグループ",
    leaderId: 4,
    leaderName: "李在訓",
    memberIds: [4],
    description: "サービス企画・運用管理",
  },
  {
    id: 7,
    name: "営業１グループ",
    leaderId: 11,
    leaderName: "小沢江梨奈",
    memberIds: [11],
    description: "国内営業・顧客対応",
  },
  {
    id: 8,
    name: "管理部",
    leaderId: 1,
    leaderName: "盧鍾錫",
    memberIds: [1],
    description: "総務・人事・経営管理",
  },
];

// ── 부서별 공지 ───────────────────────────────────────────────
export interface DeptNotice {
  id: number;
  department: Department | "全部署";
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

// ── 직원 데이터 (실제 데이터 기준 17명) ───────────────────────
export const mockEmployees: Employee[] = [
  {
    id:  1, employeeNumber: "M22021001",
    name: "盧鍾錫",    nameKana: "ノジョンソク",      nationality: "韓国", birthDate: "1971-08-30",
    department: "管理部",         position: "代表取締役", jobTitle: "役員",   joinDate: "2022-02-10", email: "roh@for-mountain.co.jp",   status: "在籍",
  },
  {
    id:  2, employeeNumber: "M23071101",
    name: "洪性模",    nameKana: "ホンソンモ",         nationality: "韓国", birthDate: "1970-11-21",
    department: "技術本部",        position: "常務",       jobTitle: "役員",   joinDate: "2023-07-11", email: "hong@for-mountain.co.jp",   status: "在籍",
  },
  {
    id:  3, employeeNumber: "M23061010",
    name: "朴誠珉",    nameKana: "パクソンミン",       nationality: "韓国", birthDate: "1989-11-04",
    department: "開発 Part2",      position: "課長代理",   jobTitle: "一般社員", joinDate: "2023-06-10", email: "park.sm@for-mountain.co.jp", status: "在籍",
  },
  {
    id:  4, employeeNumber: "M23071011",
    name: "李在訓",    nameKana: "イゼフン",           nationality: "韓国", birthDate: "1983-08-30",
    department: "サービスグループ", position: "課長",       jobTitle: "管理職", joinDate: "2023-07-10", email: "lee.jh@for-mountain.co.jp",  status: "在籍",
  },
  {
    id:  5, employeeNumber: "M24071012",
    name: "申尚勲",    nameKana: "シンサンフン",       nationality: "韓国", birthDate: "1986-11-11",
    department: "開発 Part1",      position: "課長",       jobTitle: "管理職", joinDate: "2024-07-10", email: "shin@for-mountain.co.jp",    status: "在籍",
  },
  {
    id:  6, employeeNumber: "M24071014",
    name: "朴成鎭",    nameKana: "パクソンジン",       nationality: "韓国", birthDate: "1998-11-08",
    department: "開発 Part1",      position: "社員",       jobTitle: "一般社員", joinDate: "2024-07-10", email: "park.sj@for-mountain.co.jp", status: "在籍",
  },
  {
    id:  7, employeeNumber: "M24091016",
    name: "丁秀炫",    nameKana: "ジョンスヒョン",     nationality: "韓国", birthDate: "1995-03-08",
    department: "開発 Part1",      position: "主任",       jobTitle: "一般社員", joinDate: "2024-09-10", email: "jung@for-mountain.co.jp",    status: "在籍",
  },
  {
    id:  8, employeeNumber: "M24101017",
    name: "山中公明",  nameKana: "ヤマナカキミアキ",   nationality: "日本", birthDate: "1963-07-02",
    department: "技術グループ1",   position: "部長",       jobTitle: "管理職", joinDate: "2024-10-10", email: "yamanaka@for-mountain.co.jp", status: "在籍",
  },
  {
    id:  9, employeeNumber: "M25021019",
    name: "李賢圭",    nameKana: "イヒョンギュ",       nationality: "韓国", birthDate: "2000-12-21",
    department: "開発 Part1",      position: "社員",       jobTitle: "一般社員", joinDate: "2025-02-10", email: "lee.hg@for-mountain.co.jp",  status: "在籍",
  },
  {
    id: 10, employeeNumber: "M25041020",
    name: "樋口達也",  nameKana: "ヒグチタツヤ",       nationality: "日本", birthDate: "1966-12-02",
    department: "技術グループ2",   position: "部長",       jobTitle: "管理職", joinDate: "2025-04-10", email: "higuchi@for-mountain.co.jp",  status: "在籍",
  },
  {
    id: 11, employeeNumber: "M25041021",
    name: "小沢江梨奈", nameKana: "オザワエリナ",      nationality: "日本", birthDate: "2002-11-02",
    department: "営業１グループ",  position: "社員",       jobTitle: "一般社員", joinDate: "2025-04-10", email: "ozawa@for-mountain.co.jp",    status: "在籍",
  },
  {
    id: 12, employeeNumber: "M25061022",
    name: "高伊珍",    nameKana: "コイジン",           nationality: "韓国", birthDate: "2002-09-22",
    department: "開発 Part2",      position: "社員",       jobTitle: "一般社員", joinDate: "2025-06-10", email: "ko@for-mountain.co.jp",       status: "在籍",
  },
  {
    id: 13, employeeNumber: "M25061023",
    name: "辛珠賢",    nameKana: "シンジュヒョン",     nationality: "韓国", birthDate: "2002-11-18",
    department: "開発 Part2",      position: "社員",       jobTitle: "一般社員", joinDate: "2025-06-10", email: "shin.jh@for-mountain.co.jp",  status: "在籍",
  },
  {
    id: 14, employeeNumber: "M25111024",
    name: "許才元",    nameKana: "ホゼウォン",         nationality: "韓国", birthDate: "1995-02-14",
    department: "開発 Part2",      position: "主任",       jobTitle: "一般社員", joinDate: "2025-11-10", email: "heo@for-mountain.co.jp",      status: "在籍",
  },
  {
    id: 15, employeeNumber: "M26031025",
    name: "金聖国",    nameKana: "キムソングク",       nationality: "韓国", birthDate: "1996-04-16",
    department: "開発 Part1",      position: "社員",       jobTitle: "一般社員", joinDate: "2026-03-10", email: "kim.sg@for-mountain.co.jp",   status: "在籍",
  },
  {
    id: 16, employeeNumber: "M26031026",
    name: "催宰勳",    nameKana: "チェジェフン",       nationality: "韓国", birthDate: "2000-03-15",
    department: "開発 Part1",      position: "社員",       jobTitle: "一般社員", joinDate: "2026-03-10", email: "choi@for-mountain.co.jp",     status: "在籍",
  },
  {
    id: 17, employeeNumber: "M26041027",
    name: "金到炫",    nameKana: "キムドヒョン",       nationality: "韓国", birthDate: "1993-01-21",
    department: "開発 Part2",      position: "主任",       jobTitle: "一般社員", joinDate: "2026-04-10", email: "kim.dh@for-mountain.co.jp",   status: "在籍",
  },
];

// ── 근태 데이터 (오늘 기준) ──────────────────────────────────
export const mockAttendance: AttendanceRecord[] = [
  { id:  1, employeeId:  5, employeeName: "申尚勲",   department: "開発 Part1",      date: "2026-03-04", checkIn: "09:00", checkOut: "18:00", workHours: 9.0,  status: "出勤" },
  { id:  2, employeeId:  7, employeeName: "丁秀炫",   department: "開発 Part1",      date: "2026-03-04", checkIn: "08:55", checkOut: "18:05", workHours: 9.2,  status: "出勤" },
  { id:  3, employeeId:  9, employeeName: "李賢圭",   department: "開発 Part1",      date: "2026-03-04", checkIn: "09:10", checkOut: null,    workHours: null, status: "出勤" },
  { id:  4, employeeId: 12, employeeName: "高伊珍",   department: "開発 Part2",      date: "2026-03-04", checkIn: "09:05", checkOut: "18:05", workHours: 9.0,  status: "出勤" },
  { id:  5, employeeId: 17, employeeName: "金到炫",   department: "開発 Part2",      date: "2026-03-04", checkIn: "09:30", checkOut: "18:30", workHours: 9.0,  status: "出勤" },
  { id:  6, employeeId:  3, employeeName: "朴誠珉",   department: "開発 Part2",      date: "2026-03-04", checkIn: "09:00", checkOut: "17:30", workHours: 8.5,  status: "出勤" },
  { id:  7, employeeId: 11, employeeName: "小沢江梨奈", department: "営業１グループ", date: "2026-03-04", checkIn: null,    checkOut: null,    workHours: null, status: "有休" },
  { id:  8, employeeId:  4, employeeName: "李在訓",   department: "サービスグループ", date: "2026-03-04", checkIn: "10:00", checkOut: "14:00", workHours: 4.0,  status: "半休" },
  { id:  9, employeeId: 13, employeeName: "辛珠賢",   department: "開発 Part2",      date: "2026-03-04", checkIn: null,    checkOut: null,    workHours: null, status: "欠勤" },
  { id: 10, employeeId:  8, employeeName: "山中公明", department: "技術グループ1",   date: "2026-03-04", checkIn: "08:50", checkOut: "18:00", workHours: 9.2,  status: "出勤" },
  { id: 11, employeeId: 10, employeeName: "樋口達也", department: "技術グループ2",   date: "2026-03-04", checkIn: "09:00", checkOut: "18:00", workHours: 9.0,  status: "出勤" },
  { id: 12, employeeId:  6, employeeName: "朴成鎭",   department: "開発 Part1",      date: "2026-03-04", checkIn: "09:15", checkOut: "18:15", workHours: 9.0,  status: "出勤" },
];

// ── 휴가 신청 데이터 ─────────────────────────────────────────
export const mockLeaveRequests: LeaveRequest[] = [
  { id: 1, employeeId: 11, employeeName: "小沢江梨奈", department: "営業１グループ", leaveType: "有給休暇", startDate: "2026-03-04", endDate: "2026-03-04", days: 1, reason: "私用のため",   status: "承認",   appliedAt: "2026-02-28" },
  { id: 2, employeeId: 14, employeeName: "許才元",     department: "開発 Part2",    leaveType: "有給休暇", startDate: "2026-03-10", endDate: "2026-03-11", days: 2, reason: "旅行のため",   status: "待機中", appliedAt: "2026-03-01" },
  { id: 3, employeeId:  9, employeeName: "李賢圭",     department: "開発 Part1",    leaveType: "病気休暇", startDate: "2026-03-15", endDate: "2026-03-15", days: 1, reason: "体調不良",     status: "待機中", appliedAt: "2026-03-02" },
  { id: 4, employeeId: 12, employeeName: "高伊珍",     department: "開発 Part2",    leaveType: "慶弔休暇", startDate: "2026-03-20", endDate: "2026-03-22", days: 3, reason: "家族の慶事",   status: "待機中", appliedAt: "2026-03-03" },
  { id: 5, employeeId: 13, employeeName: "辛珠賢",     department: "開発 Part2",    leaveType: "有給休暇", startDate: "2026-02-20", endDate: "2026-02-21", days: 2, reason: "私用のため",   status: "拒否",   appliedAt: "2026-02-15" },
  { id: 6, employeeId:  7, employeeName: "丁秀炫",     department: "開発 Part1",    leaveType: "有給休暇", startDate: "2026-03-25", endDate: "2026-03-25", days: 1, reason: "私用のため",   status: "待機中", appliedAt: "2026-03-04" },
  { id: 7, employeeId: 17, employeeName: "金到炫",     department: "開発 Part2",    leaveType: "有給休暇", startDate: "2026-02-10", endDate: "2026-02-12", days: 3, reason: "旅行",         status: "承認",   appliedAt: "2026-02-01" },
];

// ── 사내 전체 공지 ────────────────────────────────────────────
export const mockAnnouncements: InternalAnnouncement[] = [
  {
    id: 1,
    title: "2026年度 春季健康診断のご案内",
    content: "2026年4月より春季健康診断を実施いたします。対象者には別途スケジュールをお知らせします。必ず受診してください。",
    author: "管理部",
    createdAt: "2026-03-01",
    pinned: true,
  },
  {
    id: 2,
    title: "社内システムメンテナンスのお知らせ（3/15）",
    content: "3月15日（日）22:00〜翌2:00の間、社内グループウェアのメンテナンスを実施いたします。この時間帯はシステムがご利用いただけません。",
    author: "申尚勲",
    createdAt: "2026-02-25",
    pinned: false,
  },
  {
    id: 3,
    title: "新入社員歓迎会のご案内（4月予定）",
    content: "4月入社の新入社員を迎えて歓迎会を開催します。日程・場所は追ってご連絡いたします。参加希望の方は管理部までご連絡ください。",
    author: "管理部",
    createdAt: "2026-02-20",
    pinned: false,
  },
  {
    id: 4,
    title: "セキュリティポリシー改定のお知らせ",
    content: "2026年4月1日より社内セキュリティポリシーを改定いたします。改定内容については添付資料をご参照ください。ご不明な点は情報システム担当までお問い合わせください。",
    author: "洪性模",
    createdAt: "2026-02-15",
    pinned: false,
  },
];

// ── 부서별 공지 ───────────────────────────────────────────────
export const mockDeptNotices: DeptNotice[] = [
  {
    id: 1,
    department: "開発 Part1",
    title: "コードレビュー運用ルール変更のお知らせ",
    content: "4月より、PRのレビュー承認者を2名以上とする運用に変更します。詳細はWikiを参照してください。",
    author: "申尚勲",
    createdAt: "2026-03-02",
  },
  {
    id: 2,
    department: "開発 Part2",
    title: "新機能リリーススケジュール共有",
    content: "3月末リリース予定の機能について、3/20（金）にリリース前レビュー会を実施します。参加必須です。",
    author: "朴誠珉",
    createdAt: "2026-02-28",
  },
  {
    id: 3,
    department: "全部署",
    title: "ゴールデンウィーク期間中の対応について",
    content: "GW期間（4/29〜5/6）中の緊急連絡先および対応フローについてご確認ください。",
    author: "管理部",
    createdAt: "2026-02-26",
  },
  {
    id: 4,
    department: "営業１グループ",
    title: "Q1営業実績レポート提出依頼",
    content: "3月末までにQ1営業実績レポートを管理部へ提出してください。フォーマットは共有フォルダに置いてあります。",
    author: "李在訓",
    createdAt: "2026-02-20",
  },
  {
    id: 5,
    department: "技術グループ1",
    title: "新サーバー導入に伴う作業分担について",
    content: "4月中旬に新サーバーの導入作業を予定しています。担当割り振りは来週中にお知らせします。",
    author: "山中公明",
    createdAt: "2026-02-18",
  },
];
