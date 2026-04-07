import { create } from "zustand";
import { api } from "../services/api";

export const useCaseStore = create((set) => ({
  cases: [],
  isLoading: false,
  error: null,
  loadCases: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getCases();
      set({ cases: data.cases || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  setCases: (cases) => set({ cases })
}));
