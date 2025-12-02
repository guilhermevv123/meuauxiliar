export type AdminSession = {
  email: string;
  createdAt: number;
};

const KEY = "admin_session";

export function setAdminSession(s: { email: string }) {
  const session: AdminSession = { email: s.email, createdAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(KEY);
}

export function hasAdminSession() {
  return getAdminSession() !== null;
}
