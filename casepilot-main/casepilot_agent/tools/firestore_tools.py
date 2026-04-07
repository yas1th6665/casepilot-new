"""Firestore tools for CasePilot - used as ADK function tools."""

from google.cloud import firestore
from datetime import date

db = firestore.Client()


def get_upcoming_hearings() -> dict:
    """Get all upcoming scheduled hearings sorted by date.
    Use this to check today's schedule, this week's hearings,
    or any future hearing dates for the lawyer."""

    today = date.today().isoformat()
    results = []

    hearings_ref = db.collection("hearings")
    for doc in hearings_ref.stream():
        data = doc.to_dict()
        if (data.get("status") == "scheduled" and
                data.get("hearing_date", "") >= today):
            results.append({
                "hearing_date": data.get("hearing_date"),
                "hearing_time": data.get("hearing_time"),
                "court_room": data.get("court_room"),
                "purpose": data.get("purpose"),
                "case_number": data.get("case_number"),
                "status": data.get("status")
            })

    results.sort(key=lambda x: x.get("hearing_date", ""))
    return {"hearings": results, "count": len(results)}


def get_case_details(search_term: str) -> dict:
    """Get detailed information about a specific case by case number
    or client name. Use this when the user asks about a specific case.

    Args:
        search_term: Case number (e.g. 'CS/234/2024') or client name
    """

    results = []
    for doc in db.collection("cases").stream():
        data = doc.to_dict()
        data["id"] = doc.id
        if (search_term.lower() in data.get("case_number", "").lower() or
                search_term.lower() in data.get("client_name", "").lower() or
                search_term.lower() in data.get("case_title", "").lower()):
            results.append(data)

    return {"cases": results, "count": len(results)}


def get_all_active_cases() -> dict:
    """Get all active cases for the lawyer.
    Use this when asked for a complete case list or overview."""

    results = []
    for doc in db.collection("cases").stream():
        data = doc.to_dict()
        data["id"] = doc.id
        if data.get("status") == "active":
            results.append({
                "case_number": data.get("case_number"),
                "case_title": data.get("case_title"),
                "client_name": data.get("client_name"),
                "court_name": data.get("court_name"),
                "case_type": data.get("case_type"),
                "priority": data.get("priority"),
                "status": data.get("status"),
                "filing_date": data.get("filing_date")
            })

    priority_order = {"urgent": 0, "high": 1, "normal": 2, "low": 3}
    results.sort(key=lambda x: priority_order.get(x.get("priority", "normal"), 2))
    return {"cases": results, "count": len(results)}


def get_pending_tasks() -> dict:
    """Get all pending and in-progress tasks sorted by priority.
    Use this to check what work needs to be done."""

    results = []
    for doc in db.collection("tasks").stream():
        data = doc.to_dict()
        data["id"] = doc.id
        if data.get("status") in ["pending", "in_progress"]:
            results.append(data)

    priority_order = {"urgent": 0, "high": 1, "normal": 2, "low": 3}
    results.sort(key=lambda x: (
        priority_order.get(x.get("priority", "normal"), 2),
        x.get("due_date", "9999-99-99")
    ))
    return {"tasks": results, "count": len(results)}


def get_overdue_tasks() -> dict:
    """Get all tasks that are past their due date and not completed."""

    today = date.today().isoformat()
    results = []

    for doc in db.collection("tasks").stream():
        data = doc.to_dict()
        if (data.get("due_date", "9999") < today and
                data.get("status") not in ["completed"]):
            data["id"] = doc.id
            results.append(data)

    return {"overdue_tasks": results, "count": len(results)}


def create_task(
    case_number: str,
    title: str,
    assigned_to: str,
    due_date: str,
    priority: str = "normal",
    task_type: str = "research"
) -> dict:
    """Create a new task for a case.

    Args:
        case_number: The case number (e.g., 'CS/234/2024')
        title: Task title or description
        assigned_to: Person assigned (e.g., 'self', 'Junior - Anil', 'Paralegal - Meena')
        due_date: Due date in YYYY-MM-DD format (e.g., '2026-04-10')
        priority: urgent, high, normal, or low
        task_type: drafting, research, filing, client_communication, or court_visit
    """

    task_data = {
        "case_number": case_number,
        "title": title,
        "assigned_to": assigned_to,
        "due_date": due_date,
        "priority": priority,
        "task_type": task_type,
        "status": "pending",
        "created_at": firestore.SERVER_TIMESTAMP,
        "completed_at": None
    }

    doc_ref = db.collection("tasks").add(task_data)
    return {
        "status": "created",
        "task_id": doc_ref[1].id,
        "message": f"Task '{title}' created for {case_number}, assigned to {assigned_to}, due {due_date}"
    }


def update_task_status(task_id: str, new_status: str) -> dict:
    """Update the status of a task.

    Args:
        task_id: The document ID of the task (shown in task list)
        new_status: New status: pending, in_progress, or completed
    """

    update_data = {"status": new_status}
    if new_status == "completed":
        update_data["completed_at"] = firestore.SERVER_TIMESTAMP

    db.collection("tasks").document(task_id).update(update_data)
    return {
        "status": "updated",
        "task_id": task_id,
        "new_status": new_status,
        "message": f"Task {task_id} updated to '{new_status}'"
    }


def search_case_notes(search_term: str) -> dict:
    """Search case notes and research by keyword.

    Args:
        search_term: Keyword to search in case notes content or title
    """

    results = []
    for doc in db.collection("case_notes").stream():
        data = doc.to_dict()
        if (search_term.lower() in data.get("content", "").lower() or
                search_term.lower() in data.get("title", "").lower()):
            data["id"] = doc.id
            results.append(data)

    return {"notes": results, "count": len(results)}


def search_precedents(subject_area: str) -> dict:
    """Search legal precedents by subject area.

    Args:
        subject_area: Area of law: property, criminal, contract, constitutional, or family
    """

    results = []
    for doc in db.collection("precedents").stream():
        data = doc.to_dict()
        if data.get("subject_area") == subject_area:
            data["id"] = doc.id
            results.append(data)

    return {"precedents": results, "count": len(results)}


def get_daily_brief() -> dict:
    """Get a complete daily briefing: today's hearings, overdue tasks, urgent items.
    Use this when the lawyer asks for their morning briefing or daily schedule."""

    today = date.today().isoformat()

    todays_hearings = []
    for doc in db.collection("hearings").stream():
        data = doc.to_dict()
        if data.get("hearing_date") == today and data.get("status") == "scheduled":
            todays_hearings.append(data)

    overdue_tasks = []
    tasks_due_today = []
    for doc in db.collection("tasks").stream():
        data = doc.to_dict()
        due = data.get("due_date", "9999")
        status = data.get("status", "")
        if status not in ["completed"]:
            if due < today:
                overdue_tasks.append(data)
            elif due == today:
                tasks_due_today.append(data)

    upcoming_hearings = []
    for doc in db.collection("hearings").stream():
        data = doc.to_dict()
        if data.get("hearing_date", "") > today and data.get("status") == "scheduled":
            upcoming_hearings.append(data)
    upcoming_hearings.sort(key=lambda x: x.get("hearing_date", ""))
    next_hearings = upcoming_hearings[:3]

    return {
        "date": today,
        "todays_hearings": todays_hearings,
        "tasks_due_today": tasks_due_today,
        "overdue_tasks": overdue_tasks,
        "next_upcoming_hearings": next_hearings,
        "summary": {
            "hearings_today": len(todays_hearings),
            "tasks_due_today": len(tasks_due_today),
            "overdue_count": len(overdue_tasks)
        }
    }
