import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";
import { useCaseStore } from "../stores/caseStore";
import { useHearingStore } from "../stores/hearingStore";
import { useTaskStore } from "../stores/taskStore";
import { useSettingsStore } from "../stores/settingsStore";

export default function Layout() {
  const { loadCases } = useCaseStore();
  const { loadHearings } = useHearingStore();
  const { loadTasks } = useTaskStore();
  const { theme, compactMode } = useSettingsStore();
  const location = useLocation();

  const showChat = useMemo(() => {
    const paths = ["/", "/research"];
    return paths.includes(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    loadCases();
    loadHearings();
    loadTasks();
  }, [loadCases, loadHearings, loadTasks]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme || "light";
    document.body.dataset.theme = theme || "light";
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-paper text-ink transition-colors duration-200">
      <Sidebar />
      <main className="min-w-[480px] flex-1 overflow-y-auto">
        <div
          className={[
            "min-h-screen px-4 py-4 md:px-8 md:py-6 transition-colors duration-200",
            compactMode ? "md:px-6 md:py-5" : "",
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_top_left,_rgba(162,118,42,0.14),_transparent_24%),linear-gradient(180deg,_rgba(10,16,28,0.98),_rgba(17,25,40,0.98))]"
              : "bg-[radial-gradient(circle_at_top_left,_rgba(169,122,43,0.18),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.75),_rgba(255,255,255,0.85))]",
          ].join(" ")}
        >
          <Outlet />
        </div>
      </main>
      {showChat && <ChatPanel />}
    </div>
  );
}
