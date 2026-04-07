import { create } from "zustand";

export const useSettingsStore = create((set) => ({
  advocateName: "Advocate Satyanarayana",
  compactMode: false,
  theme: "light",
  dailyBriefTime: "08:30",
  telegramEnabled: false,
  calendarAutoSync: false,
  setAdvocateName: (advocateName) => set({ advocateName }),
  setTheme: (theme) => set({ theme }),
  setCompactMode: (compactMode) => set({ compactMode }),
  setDailyBriefTime: (dailyBriefTime) => set({ dailyBriefTime }),
  setTelegramEnabled: (telegramEnabled) => set({ telegramEnabled }),
  setCalendarAutoSync: (calendarAutoSync) => set({ calendarAutoSync }),
  toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
  hydrateSettings: (settings) =>
    set({
      advocateName: settings.display_name || "Advocate Satyanarayana",
      compactMode: Boolean(settings.compact_mode),
      theme: settings.theme || "light",
      dailyBriefTime: settings.notification_prefs?.daily_brief_time || "08:30",
      telegramEnabled: Boolean(settings.notification_prefs?.telegram_enabled),
      calendarAutoSync: Boolean(settings.notification_prefs?.calendar_auto_sync),
    }),
}));
