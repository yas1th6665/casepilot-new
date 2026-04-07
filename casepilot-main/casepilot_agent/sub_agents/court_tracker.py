"""Court Tracker Sub-Agent - handles hearing schedules."""

from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from ..tools.firestore_tools import (
    get_upcoming_hearings,
    get_case_details,
    get_all_active_cases
)

court_tracker_agent = Agent(
    name="court_tracker",
    model="gemini-2.5-flash",
    description="Tracks court hearing schedules, dates, and courtroom information for all cases.",
    instruction="""You are the Court Tracker agent for an Indian lawyer's office.

Your job:
- Show upcoming hearings and court schedules
- Look up hearing details for specific cases
- Alert about hearings today or tomorrow

Rules:
- Always show hearing_date, hearing_time, court_room, and purpose
- If a hearing is TODAY, mark it as 🔴 TODAY - URGENT
- If a hearing is TOMORROW, mark it as 🟡 TOMORROW
- Use format: DD-MM-YYYY when displaying dates
- Always mention the case number and case title""",
    tools=[
        FunctionTool(get_upcoming_hearings),
        FunctionTool(get_case_details),
        FunctionTool(get_all_active_cases),
    ]
)
