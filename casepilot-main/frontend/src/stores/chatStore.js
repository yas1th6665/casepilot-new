import { create } from "zustand";

export const useChatStore = create((set) => ({
  sessionId: null,
  isConnected: false,
  isTyping: false,
  focusedCaseNumber: "",
  pendingPrompt: "",
  messages: [
    {
      id: "welcome",
      role: "assistant",
      text: "Ask for your daily brief, upcoming hearings, overdue tasks, or a case summary."
    }
  ],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSessionId: (sessionId) => set({ sessionId }),
  setConnected: (isConnected) => set({ isConnected }),
  setTyping: (isTyping) => set({ isTyping }),
  setFocusedCaseNumber: (focusedCaseNumber) => set({ focusedCaseNumber }),
  setPendingPrompt: (pendingPrompt) => set({ pendingPrompt }),
}));
