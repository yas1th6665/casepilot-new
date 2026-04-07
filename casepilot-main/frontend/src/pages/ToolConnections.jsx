import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ToolConnectionCard from "../components/ToolConnectionCard";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const toolMeta = {
  google_calendar: {
    label: "Calendar",
    title: "Google Calendar",
    description: "Sync hearings into the actual Google Calendar account you connect here.",
  },
  google_tasks: {
    label: "Tasks",
    title: "Google Tasks",
    description: "Push litigation follow-ups into the actual Google Tasks account linked from this dashboard.",
  },
  telegram: {
    label: "Telegram",
    title: "Telegram Bot",
    description: "Receive briefing snapshots and send case requests from Telegram through the same CasePilot backend.",
  },
  ecourts: {
    label: "Research",
    title: "eCourts MCP",
    description: "Use the legal research and court-tracking layer that powers live court context inside the ADK workflow.",
  },
};

function buildDetails(tool) {
  const runtime = tool.runtime_status || {};
  const details = [];

  if (runtime.account_email) details.push(`Connected account: ${runtime.account_email}`);
  if (runtime.account_name) details.push(`Account name: ${runtime.account_name}`);
  if (runtime.auth_type) details.push(`Auth type: ${runtime.auth_type.replaceAll("_", " ")}`);
  if (runtime.auth_type === "service_account") {
    details.push("CasePilot can sync with server credentials right now, but this is not your personal Google account yet.");
  }
  if (runtime.message) details.push(runtime.message);
  if (runtime.webhook_url) details.push(`Webhook: ${runtime.webhook_url}`);
  if (runtime.calendar_id) details.push(`Calendar ID: ${runtime.calendar_id}`);
  if (runtime.task_list_id) details.push(`Task List: ${runtime.task_list_id}`);
  if (runtime.token_configured !== undefined) details.push(`Bot token configured: ${runtime.token_configured ? "Yes" : "No"}`);
  if (!details.length) details.push("Connection metadata will appear here as integrations are configured.");

  return details;
}

export default function ToolConnections() {
  const { user, canAuth, signInWithGoogle, signOutGoogle } = useAuth();
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionTool, setActionTool] = useState("");

  const loadConnections = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await api.getToolConnections();
      setTools(data.tools || []);
    } catch {
      try {
        const [calendar, tasks] = await Promise.all([api.getCalendarStatus(), api.getGoogleTasksStatus()]);
        setTools([
          { tool_name: "google_calendar", status: calendar.status || "disconnected", runtime_status: calendar },
          { tool_name: "google_tasks", status: tasks.status || "disconnected", runtime_status: tasks },
          {
            tool_name: "telegram",
            status: "disconnected",
            runtime_status: { message: "Backend connections endpoint is unavailable. Restarting the backend usually fixes this." },
          },
          {
            tool_name: "ecourts",
            status: "disconnected",
            runtime_status: { message: "eCourts status is not available until the backend connections route responds." },
          },
        ]);
        setErrorMessage("");
      } catch {
        setErrorMessage("Unable to load integration status right now.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === "casepilot-google-connected") {
        setActionTool("");
        loadConnections();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const connectGoogleTool = async (toolName) => {
    if (canAuth && !user) {
      try {
        await signInWithGoogle();
      } catch {
        setErrorMessage("Please sign in successfully before connecting Google tools.");
        return;
      }
    }

    setActionTool(toolName);
    setErrorMessage("");
    try {
      const result = await api.startGoogleConnection(toolName);
      if (result.auth_url) {
        window.open(result.auth_url, "_blank", "width=640,height=760");
      } else {
        setErrorMessage(result.message || "Google connection is not configured yet.");
        setActionTool("");
      }
    } catch {
      setErrorMessage("Could not start Google connection flow.");
      setActionTool("");
    }
  };

  const disconnectGoogleTool = async (toolName) => {
    setActionTool(toolName);
    setErrorMessage("");
    try {
      await api.disconnectGoogleConnection(toolName);
      await loadConnections();
    } catch {
      setErrorMessage("Could not disconnect that Google tool right now.");
    } finally {
      setActionTool("");
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Checking connected tools..." />;
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-red-700">{errorMessage}</div>
        <button
          type="button"
          onClick={loadConnections}
          className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tools.length) {
    return (
      <EmptyState
        title="No tool connections yet"
        description="As integrations are enabled, their status cards will appear here."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[36px] border border-stone-200/70 bg-white/85 p-7 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Tool Connections</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Integration Control Room</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          Connect Calendar and Tasks to the actual Google account that should receive synced work. This is the right base for personal lawyer accounts now and shared-office workflows later.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-paper px-4 py-2 text-sm text-stone-700">
            {user ? `Signed in as ${user.email || user.displayName || user.uid}` : "App identity: guest/default user"}
          </div>
          {canAuth && !user ? (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
            >
              Sign in with Google
            </button>
          ) : null}
          {canAuth && user ? (
            <button
              type="button"
              onClick={signOutGoogle}
              className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {tools.map((tool) => {
          const meta = toolMeta[tool.tool_name] || {
            label: tool.tool_name,
            title: tool.tool_name,
            description: "Connection status",
          };

          const isGoogleTool = tool.tool_name === "google_calendar" || tool.tool_name === "google_tasks";

          return (
            <ToolConnectionCard
              key={tool.id || tool.tool_name}
              tool={{
                ...tool,
                ...meta,
                details: buildDetails(tool),
                footer: `Tool key: ${tool.tool_name}`,
              }}
              onReconnect={loadConnections}
              onConnect={isGoogleTool ? () => connectGoogleTool(tool.tool_name) : undefined}
              onDisconnect={isGoogleTool ? () => disconnectGoogleTool(tool.tool_name) : undefined}
              actionBusy={actionTool === tool.tool_name}
            />
          );
        })}
      </section>
    </div>
  );
}
