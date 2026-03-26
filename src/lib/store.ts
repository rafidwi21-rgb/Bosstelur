"use client";

// Store — uses localStorage for auth session, API calls for data
// getCurrentUser/setCurrentUser/logout remain synchronous (localStorage)
// All data methods are now in src/lib/api.ts (async)

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "WORKER";
}

function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : fallback;
}

function setLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  // Auth — synchronous, localStorage-based
  getCurrentUser: (): SessionUser | null => getLS<SessionUser | null>("farm_current_user", null),
  setCurrentUser: (user: SessionUser | null) => setLS("farm_current_user", user),
  logout: () => { setLS("farm_current_user", null); },

  // Login — async, calls API
  login: async (email: string, password: string): Promise<SessionUser | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return null;
      const user = await res.json();
      const session: SessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      store.setCurrentUser(session);
      return session;
    } catch {
      return null;
    }
  },

  // Helper
  todayStr: () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }),
};
