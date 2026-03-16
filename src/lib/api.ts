"use client";

// API helper — all frontend calls go through here
const BASE = "/api";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchJSON<{ id: string; name: string; email: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Users
  getUsers: () => fetchJSON<any[]>("/users"),
  createUser: (data: any) => fetchJSON("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => fetchJSON(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: string) => fetchJSON(`/users/${id}`, { method: "DELETE" }),

  // Houses
  getHouses: () => fetchJSON<any[]>("/houses"),
  createHouse: (data: any) => fetchJSON("/houses", { method: "POST", body: JSON.stringify(data) }),
  updateHouse: (id: string, data: any) => fetchJSON(`/houses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteHouse: (id: string) => fetchJSON(`/houses/${id}`, { method: "DELETE" }),

  // Tasks
  getTasks: (date?: string, workerId?: string) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (workerId) params.set("workerId", workerId);
    return fetchJSON<any[]>(`/tasks?${params}`);
  },
  updateTask: (id: string, data: any) => fetchJSON(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Attendance
  getAttendance: (date?: string, userId?: string) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (userId) params.set("userId", userId);
    return fetchJSON<any[]>(`/attendance?${params}`);
  },
  checkIn: (userId: string) => fetchJSON("/attendance", { method: "POST", body: JSON.stringify({ userId, type: "CHECK_IN" }) }),
  checkOut: (userId: string) => fetchJSON("/attendance", { method: "POST", body: JSON.stringify({ userId, type: "CHECK_OUT" }) }),
  undoCheckOut: (userId: string, date: string) =>
    fetchJSON(`/attendance?userId=${userId}&type=CHECK_OUT&date=${date}`, { method: "DELETE" }),

  // Production
  getProduction: (from?: string, to?: string, houseId?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (houseId) params.set("houseId", houseId);
    return fetchJSON<any[]>(`/production?${params}`);
  },
  createProduction: (data: any) => fetchJSON("/production", { method: "POST", body: JSON.stringify(data) }),

  // Feed
  getFeedInventory: () => fetchJSON<any[]>("/feed"),
  createFeedInventory: (data: any) => fetchJSON("/feed", { method: "POST", body: JSON.stringify(data) }),
  updateFeedInventory: (id: string, data: any) => fetchJSON(`/feed/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFeedInventory: (id: string) => fetchJSON(`/feed/${id}`, { method: "DELETE" }),
  getFeedUsage: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return fetchJSON<any[]>(`/feed/usage?${params}`);
  },
  createFeedUsage: (data: any) => fetchJSON("/feed/usage", { method: "POST", body: JSON.stringify(data) }),

  // Sales
  getSales: (from?: string, to?: string, recordedBy?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (recordedBy) params.set("recordedBy", recordedBy);
    return fetchJSON<any[]>(`/sales?${params}`);
  },
  createSale: (data: any) => fetchJSON("/sales", { method: "POST", body: JSON.stringify(data) }),
  updateSale: (id: string, data: any) => fetchJSON(`/sales/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSale: (id: string) => fetchJSON(`/sales/${id}`, { method: "DELETE" }),

  // Expenses
  getExpenses: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return fetchJSON<any[]>(`/expenses?${params}`);
  },
  createExpense: (data: any) => fetchJSON("/expenses", { method: "POST", body: JSON.stringify(data) }),

  // Dashboard
  getDashboard: () => fetchJSON<any>("/dashboard"),
};
