import { useEffect, useMemo, useState } from "react";
import { BookOpen, Scale, Sparkles } from "lucide-react";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../services/api";
import { useCaseStore } from "../stores/caseStore";
import { useChatStore } from "../stores/chatStore";

const SUGGESTED_PROMPTS = [
  "Summarize this case and identify the key legal issues",
  "Find relevant precedents for my case",
  "What are the strongest arguments for my client?",
  "What upcoming deadlines should I prepare for?",
  "Draft a research note on the main legal arguments",
  "What documents do I still need to file?",
];

const SUBJECT_OPTIONS = [
  { value: "property", label: "Property" },
  { value: "criminal", label: "Criminal" },
  { value: "family", label: "Family" },
  { value: "corporate", label: "Corporate" },
];

export default function Research() {
  const { cases, loadCases } = useCaseStore();
  const { focusedCaseNumber, setFocusedCaseNumber, setPendingPrompt } = useChatStore();
  const [selectedSubject, setSelectedSubject] = useState("property");
  const [precedents, setPrecedents] = useState([]);
  const [precedentsLoading, setPrecedentsLoading] = useState(true);
  const [precedentsError, setPrecedentsError] = useState("");

  useEffect(() => {
    if (!cases.length) loadCases();
  }, [cases.length, loadCases]);

  useEffect(() => {
    if (!focusedCaseNumber && cases.length) {
      setFocusedCaseNumber(cases[0].case_number);
    }
  }, [cases, focusedCaseNumber, setFocusedCaseNumber]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setPrecedentsLoading(true);
      setPrecedentsError("");
      try {
        const data = await api.getPrecedents(selectedSubject);
        if (mounted) setPrecedents(data.precedents || []);
      } catch {
        if (mounted) {
          setPrecedents([]);
          setPrecedentsError("Could not load precedents.");
        }
      } finally {
        if (mounted) setPrecedentsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedSubject]);

  const focusedCase = useMemo(
    () => cases.find((c) => c.case_number === focusedCaseNumber) || null,
    [cases, focusedCaseNumber]
  );

  const sendPrompt = (prompt) => {
    const full = focusedCase
      ? `[${focusedCase.case_number} – ${focusedCase.case_title}] ${prompt}`
      : prompt;
    setPendingPrompt(full);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">AI Research</p>
        <h1 className="mt-1.5 font-display text-3xl text-ink">Research Workspace</h1>
        <p className="mt-2 text-sm leading-7 text-stone-600">
          Select a case, click a prompt, or type directly in the chat panel on the right to start researching.
        </p>

        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
            Focused Case
          </label>
          <select
            value={focusedCaseNumber}
            onChange={(e) => setFocusedCaseNumber(e.target.value)}
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-brass focus:ring-4 focus:ring-brass/5"
          >
            <option value="">General Office Context</option>
            {cases.map((c) => (
              <option key={c.id || c.case_number} value={c.case_number}>
                {c.case_number} — {c.case_title}
              </option>
            ))}
          </select>
          {focusedCase && (
            <p className="mt-2 text-xs text-stone-500">
              {focusedCase.court_name}
              {focusedCase.case_type ? ` · ${focusedCase.case_type}` : ""}
            </p>
          )}
        </div>
      </section>

      {/* Suggested Prompts */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-brass" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Quick Prompts</p>
        </div>
        <p className="mb-4 text-sm text-stone-500">
          Click any prompt — it will appear in the chat ready to send.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendPrompt(prompt)}
              className="rounded-full border border-stone-200 bg-paper px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-brass/60 hover:bg-brass/5 hover:text-ink"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      {/* Precedents */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-brass" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Precedents Library</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSelectedSubject(s.value)}
                className={[
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                  selectedSubject === s.value
                    ? "bg-ink text-white"
                    : "bg-paper text-stone-700 hover:bg-stone-200",
                ].join(" ")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {precedentsLoading && <LoadingSpinner label="Loading precedents..." />}
        {!precedentsLoading && precedentsError && (
          <p className="text-sm text-red-700">{precedentsError}</p>
        )}
        {!precedentsLoading && !precedentsError && !precedents.length && (
          <EmptyState
            title="No precedents in this subject yet"
            description="Try another subject area or seed more authorities into the precedent library."
          />
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {!precedentsLoading &&
            precedents.map((p) => (
              <article key={p.id} className="rounded-[24px] border border-stone-200 bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">
                  {p.case_citation || p.year || "Authority"}
                </p>
                <h3 className="mt-1.5 font-semibold text-ink">{p.case_name}</h3>
                <p className="mt-1 text-xs text-stone-500">
                  {p.court}
                  {p.year ? ` · ${p.year}` : ""}
                </p>
                <p className="mt-2 text-xs leading-6 text-stone-600 line-clamp-3">{p.summary}</p>
                <div className="mt-3 rounded-xl border border-stone-100 bg-white px-3 py-2 text-xs text-stone-600">
                  <span className="font-semibold text-ink">Key: </span>
                  {p.key_principles}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    sendPrompt(
                      `Tell me more about ${p.case_name} (${p.case_citation}) and how it applies to my case`
                    )
                  }
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-brass/50 hover:text-ink"
                >
                  <BookOpen className="h-3 w-3" />
                  Ask about this case
                </button>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
