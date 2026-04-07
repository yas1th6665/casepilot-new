import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import FileCard from "../components/FileCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../services/api";
import { useCaseStore } from "../stores/caseStore";

export default function Files() {
  const { cases } = useCaseStore();
  const [filesByCase, setFilesByCase] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFiles() {
      if (!cases.length) {
        if (mounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const results = await Promise.allSettled(
          cases.map(async (caseItem) => {
            const response = await api.getCaseFiles(caseItem.case_number);
            return [caseItem.case_number, response.files || []];
          })
        );

        if (mounted) {
          const successfulEntries = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          setFilesByCase(Object.fromEntries(successfulEntries));

          if (results.every((result) => result.status === "rejected")) {
            setErrorMessage("Unable to load file workspace right now.");
          } else if (results.some((result) => result.status === "rejected")) {
            setErrorMessage("Some case files could not be loaded, but the available document workspace is shown below.");
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadFiles();

    return () => {
      mounted = false;
    };
  }, [cases]);

  const totalFiles = useMemo(
    () => Object.values(filesByCase).reduce((count, items) => count + items.length, 0),
    [filesByCase]
  );

  if (isLoading) {
    return <LoadingSpinner label="Loading file workspace..." />;
  }

  return (
    <div className="space-y-8">
      {errorMessage ? <div className="text-sm text-red-700">{errorMessage}</div> : null}
      <section className="rounded-[36px] border border-stone-200/70 bg-white/85 p-7 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">File Workspace</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Matter Documents</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          Review uploaded case files across the office and jump straight into a matter when you need to add or organize documents.
        </p>
        <div className="mt-5 rounded-[24px] bg-paper px-5 py-4 text-sm text-stone-700">
          {totalFiles} documents indexed across {cases.length} active cases.
        </div>
      </section>

      {!totalFiles ? (
        <EmptyState
          title="No uploaded case documents yet"
          description="Open any case and use the Documents tab to upload filings, evidence, or correspondence."
        />
      ) : null}

      <section className="space-y-6">
        {cases.map((caseItem) => {
          const caseFiles = filesByCase[caseItem.case_number] || [];
          if (!caseFiles.length) return null;

          return (
            <div key={caseItem.case_number} className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{caseItem.case_number}</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">{caseItem.case_title}</h2>
                </div>
                <Link
                  to={`/cases/${encodeURIComponent(caseItem.case_number)}`}
                  className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
                >
                  Open case documents
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {caseFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    downloadUrl={api.getCaseFileDownloadUrl(file.id)}
                    deleting={false}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
