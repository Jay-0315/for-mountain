// 정적 배포: /api/v1/... → .htaccess → proxy.php → localhost:8081
const API_BASE = "";

// ── Types ───────────────────────────────────────────────────
export type BoardPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  imageName: string | null;
  imageData: string | null;
  videoName: string | null;
  videoData: string | null;
  attachmentName: string | null;
  attachmentData: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardListResponse = {
  posts: BoardPost[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  last: boolean;
};

export type UploadResponse = {
  fileUrl: string;
};

export type CreateEmployeeAccountResponse = {
  username: string;
  setupToken: string;
  setupTokenExpiresAt: string;
};

// ── Public (no auth) ─────────────────────────────────────────
export async function fetchBoardList(
  page = 0,
  size = 10,
  category?: string
): Promise<BoardListResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (category) params.set("category", category);
  const res = await fetch(`${API_BASE}/api/v1/board?${params}`);
  if (!res.ok) throw new Error("Failed to fetch board list");
  return res.json();
}

export async function fetchBoardDetail(id: number): Promise<BoardPost> {
  const res = await fetch(`${API_BASE}/api/v1/board/${id}`);
  if (!res.ok) throw new Error("Failed to fetch board post");
  return res.json();
}

// ── Admin (requires JWT) ─────────────────────────────────────
export async function adminLogin(
  username: string,
  password: string
): Promise<{ token: string; tokenType: string }> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message ?? "Login failed");
  }
  return res.json();
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function authRequestHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function createBoardPost(
  token: string,
  data: {
    title: string;
    content: string;
    author: string;
    category: string;
    imageName: string | null;
    imageData: string | null;
    videoName: string | null;
    videoData: string | null;
    attachmentName: string | null;
    attachmentData: string | null;
  }
): Promise<BoardPost> {
  const res = await fetch(`${API_BASE}/api/v1/board`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

export async function updateBoardPost(
  token: string,
  id: number,
  data: {
    title: string;
    content: string;
    category: string;
    imageName: string | null;
    imageData: string | null;
    videoName: string | null;
    videoData: string | null;
    attachmentName: string | null;
    attachmentData: string | null;
  }
): Promise<BoardPost> {
  const res = await fetch(`${API_BASE}/api/v1/board/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}

export async function deleteBoardPost(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/board/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete post");
}

export async function uploadFileToBackend(
  token: string,
  file: File,
  directory: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("directory", directory);
  const res = await fetch(`${API_BASE}/api/v1/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message ?? "Failed to upload file");
  }
  const data: UploadResponse = await res.json();
  return data.fileUrl;
}

export async function createEmployeeAccount(
  token: string,
  employeeNumber: string
): Promise<CreateEmployeeAccountResponse> {
  const res = await fetch(`${API_BASE}/api/v1/admin/accounts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ employeeNumber }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message ?? "Failed to create account");
  }
  return res.json();
}

export async function setupInitialPassword(params: {
  username: string;
  setupToken: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/auth/password/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message ?? "Failed to set password");
  }
}

// ── Employee ─────────────────────────────────────────────────
export type EmployeeDto = {
  id: number;
  employeeNumber: string;
  name: string;
  nameKana: string;
  nationality: string;
  birthDate: string;
  department: string;
  position: string;
  jobTitle: string;
  joinDate: string;
  email: string;
  status: string;
  annualLeaveDays: number | null;
};

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripWhitespace(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function normalizeEmployee(employee: EmployeeDto): EmployeeDto {
  return {
    ...employee,
    employeeNumber: collapseWhitespace(employee.employeeNumber),
    name: collapseWhitespace(employee.name),
    nameKana: collapseWhitespace(employee.nameKana),
    nationality: collapseWhitespace(employee.nationality),
    department: collapseWhitespace(employee.department),
    position: collapseWhitespace(employee.position),
    jobTitle: collapseWhitespace(employee.jobTitle),
    email: collapseWhitespace(employee.email),
    status: stripWhitespace(employee.status),
  };
}

export async function fetchEmployees(params?: {
  status?: string;
  department?: string;
  keyword?: string;
}): Promise<EmployeeDto[]> {
  const q = new URLSearchParams();
  if (params?.status)     q.set("status", params.status);
  if (params?.department) q.set("department", params.department);
  if (params?.keyword)    q.set("keyword", params.keyword);
  const res = await fetch(`${API_BASE}/api/v1/employees?${q}`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  const employees = (await res.json()) as EmployeeDto[];
  return employees.map(normalizeEmployee);
}

export async function createEmployee(
  token: string,
  data: Omit<EmployeeDto, "id">
): Promise<EmployeeDto> {
  const res = await fetch(`${API_BASE}/api/v1/employees`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create employee");
  return res.json();
}

export async function updateEmployee(
  token: string,
  id: number,
  data: Partial<Omit<EmployeeDto, "id">>
): Promise<EmployeeDto> {
  const res = await fetch(`${API_BASE}/api/v1/employees/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update employee");
  return res.json();
}

export async function deleteEmployee(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/employees/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete employee");
}

// ── Group ────────────────────────────────────────────────────
export type GroupDto = {
  id: number;
  name: string;
  description: string;
  leaderId: number | null;
  leaderName: string;
  memberIds: number[];
  parentGroupId: number | null;
  color?: string | null;
};

export async function fetchGroups(): Promise<GroupDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/groups`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
}

/** 해당 직원이 리더인 그룹 + 모든 하위 그룹의 memberIds를 합산 */
export function resolveLeaderMemberIds(groups: GroupDto[], employeeId: number): number[] | null {
  const myGroups = groups.filter((g) => g.leaderId === employeeId);
  if (myGroups.length === 0) return null;

  const allIds = new Set<number>();
  const queue = [...myGroups];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const group = queue.shift()!;
    if (visited.has(group.id)) continue;
    visited.add(group.id);
    group.memberIds.forEach((id) => allIds.add(id));
    groups
      .filter((g) => g.parentGroupId === group.id)
      .forEach((child) => queue.push(child));
  }

  return Array.from(allIds);
}

export async function createGroup(
  token: string,
  data: { name: string; description: string; leaderId: number | null; memberIds: number[]; parentGroupId?: number | null; color?: string | null }
): Promise<GroupDto> {
  const res = await fetch(`${API_BASE}/api/v1/groups`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create group");
  return res.json();
}

export async function updateGroup(
  token: string,
  id: number,
  data: { name: string; description: string; leaderId: number | null; memberIds: number[]; parentGroupId?: number | null; color?: string | null }
): Promise<GroupDto> {
  const res = await fetch(`${API_BASE}/api/v1/groups/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message ?? "Failed to update group");
  }
  return res.json();
}

