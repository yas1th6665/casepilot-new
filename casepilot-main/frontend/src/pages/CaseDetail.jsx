import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus2, FileStack, FolderOpen, NotebookPen, Plus, Sparkles, SquareCheckBig } from "lucide-react";
import CalendarSyncButton from "../components/CalendarSyncButton";
import CaseTimeline from "../components/CaseTimeline";
import EmptyState from "../components/EmptyState";
import FileCard from "../components/FileCard";
import FileUploadArea from "../components/FileUploadArea";
import HearingCard from "../components/HearingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import TaskCard from "../components/TaskCard";
import TaskSyncButton from "../components/TaskSyncButton";
import { useCaseData } from "../hooks/useCaseData";
import { useCaseTimeline } from "../hooks/useCaseTimeline";
import { api } from "../services/api";
import { formatIndianDate } from "../utils/dateFormat";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "hearings", label: "Hearings" },
  { id: "tasks", label: "Tasks" },
  { id: "documents", label: "Documents" },
];

export default function CaseDetail() {
  const { caseNumber } = useParams();
  const { caseItem, hearings, tasks } = useCaseData(caseNumber);
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [noteContent, setNoteContent] = useState("");
  const [noteStatus, setNoteStatus] = useState("idle");
  const [bulkCalendarState, setBulkCalendarState] = useState("idle");
  const [bulkTaskState, setBulkTaskState] = useState("idle");
  const [hearingSyncStates, setHearingSyncStates] = useState({});
  const [taskSyncStates, setTaskSyncStates] = useState({});
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileCategory, setFileCategory] = useState("other");
  const [fileNotes, setFileNotes] = useState("");
  const [uploadedBy, setUploadedBy] = useState("Advocate");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState("");
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [deletingFileId, setDeletingFileId] = useState("");
  const [externalTitle, setExternalTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalCategory, setExternalCategory] = useState("orders");
  const [attachingExternal, setAttachingExternal] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!caseNumber) {
      setNotes([]);
      setNotesLoading(false);
      return undefined;
    }

    setNotesLoading(true);
    api
      .getCaseNotes(caseNumber)
      .then((data) => {
        if (mounted) setNotes(data.notes || []);
      })
      .catch(() => {
        if (mounted) setNotes([]);
      })
      .finally(() => {
        if (mounted) setNotesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [caseNumber]);

  useEffect(() => {
    let mounted = true;

    if (!caseNumber) {
      setFiles([]);
      setFilesLoading(false);
      return undefined;
    }

    setFilesLoading(true);
    api
      .getCaseFiles(caseNumber)
      .then((data) => {
        if (mounted) setFiles(data.files || []);
      })
      .catch(() => {
        if (mounted) setFiles([]);
      })
      .finally(() => {
        if (mounted) setFilesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [caseNumber]);

  const timeline = useCaseTimeline({ caseItem, hearings, tasks, notes, files });

  const stats = useMemo(() => {
    const upcomingHearings = hearings.filter((item) => item.status === "scheduled").length;
    const completedHearings = hearings.filter((item) => item.status === "completed").length;
    const pendingTasks = tasks.filter((item) => item.status !== "completed").length;
    return {
      upcomingHearings,
      completedHearings,
      pendingTasks,
      uploadedFiles: files.length,
    };
  }, [files.length, hearings, tasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    return tasks.filter((task) => new Date(task.due_date) < today && task.status !== "completed");
  }, [tasks]);

  const upcomingHearings = hearings.filter((item) => item.status === "scheduled");
  const pastHearings = hearings.filter((item) => item.status === "completed");
  const inProgressTasks = tasks.filter((item) => item.status === "in_progress");
  const pendingTasks = tasks.filter((item) => taskIsPending(item));

  const syncHearing = async (hearingId) => {
    setHearingSyncStates((state) => ({ ...state, [hearingId]: "loading" }));
    try {
      const result = await api.syncHearingToCalendar(hearingId);
      setHearingSyncStates((state) => ({
        ...state,
        [hearingId]: result.status === "success" ? "success" : result.status,
      }));
    } catch {
      setHearingSyncStates((state) => ({ ...state, [hearingId]: "error" }));
    }
  };

  const syncTask = async (taskId) => {
    setTaskSyncStates((state) => ({ ...state, [taskId]: "loading" }));
    try {
      const result = await api.syncTaskToGoogle(taskId);
      setTaskSyncStates((state) => ({
        ...state,
        [taskId]: result.status === "success" ? "success" : result.status,
      }));
    } catch {
      setTaskSyncStates((state) => ({ ...state, [taskId]: "error" }));
    }
  };

  const syncAllCaseHearings = async () => {
    setBulkCalendarState("loading");
    try {
      const result = await api.syncAllHearings();
      setBulkCalendarState(result.status === "success" ? "success" : result.status);
    } catch {
      setBulkCalendarState("error");
    }
  };

  const syncAllCaseTasks = async () => {
    setBulkTaskState("loading");
    try {
      const result = await api.syncAllTasks();
      setBulkTaskState(result.status === "success" ? "success" : result.status);
    } catch {
      setBulkTaskState("error");
    }
  };

  const uploadDocument = async (event) => {
    event.preventDefault();

    if (!selectedFile || !caseNumber) {
      setUploadErrorMessage("Choose a file before uploading.");
      setUploadStatusMessage("");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("case_number", caseNumber);
    formData.append("category", fileCategory);
    formData.append("uploaded_by", uploadedBy || "Advocate");
    formData.append("notes", fileNotes);

    setUploadingFile(true);
    setUploadErrorMessage("");
    setUploadStatusMessage("");

    try {
      const result = await api.uploadCaseFile(formData);
      setFiles((current) => [result.file, ...current]);
      setSelectedFile(null);
      setFileCategory("other");
      setFileNotes("");
      setUploadStatusMessage("Document uploaded successfully.");
    } catch {
      setUploadErrorMessage("Upload failed. Please try again.");
      setUploadStatusMessage("");
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteDocument = async (fileId) => {
    setDeletingFileId(fileId);
    try {
      await api.deleteCaseFile(fileId);
      setFiles((current) => current.filter((item) => item.id !== fileId));
    } catch {
      setUploadErrorMessage("Could not delete that document right now.");
      setUploadStatusMessage("");
    } finally {
      setDeletingFileId("");
    }
  };

  const attachExternalDocument = async (event) => {
    event.preventDefault();

    if (!caseNumber || !externalUrl.trim()) {
      setUploadErrorMessage("Add a document URL before attaching it.");
      setUploadStatusMessage("");
      return;
    }

    setAttachingExternal(true);
    setUploadErrorMessage("");
    setUploadStatusMessage("");

    try {
      const result = await api.attachCaseFileLink({
        case_number: caseNumber,
        title: externalTitle.trim() || "External court document",
        source_url: externalUrl.trim(),
        category: externalCategory,
        uploaded_by: uploadedBy || "Advocate",
        source_label: "External / eCourts",
        document_type: externalCategory,
        notes: fileNotes || "Attached from external court/document source.",
      });
      setFiles((current) => [result.file, ...current]);
      setExternalTitle("");
      setExternalUrl("");
      setExternalCategory("orders");
      setUploadStatusMessage("External document link attached successfully.");
    } catch {
      setUploadErrorMessage("Could not attach that document link.");
      setUploadStatusMessage("");
    } finally {
      setAttachingExternal(false);
    }
  };

  const saveNote = async (event) => {
    event.preventDefault();

    if (!caseNumber || !noteContent.trim()) {
      setNoteStatus("error");
      return;
    }

    setNoteStatus("saving");
    try {
      const result = await api.saveCaseNote({
        case_number: caseNumber,
        title: noteTitle.trim() || "Case Note",
        content: noteContent.trim(),
        note_type: noteType,
        author: uploadedBy || "Advocate",
      });
      setNotes((current) => [...current, result.note]);
      setNoteTitle("");
      setNoteType("general");
      setNoteContent("");
      setAddingNote(false);
      setNoteStatus("saved");
    } catch {
      setNoteStatus("error");
    }
  };

  if (!caseItem) {
    return (
      <EmptyState
        title="Case not loaded yet"
        description="Open this page after the case portfolio has loaded, or verify the case number in the URL."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/cases" className="inline-flex items-center gap-2 text-sm font-semibold text-wine">
        <ArrowLeft className="h-4 w-4" />
        Back to cases
      </Link>

      <section className="rounded-[36px] border border-stone-200/70 bg-white/85 p-7 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">{caseItem.case_number}</p>
        <h1 className="mt-2 font-display text-4xl text-ink">{caseItem.case_title}</h1>
        <p className="mt-3 text-sm text-stone-600">
          {caseItem.court_name} | {caseItem.case_type} | Filed {formatIndianDate(caseItem.filing_date)}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <PriorityBadge priority={caseItem.priority} />
          <StatusBadge status={caseItem.status} />
        </div>
      </section>

      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-3 shadow-panel">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "rounded-[20px] px-4 py-3 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "bg-ink text-white shadow-sm"
                  : "bg-transparent text-stone-600 hover:bg-paper hover:text-ink",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
              <h2 className="font-display text-2xl text-ink">Case information</h2>
              <dl className="mt-5 grid gap-x-6 gap-y-4 text-sm text-stone-700 md:grid-cols-2">
                <InfoRow label="Case Number" value={caseItem.case_number} />
                <InfoRow label="Case Title" value={caseItem.case_title} />
                <InfoRow label="Court" value={caseItem.court_name} />
                <InfoRow label="Court Type" value={caseItem.court_type} />
                <InfoRow label="Case Type" value={caseItem.case_type} />
                <InfoRow label="Judge" value={caseItem.judge_name} />
                <InfoRow label="Client" value={caseItem.client_name} />
                <InfoRow label="Opponent" value={caseItem.opponent_name} />
                <InfoRow label="Opponent Lawyer" value={caseItem.opponent_lawyer} />
                <InfoRow label="Filing Date" value={formatIndianDate(caseItem.filing_date)} />
                <InfoRow label="Priority" value={capitalize(caseItem.priority)} />
                <InfoRow label="Status" value={capitalize(caseItem.status)} />
              </dl>

              <div className="mt-8 rounded-[24px] bg-paper p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Internal Notes</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">{caseItem.notes || "No internal notes yet."}</p>
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
                <h2 className="font-display text-2xl text-ink">Quick stats</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <StatCard icon={CalendarPlus2} value={stats.upcomingHearings} label="Upcoming Hearings" />
                  <StatCard icon={Sparkles} value={stats.completedHearings} label="Completed Hearings" />
                  <StatCard icon={SquareCheckBig} value={stats.pendingTasks} label="Pending Tasks" />
                  <StatCard icon={FolderOpen} value={stats.uploadedFiles} label="Files Uploaded" />
                </div>
              </section>

              <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-ink">Case notes</h2>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAddingNote((value) => !value);
                        setNoteStatus("idle");
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
                    >
                      <Plus className="h-4 w-4" />
                      {addingNote ? "Close" : "Add Note"}
                    </button>
                    <NotebookPen className="h-5 w-5 text-brass" />
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {addingNote ? (
                    <form onSubmit={saveNote} className="rounded-[24px] border border-stone-200 bg-paper p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-ink">
                          Note title
                          <input
                            value={noteTitle}
                            onChange={(event) => setNoteTitle(event.target.value)}
                            placeholder="Hearing prep note"
                            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
                          />
                        </label>
                        <label className="block text-sm font-semibold text-ink">
                          Type
                          <select
                            value={noteType}
                            onChange={(event) => setNoteType(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
                          >
                            <option value="general">General</option>
                            <option value="research">Research</option>
                            <option value="strategy">Strategy</option>
                            <option value="meeting">Meeting</option>
                          </select>
                        </label>
                      </div>

                      <label className="mt-4 block text-sm font-semibold text-ink">
                        Note content
                        <textarea
                          rows={5}
                          value={noteContent}
                          onChange={(event) => setNoteContent(event.target.value)}
                          placeholder="Write the case note here..."
                          className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
                        />
                      </label>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <p className="text-sm text-stone-600">
                          {noteStatus === "saved"
                            ? "Note saved."
                            : noteStatus === "error"
                              ? "Please add note content before saving."
                              : "Notes saved here will appear in the case timeline as well."}
                        </p>
                        <button
                          type="submit"
                          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                        >
                          {noteStatus === "saving" ? "Saving..." : "Save Note"}
                        </button>
                      </div>
                    </form>
                  ) : null}
                  {notesLoading ? <LoadingSpinner label="Loading case notes..." /> : null}
                  {!notesLoading && !notes.length ? (
                    <EmptyState
                      title="No case notes"
                      description="Research notes, meeting notes, and observations will show up here."
                    />
                  ) : null}
                  {!notesLoading &&
                    notes.map((note) => (
                      <div key={note.id} className="rounded-[24px] border border-stone-200 bg-paper p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                          {note.note_type || "note"}
                        </p>
                        <h3 className="mt-2 font-semibold text-ink">{note.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-700">{note.content}</p>
                        <p className="mt-3 text-xs text-stone-500">By {note.author || "team"}</p>
                      </div>
                    ))}
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "timeline" ? (
        <CaseTimeline caseTitle={caseItem.case_title} caseNumber={caseItem.case_number} events={timeline} />
      ) : null}

      {activeTab === "hearings" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Upcoming hearings</h2>
              <div className="flex items-center gap-3">
                <button type="button" className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink">
                  <Plus className="h-4 w-4" />
                  Add Hearing
                </button>
                <CalendarSyncButton onClick={syncAllCaseHearings} state={bulkCalendarState} />
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {upcomingHearings.length ? (
                upcomingHearings.map((hearing) => (
                  <HearingCard
                    key={hearing.id}
                    hearing={hearing}
                    syncState={hearingSyncStates[hearing.id] || (hearing.calendar_synced ? "success" : "idle")}
                    onSync={() => syncHearing(hearing.id)}
                  />
                ))
              ) : (
                <EmptyState title="No upcoming hearings" description="Scheduled hearings for this case will show up here." />
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
            <h2 className="font-display text-2xl text-ink">Past hearings</h2>
            <div className="mt-5 space-y-4">
              {pastHearings.length ? (
                pastHearings.map((hearing) => <HearingCard key={hearing.id} hearing={hearing} />)
              ) : (
                <EmptyState title="No completed hearings" description="Completed hearing history will show up here." />
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "tasks" ? (
        <div className="space-y-6">
          <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Tasks for {caseItem.case_number}</h2>
              <div className="flex items-center gap-3">
                <button type="button" className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink">
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
                <TaskSyncButton onClick={syncAllCaseTasks} state={bulkTaskState} />
              </div>
            </div>
          </section>

          <TaskSection
            title="Overdue"
            tasks={overdueTasks}
            emptyText="Nothing overdue for this matter."
            syncStates={taskSyncStates}
            onSync={syncTask}
          />
          <TaskSection
            title="In Progress"
            tasks={inProgressTasks}
            emptyText="No tasks are currently in progress."
            syncStates={taskSyncStates}
            onSync={syncTask}
          />
          <TaskSection
            title="Pending"
            tasks={pendingTasks}
            emptyText="No pending tasks for this matter."
            syncStates={taskSyncStates}
            onSync={syncTask}
          />
        </div>
      ) : null}

      {activeTab === "documents" ? (
        <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Case Documents</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Document workspace</h2>
            </div>
            <FileStack className="h-6 w-6 text-brass" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              <FileUploadArea
                selectedFile={selectedFile}
                category={fileCategory}
                notes={fileNotes}
                uploadedBy={uploadedBy}
                uploading={uploadingFile}
                statusMessage={uploadStatusMessage}
                errorMessage={uploadErrorMessage}
                onFileChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                onCategoryChange={(event) => setFileCategory(event.target.value)}
                onNotesChange={(event) => setFileNotes(event.target.value)}
                onUploadedByChange={(event) => setUploadedBy(event.target.value)}
                onSubmit={uploadDocument}
              />

              <form onSubmit={attachExternalDocument} className="rounded-[28px] border border-stone-200 bg-paper p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Attach from Court Source</p>
                    <h3 className="mt-2 font-display text-2xl text-ink">Link an order or external document</h3>
                  </div>
                  <FolderOpen className="h-5 w-5 text-brass" />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-ink">
                    Document title
                    <input
                      value={externalTitle}
                      onChange={(event) => setExternalTitle(event.target.value)}
                      placeholder="Order dated 05 Apr 2026"
                      className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-ink">
                    Category
                    <select
                      value={externalCategory}
                      onChange={(event) => setExternalCategory(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
                    >
                      <option value="orders">Orders</option>
                      <option value="judgments">Judgments</option>
                      <option value="research">Research</option>
                      <option value="filings">Filings</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>

                <label className="mt-4 block text-sm font-semibold text-ink">
                  Document URL
                  <input
                    value={externalUrl}
                    onChange={(event) => setExternalUrl(event.target.value)}
                    placeholder="Paste eCourts or external document link"
                    className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brass"
                  />
                </label>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-stone-600">
                    Attached links appear beside uploaded files and can be opened from this case workspace.
                  </p>
                  <button
                    type="submit"
                    className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                  >
                    {attachingExternal ? "Attaching..." : "Attach Link"}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {filesLoading ? <LoadingSpinner label="Loading case documents..." /> : null}
                {!filesLoading && !files.length ? (
                  <EmptyState
                    title="No documents yet"
                    description="Upload the first filing, evidence packet, or correspondence for this case."
                  />
                ) : null}
                {!filesLoading &&
                  files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      downloadUrl={api.getCaseFileDownloadUrl(file.id)}
                      deleting={deletingFileId === file.id}
                      onDelete={() => deleteDocument(file.id)}
                    />
                  ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-stone-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Storage summary</p>
                <div className="mt-4 space-y-3 text-sm text-stone-700">
                  <p>{files.length} documents attached to this case</p>
                  <p>{stats.uploadedFiles} indexed files in the case workspace</p>
                  <p>Downloads are available directly from each document card</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-stone-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Suggested categories</p>
                <div className="mt-4 space-y-3 text-sm text-stone-700">
                  <p>Evidence</p>
                  <p>Drafts</p>
                  <p>Filings</p>
                  <p>Correspondence</p>
                  <p>Other</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{label}</dt>
      <dd className="mt-1">{value || "-"}</dd>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-paper p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{label}</p>
        <Icon className="h-4 w-4 text-brass" />
      </div>
      <p className="mt-4 font-display text-4xl text-ink">{value}</p>
    </div>
  );
}

function TaskSection({ title, tasks, emptyText, syncStates, onSync }) {
  return (
    <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-5 space-y-4">
        {tasks.length ? tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            syncState={syncStates?.[task.id] || (task.google_tasks_synced ? "success" : "idle")}
            onSync={() => onSync?.(task.id)}
          />
        )) : <EmptyState title={`No ${title.toLowerCase()} tasks`} description={emptyText} />}
      </div>
    </section>
  );
}

function capitalize(value) {
  if (!value) return "-";
  return String(value).replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function taskIsPending(task) {
  return task.status === "pending";
}
