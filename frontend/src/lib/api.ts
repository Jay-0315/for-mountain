// Next.js rewrites(/api/backend/*) 를 통해 백엔드로 프록시됨
// next.config.ts: source "/api/backend/:path*" → destination "${BACKEND_URL}/api/:path*"
const API_BASE = "/api/backend";

// ── Types ───────────────────────────────────────────────────
export type BoardPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
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
export async function adminLogin(code: string): Promise<{ token: string; tokenType: string }> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
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

export async function createBoardPost(
  token: string,
  data: { title: string; content: string; author: string; category: string }
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
  data: { title: string; content: string; category: string }
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
