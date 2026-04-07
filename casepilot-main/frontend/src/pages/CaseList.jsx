import { useMemo, useState } from "react";
import CaseCard from "../components/CaseCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import { useCaseStore } from "../stores/caseStore";

export default function CaseList() {
  const [query, setQuery] = useState("");
  const { cases, isLoading } = useCaseStore();

  const filteredCases = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return cases;
    return cases.filter((item) =>
      [item.case_number, item.case_title, item.client_name, item.court_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [cases, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[36px] border border-stone-200/70 bg-white/85 p-7 shadow-panel md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Portfolio</p>
          <h1 className="mt-2 font-display text-4xl text-ink">All active cases</h1>
        </div>
        <div className="w-full max-w-md">
          <SearchBar value={query} onChange={setQuery} placeholder="Search by case number, title, or client..." />
        </div>
      </div>

      {isLoading ? <LoadingSpinner label="Loading case portfolio..." /> : null}

      {!isLoading && !filteredCases.length ? (
        <EmptyState
          title="No matching cases"
          description="Try a different case number, party name, or court."
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredCases.map((caseItem) => (
          <CaseCard key={caseItem.id || caseItem.case_number} caseItem={caseItem} />
        ))}
      </div>
    </div>
  );
}