export async function deleteGroup(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/groups/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete group");
}

// ── Leave ────────────────────────────────────────────────────
export type LeaveDto = {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  appliedAt: string;
};

function normalizeLeaveStatus(status: string) {
  if (status === "否認" || status === "却下") {
    return "拒否";
  }
  return status;
}

function normalizeLeave(leave: LeaveDto): LeaveDto {
  return {
    ...leave,
    status: normalizeLeaveStatus(leave.status),
  };
}

export async function fetchLeaves(params?: {
  status?: string;
  department?: string;
}, token?: string): Promise<LeaveDto[]> {
  const q = new URLSearchParams();
  if (params?.status)     q.set("status", params.status);
  if (params?.department) q.set("department", params.department);
  const res = await fetch(`${API_BASE}/api/v1/leaves?${q}`, {
    headers: authRequestHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch leaves");
  const leaves = (await res.json()) as LeaveDto[];
  return leaves.map(normalizeLeave);
}

export async function createLeave(
  token: string,
  data: { employeeId: number; leaveType: string; startDate: string; endDate: string; days: number; reason: string }
): Promise<LeaveDto> {
  const res = await fetch(`${API_BASE}/api/v1/leaves`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let message = "Failed to create leave";
    try {
      const error = (await res.json()) as { message?: string };
      message = error.message || message;
    } catch {
      // Ignore JSON parse failures and fall back to the generic message.
    }
    throw new Error(message);
  }
  return normalizeLeave((await res.json()) as LeaveDto);
}

export async function updateLeaveStatus(
  token: string,
  id: number,
  status: string
): Promise<LeaveDto> {
  const res = await fetch(`${API_BASE}/api/v1/leaves/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update leave status");
  return normalizeLeave((await res.json()) as LeaveDto);
}

export async function cancelLeave(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/leaves/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to cancel leave");
}

// ── InternalAnnouncement ─────────────────────────────────────
export type AnnouncementDto = {
  id: number;
  title: string;
  content: string;
  author: string;
  pinned: boolean;
  createdAt: string;
};

export async function fetchAnnouncements(): Promise<AnnouncementDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/announcements`);
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export async function createAnnouncement(
  token: string,
  data: { title: string; content: string; author: string; pinned: boolean }
): Promise<AnnouncementDto> {
  const res = await fetch(`${API_BASE}/api/v1/announcements`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create announcement");
  return res.json();
}

export async function updateAnnouncement(
  token: string,
  id: number,
  data: { title: string; content: string; author: string; pinned: boolean }
): Promise<AnnouncementDto> {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update announcement");
  return res.json();
}

export async function deleteAnnouncement(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete announcement");
}

// ── DeptNotice ───────────────────────────────────────────────
export type DeptNoticeDto = {
  id: number;
  department: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
};

export type PartnerCardDto = {
  id: number;
  imageSrc: string;
  linkUrl: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceCategoryDto = {
  id: number;
  slug: string;
  name: string;
  iconKey: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  name: string | null;
  url: string;
};

export type ServiceContentBlock = {
  type: "text" | "image" | "video" | "attachment";
  content: string | null;
  name: string | null;
  url: string | null;
};

export type ServiceItemDto = {
  id: number;
  category: string;
  title: string;
  summary: string | null;
  content: string;
  contentBlocks: ServiceContentBlock[];
  videoName: string | null;
  videoData: string | null;
  videoAssets: MediaAsset[];
  linkUrl: string | null;
  imageName: string | null;
  imageData: string | null;
  imageAssets: MediaAsset[];
  attachmentName: string | null;
  attachmentData: string | null;
  attachmentAssets: MediaAsset[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchDeptNotices(department?: string): Promise<DeptNoticeDto[]> {
  const q = new URLSearchParams();
  if (department) q.set("department", department);
  const res = await fetch(`${API_BASE}/api/v1/dept-notices?${q}`);
  if (!res.ok) throw new Error("Failed to fetch dept notices");
  return res.json();
}

export async function createDeptNotice(
  token: string,
  data: { department: string; title: string; content: string; author: string }
): Promise<DeptNoticeDto> {
  const res = await fetch(`${API_BASE}/api/v1/dept-notices`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create dept notice");
  return res.json();
}

export async function updateDeptNotice(
  token: string,
  id: number,
  data: { department: string; title: string; content: string; author: string }
): Promise<DeptNoticeDto> {
  const res = await fetch(`${API_BASE}/api/v1/dept-notices/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update dept notice");
  return res.json();
}

export async function deleteDeptNotice(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/dept-notices/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete dept notice");
}

export async function fetchPartnerCards(): Promise<PartnerCardDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/partner-cards`);
  if (!res.ok) throw new Error("Failed to fetch partner cards");
  return res.json();
}

export async function createPartnerCard(
  token: string,
  data: { imageSrc: string; linkUrl: string }
): Promise<PartnerCardDto> {
  const res = await fetch(`${API_BASE}/api/v1/partner-cards`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create partner card");
  return res.json();
}

export async function updatePartnerCard(
  token: string,
  id: number,
  data: { imageSrc: string; linkUrl: string }
): Promise<PartnerCardDto> {
  const res = await fetch(`${API_BASE}/api/v1/partner-cards/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update partner card");
  return res.json();
}

export async function deletePartnerCard(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/partner-cards/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete partner card");
}

export async function reorderPartnerCards(token: string, orderedIds: number[]): Promise<PartnerCardDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/partner-cards/order`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) throw new Error("Failed to reorder partner cards");
  return res.json();
}

export async function fetchServiceItems(category?: string): Promise<ServiceItemDto[]> {
  const q = new URLSearchParams();
  if (category) q.set("category", category);
  const res = await fetch(`${API_BASE}/api/v1/service-items?${q}`);
  if (!res.ok) throw new Error("Failed to fetch service items");
  return res.json();
}

export async function fetchServiceCategories(): Promise<ServiceCategoryDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/service-categories`);
  if (!res.ok) throw new Error("Failed to fetch service categories");
  return res.json();
}

export async function createServiceCategory(
  token: string,
  data: { name: string; iconKey: string }
): Promise<ServiceCategoryDto> {
  const res = await fetch(`${API_BASE}/api/v1/service-categories`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create service category");
  return res.json();
}

export async function updateServiceCategory(
  token: string,
  id: number,
  data: { name: string; iconKey: string }
): Promise<ServiceCategoryDto> {
  const res = await fetch(`${API_BASE}/api/v1/service-categories/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update service category");
  return res.json();
}

export async function deleteServiceCategory(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/service-categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete service category");
}

export async function fetchServiceItemDetail(id: number): Promise<ServiceItemDto> {
  const res = await fetch(`${API_BASE}/api/v1/service-items/${id}`);
  if (!res.ok) throw new Error("Failed to fetch service item");
  return res.json();
}

export async function createServiceItem(
  token: string,
  data: {
    category: string;
    title: string;
    summary: string | null;
    content: string;
    contentBlocks: ServiceContentBlock[];
    videoName: string | null;
    videoData: string | null;
    videoAssets: MediaAsset[];
    linkUrl: string | null;
    imageName: string | null;
    imageData: string | null;
    imageAssets: MediaAsset[];
    attachmentName: string | null;
    attachmentData: string | null;
    attachmentAssets: MediaAsset[];
  }
): Promise<ServiceItemDto> {
  const res = await fetch(`${API_BASE}/api/v1/service-items`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create service item");
  return res.json();
}

export async function updateServiceItem(
  token: string,
  id: number,
  data: {
    category: string;
    title: string;
    summary: string | null;
    content: string;
    contentBlocks: ServiceContentBlock[];
    videoName: string | null;
    videoData: string | null;
    videoAssets: MediaAsset[];
    linkUrl: string | null;
    imageName: string | null;
    imageData: string | null;
    imageAssets: MediaAsset[];
    attachmentName: string | null;
    attachmentData: string | null;
    attachmentAssets: MediaAsset[];
  }
): Promise<ServiceItemDto> {
  const res = await fetch(`${API_BASE}/api/v1/service-items/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update service item");
  return res.json();
}

export async function deleteServiceItem(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/service-items/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete service item");
}

export async function reorderServiceItems(token: string, orderedIds: number[]): Promise<ServiceItemDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/service-items/order`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) throw new Error("Failed to reorder service items");
  return res.json();
}
