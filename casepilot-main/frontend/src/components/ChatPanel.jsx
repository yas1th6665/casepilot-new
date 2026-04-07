import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, SendHorizonal, WifiOff } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useCaseStore } from "../stores/caseStore";
import { useChatStore } from "../stores/chatStore";
import ChatMessage from "./ChatMessage";

const SNAP_POINTS = [320, 440, 560, 680, 800];
const MIN_WIDTH = SNAP_POINTS[0];
const MAX_WIDTH = SNAP_POINTS[SNAP_POINTS.length - 1];
const DEFAULT_WIDTH = 560;
const COLLAPSED_WIDTH = 48;

function snapToNearest(w) {
  return SNAP_POINTS.reduce((prev, curr) =>
    Math.abs(curr - w) < Math.abs(prev - w) ? curr : prev
  );
}

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(null);
  const dragStartWidth = useRef(null);
  const messagesEndRef = useRef(null);

  const location = useLocation();
  const params = useParams();
  const { sendMessage } = useChat();
  const { cases } = useCaseStore();
  const { messages, isConnected, isTyping, focusedCaseNumber, setFocusedCaseNumber, pendingPrompt, setPendingPrompt } = useChatStore();

  useEffect(() => {
    if (location.pathname.startsWith("/cases/") && params.caseNumber) {
      setFocusedCaseNumber(decodeURIComponent(params.caseNumber));
    }
  }, [location.pathname, params.caseNumber, setFocusedCaseNumber]);

  const focusedCase = useMemo(
    () => cases.find((item) => item.case_number === focusedCaseNumber) || null,
    [cases, focusedCaseNumber]
  );

  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt);
      setPendingPrompt("");
      if (isCollapsed) setIsCollapsed(false);
    }
  }, [pendingPrompt, setPendingPrompt, isCollapsed]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Drag-to-resize
  const handleDragStart = (e) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const delta = dragStartX.current - e.clientX;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta)));
    };
    const handleMouseUp = (e) => {
      const delta = dragStartX.current - e.clientX;
      setWidth(snapToNearest(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta))));
      setIsDragging(false);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
  };

  const panelWidth = isCollapsed ? COLLAPSED_WIDTH : width;

  return (
    <aside
      style={{ width: panelWidth, minWidth: panelWidth, maxWidth: panelWidth }}
      className={`relative flex h-[100dvh] flex-col shadow-[-24px_0_60px_rgba(0,0,0,0.08)] transition-[width,min-width,max-width] duration-200 ${isDragging ? "select-none" : ""}`}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleDragStart}
        className={`absolute left-0 top-0 z-20 h-full w-1.5 cursor-col-resize transition-colors duration-150 hover:bg-brass/50 ${isDragging ? "bg-brass/60" : ""}`}
      />

      {/* ── Collapsed tab ─────────────────────────── */}
      {isCollapsed ? (
        <div className="flex h-full flex-col items-center justify-between bg-[#1a1e5e] py-6">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center rounded-xl p-2 text-white/50 transition hover:text-white"
            title="Expand chat"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em] text-brass/80"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Case Chat
          </span>
          <div className={`h-2 w-2 rounded-full shadow-lg ${isConnected ? "bg-emerald-400 shadow-emerald-400/50" : "bg-red-400"}`} />
        </div>
      ) : (
        <>
          {/* ── Header ────────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1e5e] to-[#24286f] px-6 pb-6 pt-5">
            {/* Decorative glow blobs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brass/20 blur-[60px]" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-indigo-400/10 blur-[50px]" />

            {/* Top row */}
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {/* Animated spark icon */}
                  <svg className="h-3 w-3 text-brass" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L4.5 13.5H11L9 22L19.5 10.5H13L13 2Z" />
                  </svg>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-brass/90">Legal Intelligence</p>
                </div>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white">Case Chat</h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Live / Offline badge */}
                <div className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                  isConnected
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                    : "bg-red-500/20 text-red-300 ring-1 ring-red-500/30"
                }`}>
                  {isConnected ? (
                    <>
                      {/* Ping ring */}
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      Live
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </>
                  )}
                </div>

                {/* Collapse */}
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="flex items-center justify-center rounded-xl p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                  title="Collapse chat"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Case selector */}
            <div className="relative mt-5 space-y-2">
              <label className="block text-[9px] font-bold uppercase tracking-[0.28em] text-white/40">
                Focused Case
              </label>
              <div className="relative">
                <select
                  value={focusedCaseNumber}
                  onChange={(e) => setFocusedCaseNumber(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-white/8 px-5 py-3 text-sm font-semibold text-white outline-none transition-all hover:border-white/20 focus:border-brass/60 focus:ring-2 focus:ring-brass/20"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                >
                  <option value="" style={{ background: "#24286f" }}>General Office Context</option>
                  {cases.map((c) => (
                    <option key={c.id || c.case_number} value={c.case_number} style={{ background: "#24286f" }}>
                      {c.case_number} — {c.case_title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] italic text-white/35">
                {focusedCase
                  ? `AI grounded to ${focusedCase.case_number}.`
                  : "Select a case to focus the AI on a specific matter."}
              </p>
            </div>
          </div>

          {/* ── Messages area ─────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-thumb-stone-200"
            style={{
              background: "radial-gradient(ellipse at top, rgba(36,40,111,0.04) 0%, transparent 65%), #faf9f7",
            }}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isTyping && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* AI avatar */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#24286f] to-[#3a3fa8] shadow-md">
                    <svg className="h-3.5 w-3.5 text-brass" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L4.5 13.5H11L9 22L19.5 10.5H13L13 2Z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-stone-100 bg-white px-4 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-brass/70 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brass/70 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brass/70 animate-bounce" />
                    <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      Thinking
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Input ─────────────────────────────────── */}
          <div className="border-t border-stone-100 bg-white px-5 pb-5 pt-4">
            <form
              onSubmit={handleSubmit}
              className="group flex items-end gap-3 rounded-[28px] border border-stone-200 bg-stone-50 p-2 transition-all focus-within:border-[#24286f]/30 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(36,40,111,0.08),0_8px_30px_-8px_rgba(36,40,111,0.15)]"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={focusedCase ? `Ask about ${focusedCase.case_number}…` : "Ask anything about your practice…"}
                rows={2}
                className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed text-ink outline-none placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-25 ${
                  input.trim()
                    ? "bg-gradient-to-br from-[#24286f] to-[#3a3fa8] shadow-[0_4px_20px_rgba(36,40,111,0.4)] hover:shadow-[0_4px_24px_rgba(36,40,111,0.55)] hover:scale-105"
                    : "bg-stone-300"
                }`}
              >
                <SendHorizonal className="h-4.5 w-4.5" />
              </button>
            </form>
            <p className="mt-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
