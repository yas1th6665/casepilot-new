import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../services/api";
import { useSettingsStore } from "../stores/settingsStore";

export default function Settings() {
  const {
    advocateName,
    compactMode,
    theme,
    dailyBriefTime,
    telegramEnabled,
    calendarAutoSync,
    hydrateSettings,
    setTheme,
    setCompactMode,
    setDailyBriefTime,
    setTelegramEnabled,
    setCalendarAutoSync,
    setAdvocateName,
  } = useSettingsStore();
  const [form, setForm] = useState({
    display_name: advocateName,
    compact_mode: compactMode,
    theme,
    notification_prefs: {
      daily_brief_time: dailyBriefTime,
      telegram_enabled: telegramEnabled,
      calendar_auto_sync: calendarAutoSync,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    let mounted = true;

    api
      .getSettings()
      .then((data) => {
        if (!mounted) return;
        hydrateSettings(data);
        setForm({
          display_name: data.display_name || "Advocate Satyanarayana",
          compact_mode: Boolean(data.compact_mode),
          theme: data.theme || "light",
          notification_prefs: {
            daily_brief_time: data.notification_prefs?.daily_brief_time || "08:30",
            telegram_enabled: Boolean(data.notification_prefs?.telegram_enabled),
            calendar_auto_sync: Boolean(data.notification_prefs?.calendar_auto_sync),
          },
        });
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [hydrateSettings]);

  const updatePref = (key, value) => {
    setForm((current) => ({
      ...current,
      notification_prefs: {
        ...current.notification_prefs,
        [key]: value,
      },
    }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaveState("saving");
    try {
      const saved = await api.updateSettings(form);
      hydrateSettings(saved);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading office preferences..." />;
  }

  return (
    <form onSubmit={saveSettings} className="space-y-6">
      <section className="max-w-4xl rounded-[36px] border border-stone-200/70 bg-white/85 p-7 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Preferences</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          Save the office identity and daily workflow defaults that shape how CasePilot greets you and how integrations behave.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
          <h2 className="font-display text-2xl text-ink">Workspace profile</h2>

          <label className="mt-6 block text-sm font-semibold text-ink">
            Advocate display name
            <input
              value={form.display_name}
              onChange={(event) => {
                const value = event.target.value;
                setForm((current) => ({ ...current, display_name: value }));
                setAdvocateName(value);
              }}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
            />
          </label>

          <label className="mt-5 block text-sm font-semibold text-ink">
            Theme
            <select
              value={form.theme}
              onChange={(event) => {
                const value = event.target.value;
                setForm((current) => ({ ...current, theme: value }));
                setTheme(value);
              }}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="mt-5 flex items-center justify-between rounded-[24px] border border-stone-200 bg-paper px-4 py-4 text-sm text-stone-700">
            <span>Compact mode</span>
            <input
              type="checkbox"
              checked={form.compact_mode}
              onChange={(event) => {
                const value = event.target.checked;
                setForm((current) => ({ ...current, compact_mode: value }));
                setCompactMode(value);
              }}
              className="h-4 w-4 accent-ink"
            />
          </label>
        </div>

        <div className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
          <h2 className="font-display text-2xl text-ink">Automation defaults</h2>

          <label className="mt-6 block text-sm font-semibold text-ink">
            Daily brief time
            <input
              type="time"
              value={form.notification_prefs.daily_brief_time}
              onChange={(event) => {
                updatePref("daily_brief_time", event.target.value);
                setDailyBriefTime(event.target.value);
              }}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
            />
          </label>

          <label className="mt-5 flex items-center justify-between rounded-[24px] border border-stone-200 bg-paper px-4 py-4 text-sm text-stone-700">
            <span>Enable Telegram briefings</span>
            <input
              type="checkbox"
              checked={form.notification_prefs.telegram_enabled}
              onChange={(event) => {
                updatePref("telegram_enabled", event.target.checked);
                setTelegramEnabled(event.target.checked);
              }}
              className="h-4 w-4 accent-ink"
            />
          </label>

          <label className="mt-5 flex items-center justify-between rounded-[24px] border border-stone-200 bg-paper px-4 py-4 text-sm text-stone-700">
            <span>Auto-sync hearings to calendar</span>
            <input
              type="checkbox"
              checked={form.notification_prefs.calendar_auto_sync}
              onChange={(event) => {
                updatePref("calendar_auto_sync", event.target.checked);
                setCalendarAutoSync(event.target.checked);
              }}
              className="h-4 w-4 accent-ink"
            />
          </label>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-stone-600">
              {saveState === "saved"
                ? "Settings saved."
                : saveState === "error"
                  ? "Could not save settings right now."
                  : "Changes here are stored in Firestore for the default user."}
            </p>
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              {saveState === "saving" ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
