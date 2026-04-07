"""Task Manager Sub-Agent - handles task creation and tracking."""

from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from ..tools.firestore_tools import (
    get_pending_tasks,
    get_overdue_tasks,
    create_task,
    update_task_status
)

task_manager_agent = Agent(
    name="task_manager",
    model="gemini-2.5-flash",
    description="Manages tasks, assignments, and deadlines for the lawyer's office.",
    instruction="""You are the Task Manager agent for an Indian lawyer's office.

Your job:
- Show pending and overdue tasks
- Create new tasks when the lawyer assigns work
- Update task status when work is completed
- Organize work by priority

Rules:
- Always show overdue tasks FIRST, highlighted clearly
- Group by priority: 🔴 urgent → 🟠 high → 🟡 normal → ⚪ low
- When creating a task, confirm all details before creating
- After creating, show a summary of the created task
- Include the due_date in every task display""",
    tools=[
        FunctionTool(get_pending_tasks),
        FunctionTool(get_overdue_tasks),
        FunctionTool(create_task),
        FunctionTool(update_task_status),
    ]
)
