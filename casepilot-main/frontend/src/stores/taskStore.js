import { create } from "zustand";
import { api } from "../services/api";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  overdueTasks: [],
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const [pending, overdue] = await Promise.all([api.getTasks(), api.getOverdueTasks()]);
      set({
        tasks: pending.tasks || [],
        overdueTasks: overdue.tasks || [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Optimistically add a new task, then reload from server
  addTask: async (payload) => {
    const result = await api.createTask(payload);
    // Reload to get server-generated id and timestamps
    await get().loadTasks();
    return result;
  },

  // Optimistically update status in local state, then confirm with server
  updateStatus: async (taskId, newStatus) => {
    const apply = (list) =>
      list.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    set((state) => ({
      tasks: apply(state.tasks),
      overdueTasks: apply(state.overdueTasks),
    }));
    try {
      await api.updateTaskStatus(taskId, newStatus);
      // If moved to completed, reload so it disappears from pending/overdue
      if (newStatus === "completed") await get().loadTasks();
    } catch {
      // Revert on failure
      await get().loadTasks();
    }
  },

  // Optimistically remove from local state, then confirm with server
  removeTask: async (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      overdueTasks: state.overdueTasks.filter((t) => t.id !== taskId),
    }));
    try {
      await api.deleteTask(taskId);
    } catch {
      await get().loadTasks();
    }
  },

  setTasks: (tasks) => set({ tasks }),
}));
