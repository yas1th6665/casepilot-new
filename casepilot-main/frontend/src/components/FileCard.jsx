import { Download, FileText, Trash2 } from "lucide-react";
import { formatHumanDate } from "../utils/dateFormat";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCategory(value) {
  if (!value) return "Other";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function FileCard({ file, downloadUrl, deleting, onDelete }) {
  const canDelete = typeof onDelete === "function";
  const isExternal = file.storage_mode === "external" || Boolean(file.source_url);

  return (
    <article className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="rounded-2xl bg-paper p-3 text-brass">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{file.original_name || file.filename}</p>
            <p className="mt-1 text-sm text-stone-600">
              {formatCategory(file.category)} | {formatFileSize(file.file_size)}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {isExternal ? "Linked" : "Uploaded"} {formatHumanDate(file.uploaded_at)} by {file.uploaded_by || "team"}
            </p>
            {file.source_label ? <p className="mt-1 text-xs text-stone-500">Source: {file.source_label}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
          >
            <Download className="h-4 w-4" />
            {isExternal ? "Open Source" : "Download"}
          </a>
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-red-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>
      </div>

      {file.notes ? <p className="mt-4 text-sm leading-6 text-stone-700">{file.notes}</p> : null}
    </article>
  );
}
