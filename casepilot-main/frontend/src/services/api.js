import { getCurrentUserIdentity } from "./firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const { headers, ...restOptions } = options;
  const isFormData = options.body instanceof FormData;
  const identity = getCurrentUserIdentity();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: isFormData
      ? {
          ...(headers || {}),
          "X-CasePilot-User-Id": identity.userId,
          "X-CasePilot-User-Email": identity.userEmail,
        }
      : {
          "Content-Type": "application/json",
          "X-CasePilot-User-Id": identity.userId,
          "X-CasePilot-User-Email": identity.userEmail,
          ...(headers || {}),
        },
    ...restOptions,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getBrief: () => request("/api/brief"),
  getCases: () => request("/api/cases"),
  getCase: (caseNumber) => request(`/api/cases/${encodeURIComponent(caseNumber)}`),
  getHearings: () => request("/api/hearings"),
  getTasks: () => request("/api/tasks"),
  getCaseFiles: (caseNumber) => request(`/api/files/case/${encodeURIComponent(caseNumber)}`),
  uploadCaseFile: (formData) =>
    request("/api/files/upload", {
      method: "POST",
      body: formData,
    }),
  attachCaseFileLink: (payload) =>
    request("/api/files/link", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteCaseFile: (fileId) =>
    request(`/api/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
    }),
  getCaseFileDownloadUrl: (fileId) => `${API_BASE}/api/files/${encodeURIComponent(fileId)}/download`,
  getOverdueTasks: () => request("/api/tasks/overdue"),
  getToolConnections: () => request("/api/connections"),
  saveToolConnection: (toolName, payload) =>
    request(`/api/connections/${encodeURIComponent(toolName)}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  startGoogleConnection: (toolName) => request(`/api/google-auth/${encodeURIComponent(toolName)}/start`),
  disconnectGoogleConnection: (toolName) =>
    request(`/api/google-auth/${encodeURIComponent(toolName)}/disconnect`, {
      method: "POST",
    }),
  getSettings: () => request("/api/settings"),
  updateSettings: (payload) =>
    request("/api/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  syncHearingToCalendar: (hearingId) =>
    request(`/api/calendar/sync-hearing/${encodeURIComponent(hearingId)}`, { method: "POST" }),
  syncAllHearings: () => request("/api/calendar/sync-all", { method: "POST" }),
  getCalendarStatus: () => request("/api/calendar/status"),
  syncTaskToGoogle: (taskId) =>
    request(`/api/google-tasks/sync-task/${encodeURIComponent(taskId)}`, { method: "POST" }),
  syncAllTasks: () => request("/api/google-tasks/sync-all", { method: "POST" }),
  getGoogleTasksStatus: () => request("/api/google-tasks/status"),
  getCaseNotes: (caseNumber) => request(`/api/research/case/${encodeURIComponent(caseNumber)}/notes`),
  saveCaseNote: (payload) =>
    request("/api/research/save-note", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getResearchNotes: (query) => request(`/api/research/notes/${encodeURIComponent(query)}`),
  getPrecedents: (subject) => request(`/api/research/precedents/${encodeURIComponent(subject)}`),
  createTask: (payload) =>
    request("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTaskStatus: (taskId, status) =>
    request(`/api/tasks/${encodeURIComponent(taskId)}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteTask: (taskId) =>
    request(`/api/tasks/${encodeURIComponent(taskId)}`, { method: "DELETE" }),
};

export { API_BASE };
