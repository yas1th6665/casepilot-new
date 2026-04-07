import { useMemo, useState } from "react";
import { Link2, NotebookPen, Save } from "lucide-react";
import { api } from "../services/api";
import { useCaseStore } from "../stores/caseStore";
import { useChatStore } from "../stores/chatStore";

function extractUrls(text) {
  return text.match(/https?:\/\/[^\s)]+/g) || [];
}

function AIAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#24286f] to-[#3a3fa8] shadow-md shadow-indigo-200/50">
      <svg className="h-3.5 w-3.5 text-brass" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L4.5 13.5H11L9 22L19.5 10.5H13L13 2Z" />
      </svg>
    </div>
  );
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const { cases } = useCaseStore();
  const { focusedCaseNumber } = useChatStore();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [targetCaseNumber, setTargetCaseNumber] = useState(message.caseContext?.case_number || focusedCaseNumber || "");
  const [noteType, setNoteType] = useState("research");
  const [noteTitle, setNoteTitle] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [linkCaseNumber, setLinkCaseNumber] = useState(message.caseContext?.case_number || focusedCaseNumber || "");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkCategory, setLinkCategory] = useState("orders");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkState, setLinkState] = useState("idle");

  const urls = useMemo(() => extractUrls(message.text || ""), [message.text]);
  const defaultTitle = useMemo(() =>
    message.caseContext?.case_number
      ? `Research note - ${message.caseContext.case_number}`
      : "Research note from AI Clerk",
    [message.caseContext]
  );

  const canSave = !isUser && !isSystem && message.id !== "welcome";

  const saveToCase = async (e) => {
    e.preventDefault();
    if (!targetCaseNumber || !(message.text || "").trim()) { setSaveState("error"); return; }
    setSaveState("saving");
    try {
      await api.saveCaseNote({
        case_number: targetCaseNumber,
        title: noteTitle.trim() || defaultTitle,
        content: message.text.trim(),
        note_type: noteType,
        author: "AI Clerk",
      });
      setSaveState("saved");
      setShowSaveForm(false);
      setNoteTitle("");
    } catch {
      setSaveState("error");
    }
  };

  const attachLink = async (e) => {
    e.preventDefault();
    const finalUrl = (linkUrl || urls[0] || "").trim();
    if (!linkCaseNumber || !finalUrl) { setLinkState("error"); return; }
    setLinkState("saving");
    try {
      await api.attachCaseFileLink({
        case_number: linkCaseNumber,
        title: linkTitle.trim() || "Court order / external document",
        source_url: finalUrl,
        category: linkCategory,
        uploaded_by: "AI Clerk",
        source_label: "External / eCourts",
        document_type: linkCategory,
        notes: `Attached from AI Clerk chat.\n\n${message.text}`.trim(),
      });
      setLinkState("saved");
      setShowAttachForm(false);
      setLinkTitle("");
      if (!urls.length) setLinkUrl("");
    } catch {
      setLinkState("error");
    }
  };

  // ── System message ────────────────────────────────
  if (isSystem) {
    return (
      <div className="px-2 py-1 text-center text-[11px] italic text-stone-400 animate-in fade-in duration-300">
        {message.text}
      </div>
    );
  }

  // ── User message ──────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-400">
        <div className="max-w-[82%] rounded-[22px] rounded-br-md bg-gradient-to-br from-[#24286f] to-[#3a3fa8] px-4 py-3 text-sm leading-relaxed text-white shadow-lg shadow-indigo-200/40">
          <p className="whitespace-pre-wrap font-medium">{message.text}</p>
        </div>
      </div>
    );
  }

  // ── AI message ────────────────────────────────────
  return (
    <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <AIAvatar />

      <div className="min-w-0 flex-1">
        {/* Label */}
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#24286f]/50">
          Casepilot AI
        </p>

        {/* Bubble */}
        <div className="rounded-[20px] rounded-tl-md border border-stone-100 bg-white px-4 py-3.5 shadow-sm shadow-stone-100 ring-1 ring-inset ring-stone-50">
          {/* Brass left accent */}
          <div className="absolute -left-px top-4 h-6 w-0.5 rounded-full bg-brass/60" style={{ position: "relative", display: "none" }} />

          <p className="whitespace-pre-wrap text-sm leading-7 text-stone-800">{message.text}</p>

          {/* Case context tag */}
          {message.caseContext?.case_number && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              <span className="h-1.5 w-1.5 rounded-full bg-brass/60" />
              {message.caseContext.case_number}
            </div>
          )}

          {/* Tool actions used */}
          {message.actions?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {message.actions.map((action, i) => (
                <span key={i} className="rounded-md bg-brass/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brass/80"
                  style={{ background: "rgba(169,122,43,0.08)" }}>
                  {action.tool_name.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}

          {/* Save / Attach buttons */}
          {canSave && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-50 pt-3">
              <button
                type="button"
                onClick={() => { setShowSaveForm((v) => { if (!v) setShowAttachForm(false); return !v; }); setSaveState("idle"); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-indigo-50 hover:text-[#24286f]"
              >
                <Save className="h-3 w-3" />
                Save to case
              </button>
              <button
                type="button"
                onClick={() => { setShowAttachForm((v) => { if (!v) setShowSaveForm(false); return !v; }); setLinkState("idle"); if (urls[0] && !linkUrl) setLinkUrl(urls[0]); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-indigo-50 hover:text-[#24286f]"
              >
                <Link2 className="h-3 w-3" />
                Attach link
              </button>
            </div>
          )}
        </div>

        {/* Save form */}
        {showSaveForm && (
          <form onSubmit={saveToCase} className="mt-2 space-y-3 rounded-[18px] border border-stone-100 bg-stone-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                <NotebookPen className="h-3 w-3" />
                Save to case notes
              </div>
              <button type="button" onClick={() => setShowSaveForm(false)} className="text-[10px] text-stone-400 hover:text-ink">Cancel</button>
            </div>
            <select value={targetCaseNumber} onChange={(e) => setTargetCaseNumber(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-brass">
              <option value="">Choose case</option>
              {cases.map((c) => <option key={c.id || c.case_number} value={c.case_number}>{c.case_number} — {c.case_title}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder={defaultTitle}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-brass" />
              <select value={noteType} onChange={(e) => setNoteType(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-brass">
                <option value="research">Research</option>
                <option value="strategy">Strategy</option>
                <option value="general">General</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <p className="flex-1 text-[10px] text-stone-500">
                {saveState === "saved" ? "Saved." : saveState === "error" ? "Choose a case first." : ""}
              </p>
              <button type="submit" className="rounded-full bg-[#24286f] px-4 py-1.5 text-xs font-semibold text-white">
                {saveState === "saving" ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}

        {/* Attach link form */}
        {showAttachForm && (
          <form onSubmit={attachLink} className="mt-2 space-y-3 rounded-[18px] border border-stone-100 bg-stone-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Attach document link</span>
              <button type="button" onClick={() => setShowAttachForm(false)} className="text-[10px] text-stone-400 hover:text-ink">Cancel</button>
            </div>
            <select value={linkCaseNumber} onChange={(e) => setLinkCaseNumber(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-brass">
              <option value="">Choose case</option>
              {cases.map((c) => <option key={c.id || c.case_number} value={c.case_number}>{c.case_number} — {c.case_title}</option>)}
            </select>
            <input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="Order dated 05 Apr 2026"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-brass" />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder={urls[0] || "Paste eCourts / document URL"}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-brass" />
            <select value={linkCategory} onChange={(e) => setLinkCategory(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-brass">
              <option value="orders">Orders</option>
              <option value="judgments">Judgments</option>
              <option value="research">Research</option>
              <option value="filings">Filings</option>
              <option value="other">Other</option>
            </select>
            <div className="flex justify-end gap-2">
              <p className="flex-1 text-[10px] text-stone-500">
                {linkState === "saved" ? "Attached." : linkState === "error" ? "Choose a case and URL." : ""}
              </p>
              <button type="submit" className="rounded-full bg-[#24286f] px-4 py-1.5 text-xs font-semibold text-white">
                {linkState === "saving" ? "Attaching…" : "Attach"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
