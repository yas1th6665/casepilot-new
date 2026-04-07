"""CasePilot MCP Server - exposes Firestore as MCP tools for Track 2."""

import asyncio
import json
from datetime import date
from mcp.server import Server
from mcp.types import Tool, TextContent
from mcp.server.stdio import stdio_server
from google.cloud import firestore

app = Server("casepilot-mcp-server")
db = firestore.Client()


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List all available CasePilot MCP tools."""
    return [
        Tool(
            name="get_upcoming_hearings",
            description="Get all upcoming scheduled court hearings for the lawyer sorted by date",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="get_case_details",
            description="Get case details by searching case number or client name",
            inputSchema={
                "type": "object",
                "properties": {
                    "search_term": {
                        "type": "string",
                        "description": "Case number (e.g. 'CS/234/2024') or client name"
                    }
                },
                "required": ["search_term"]
            }
        ),
        Tool(
            name="get_pending_tasks",
            description="Get all pending and in-progress tasks sorted by priority",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="create_task",
            description="Create a new task/assignment for a legal case",
            inputSchema={
                "type": "object",
                "properties": {
                    "case_number": {"type": "string", "description": "Case number"},
                    "title": {"type": "string", "description": "Task description"},
                    "assigned_to": {"type": "string", "description": "Person assigned"},
                    "due_date": {"type": "string", "description": "Due date YYYY-MM-DD"},
                    "priority": {
                        "type": "string",
                        "enum": ["urgent", "high", "normal", "low"]
                    }
                },
                "required": ["case_number", "title", "assigned_to", "due_date"]
            }
        ),
        Tool(
            name="search_precedents",
            description="Search Indian legal precedents by subject area",
            inputSchema={
                "type": "object",
                "properties": {
                    "subject_area": {
                        "type": "string",
                        "description": "property, criminal, contract, constitutional, or family"
                    }
                },
                "required": ["subject_area"]
            }
        ),
        Tool(
            name="get_daily_brief",
            description="Get complete daily briefing: today's hearings, overdue tasks, urgent items",
            inputSchema={"type": "object", "properties": {}}
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Execute the requested MCP tool."""

    today = date.today().isoformat()

    if name == "get_upcoming_hearings":
        results = []
        for doc in db.collection("hearings").stream():
            data = doc.to_dict()
            if data.get("status") == "scheduled" and data.get("hearing_date", "") >= today:
                results.append({k: v for k, v in data.items() if k != "created_at"})
        results.sort(key=lambda x: x.get("hearing_date", ""))
        return [TextContent(type="text", text=json.dumps(results, default=str))]

    elif name == "get_case_details":
        search = arguments["search_term"].lower()
        results = []
        for doc in db.collection("cases").stream():
            data = doc.to_dict()
            if (search in data.get("case_number", "").lower() or
                    search in data.get("client_name", "").lower()):
                results.append({k: v for k, v in data.items() if k != "created_at"})
        return [TextContent(type="text", text=json.dumps(results, default=str))]

    elif name == "get_pending_tasks":
        results = []
        for doc in db.collection("tasks").stream():
            data = doc.to_dict()
            if data.get("status") in ["pending", "in_progress"]:
                results.append({k: v for k, v in data.items() if k not in ["created_at", "completed_at"]})
        priority_order = {"urgent": 0, "high": 1, "normal": 2, "low": 3}
        results.sort(key=lambda x: priority_order.get(x.get("priority", "normal"), 2))
        return [TextContent(type="text", text=json.dumps(results, default=str))]

    elif name == "create_task":
        task = {**arguments, "status": "pending", "created_at": firestore.SERVER_TIMESTAMP}
        doc_ref = db.collection("tasks").add(task)
        return [TextContent(type="text", text=json.dumps({
            "status": "created",
            "task_id": doc_ref[1].id,
            "task": arguments
        }))]

    elif name == "search_precedents":
        results = []
        for doc in db.collection("precedents").stream():
            data = doc.to_dict()
            if data.get("subject_area") == arguments.get("subject_area"):
                results.append({k: v for k, v in data.items() if k != "created_at"})
        return [TextContent(type="text", text=json.dumps(results, default=str))]

    elif name == "get_daily_brief":
        hearings_today = []
        overdue = []
        due_today = []

        for doc in db.collection("hearings").stream():
            data = doc.to_dict()
            if data.get("hearing_date") == today and data.get("status") == "scheduled":
                hearings_today.append(data.get("case_number") + " - " + data.get("purpose", ""))

        for doc in db.collection("tasks").stream():
            data = doc.to_dict()
            if data.get("status") not in ["completed"]:
                if data.get("due_date", "9999") < today:
                    overdue.append(data.get("title"))
                elif data.get("due_date") == today:
                    due_today.append(data.get("title"))

        brief = {
            "date": today,
            "hearings_today": hearings_today,
            "tasks_due_today": due_today,
            "overdue_tasks": overdue
        }
        return [TextContent(type="text", text=json.dumps(brief))]

    return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
