import { useMemo } from "react";

const EVENT_STYLES = {
  case_filed: {
    tone: "border-blue-300 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  hearing_completed: {
    tone: "border-emerald-300 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  hearing_scheduled: {
    tone: "border-orange-300 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  task_created: {
    tone: "border-stone-300 bg-stone-100 text-stone-700",
    dot: "bg-stone-500",
  },
  task_completed: {
    tone: "border-emerald-300 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  task_overdue: {
    tone: "border-red-300 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  note_added: {
    tone: "border-violet-300 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  file_uploaded: {
    tone: "border-amber-300 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
};

function normalizeDate(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (value?.seconds) {
    return new Date(value.seconds * 1000);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(value) {
  const date = normalizeDate(value);
  return date ? date.toISOString() : null;
}

export function useCaseTimeline({ caseItem, hearings, tasks, notes, files = [] }) {
  return useMemo(() => {
    if (!caseItem) return [];

    const today = new Date();
    const events = [];

    if (caseItem.filing_date) {
      events.push({
        id: `case-filed-${caseItem.case_number}`,
        date: isoDate(caseItem.filing_date),
        type: "case_filed",
        title: "Case Filed",
        description: `Filed at ${caseItem.court_name}. Case type: ${caseItem.case_type}.`,
      });
    }

    hearings.forEach((hearing) => {
      events.push({
        id: `hearing-${hearing.id}`,
        date: isoDate(hearing.hearing_date),
        type: hearing.status === "completed" ? "hearing_completed" : "hearing_scheduled",
        title: `Hearing — ${hearing.purpose}`,
        description:
          hearing.status === "completed"
            ? hearing.outcome || `${hearing.hearing_time} | ${hearing.court_room}`
            : `${hearing.hearing_time} | ${hearing.court_room}`,
      });
    });

    tasks.forEach((task) => {
      const createdDate = isoDate(task.created_at) || isoDate(task.due_date);
      events.push({
        id: `task-created-${task.id}`,
        date: createdDate,
        type: "task_created",
        title: `Task Created — ${task.title}`,
        description: `Assigned to ${task.assigned_to}. Due ${task.due_date}.`,
      });

      if (task.status === "completed" && task.completed_at) {
        events.push({
          id: `task-completed-${task.id}`,
          date: isoDate(task.completed_at),
          type: "task_completed",
          title: `Task Completed — ${task.title}`,
          description: `${task.assigned_to} marked this work complete.`,
        });
      }

      const dueDate = normalizeDate(task.due_date);
      if (dueDate && dueDate < today && task.status !== "completed") {
        events.push({
          id: `task-overdue-${task.id}`,
          date: isoDate(task.due_date),
          type: "task_overdue",
          title: `Task Overdue — ${task.title}`,
          description: `${task.assigned_to} has not completed this task.`,
        });
      }
    });

    notes.forEach((note) => {
      events.push({
        id: `note-${note.id}`,
        date: isoDate(note.created_at) || isoDate(caseItem.filing_date),
        type: "note_added",
        title: note.title,
        description: `${note.note_type || "note"} by ${note.author || "team"}`,
      });
    });

    files.forEach((file) => {
      events.push({
        id: `file-${file.id}`,
        date: isoDate(file.uploaded_at),
        type: "file_uploaded",
        title: `Document Uploaded - ${file.original_name || file.filename}`,
        description: `${file.category || "other"} document added by ${file.uploaded_by || "team"}.`,
      });
    });

    return events
      .filter((event) => event.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((event) => {
        const eventDate = new Date(event.date);
        const isFuture = eventDate > today;
        return {
          ...event,
          isFuture,
          styles: EVENT_STYLES[event.type] || EVENT_STYLES.task_created,
        };
      });
  }, [caseItem, hearings, tasks, notes, files]);
}
