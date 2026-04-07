import { create } from "zustand";
import { api } from "../services/api";

export const useHearingStore = create((set) => ({
  hearings: [],
  isLoading: false,
  loadHearings: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getHearings();
      set({ hearings: data.hearings || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  setHearings: (hearings) => set({ hearings })
}));
