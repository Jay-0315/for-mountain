export type SessionRole = "ADMIN" | "USER" | null;

export type SessionPayload = {
  sub: string | null;
  role: SessionRole;
};

export function getSessionPayload(token?: string | null): SessionPayload {
  if (!token) {
    return { sub: null, role: null };
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) return { sub: null, role: null };
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded)) as { sub?: string; role?: string };
    return {
      sub: decoded.sub ?? null,
      role: decoded.role === "ADMIN" || decoded.role === "USER" ? decoded.role : null,
    };
  } catch {
    return { sub: null, role: null };
  }
}

export function getSessionRole(token?: string | null): SessionRole {
  return getSessionPayload(token).role;
}
