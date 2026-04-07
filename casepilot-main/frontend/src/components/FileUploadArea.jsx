import { UploadCloud } from "lucide-react";

const categories = [
  { value: "evidence", label: "Evidence" },
  { value: "drafts", label: "Drafts" },
  { value: "filings", label: "Filings" },
  { value: "correspondence", label: "Correspondence" },
  { value: "other", label: "Other" },
];

export default function FileUploadArea({
  selectedFile,
  category,
  notes,
  uploadedBy,
  uploading,
  statusMessage,
  errorMessage,
  onFileChange,
  onCategoryChange,
  onNotesChange,
  onUploadedByChange,
  onSubmit,
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-paper p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-white p-3 text-brass shadow-sm">
          <UploadCloud className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-2xl text-ink">Upload a case document</h3>
          <p className="mt-1 text-sm text-stone-600">
            Add filings, evidence, draft notes, or correspondence directly to this matter.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Choose file</span>
          <input
            type="file"
            onChange={onFileChange}
            className="mt-2 block w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Category</span>
            <select
              value={category}
              onChange={onCategoryChange}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Uploaded By</span>
            <input
              type="text"
              value={uploadedBy}
              onChange={onUploadedByChange}
              placeholder="Advocate"
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Notes</span>
          <textarea
            rows={4}
            value={notes}
            onChange={onNotesChange}
            placeholder="Short description, relevance, or filing context."
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-stone-600">
            {selectedFile ? `Selected: ${selectedFile.name}` : "No file selected yet."}
          </div>
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>

        {statusMessage ? <p className="text-sm font-medium text-emerald-700">{statusMessage}</p> : null}
        {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
