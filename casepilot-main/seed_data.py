"""Populate Firestore with a fresh rolling demo dataset for CasePilot."""

from __future__ import annotations

from datetime import date, timedelta

from dotenv import load_dotenv
from google.cloud import firestore

load_dotenv()
db = firestore.Client()
TODAY = date.today()


def iso(days_from_today: int) -> str:
    return (TODAY + timedelta(days=days_from_today)).isoformat()


def long_label(days_from_today: int) -> str:
    target = TODAY + timedelta(days=days_from_today)
    return f"{target.day} {target.strftime('%B %Y')}"


def clear_collection(name):
    """Delete all docs in a collection."""
    docs = db.collection(name).stream()
    for doc in docs:
        doc.reference.delete()
    print(f"Cleared {name}")


def seed_cases():
    cases = [
        {
            "case_number": "WP/1234/2024",
            "case_title": "Lakshmi Devi vs. Revenue Dept - Land Acquisition Compensation",
            "court_name": "High Court of Telangana, Hyderabad",
            "court_type": "high_court",
            "case_type": "property",
            "client_name": "Lakshmi Devi",
            "opponent_name": "Revenue Department",
            "opponent_lawyer": "Govt. Pleader",
            "judge_name": "Hon. Justice M. Subramaniam",
            "status": "active",
            "filing_date": "2024-06-10",
            "priority": "urgent",
            "notes": "2 acres acquired. Compensation challenge at final hearing stage with valuation records ready."
        },
        {
            "case_number": "CS/234/2024",
            "case_title": "Sharma vs. Municipal Corporation - Property Dispute",
            "court_name": "District Court Warangal",
            "court_type": "district",
            "case_type": "property",
            "client_name": "Rajesh Sharma",
            "opponent_name": "Municipal Corporation",
            "opponent_lawyer": "Adv. P. Kumar",
            "judge_name": "Hon. Justice K. Venkatesh",
            "status": "active",
            "filing_date": "2024-03-15",
            "priority": "high",
            "notes": "Boundary wall encroachment during 2019 road widening. Survey report and neighbor affidavit are central."
        },
        {
            "case_number": "CRL/567/2023",
            "case_title": "State vs. Anand Kumar - Cheque Bounce (NI Act 138)",
            "court_name": "Metropolitan Magistrate Court Hyderabad",
            "court_type": "district",
            "case_type": "criminal",
            "client_name": "Anand Kumar",
            "opponent_name": "State of Telangana",
            "opponent_lawyer": "Public Prosecutor",
            "judge_name": "Hon. Magistrate P. Reddy",
            "status": "active",
            "filing_date": "2023-08-22",
            "priority": "high",
            "notes": "Cheque dishonour dispute. Jurisdiction objection and bank record inconsistencies remain key defense points."
        },
        {
            "case_number": "OS/89/2025",
            "case_title": "ABC Enterprises vs. XYZ Ltd - Contract Breach",
            "court_name": "Commercial Court Hyderabad",
            "court_type": "district",
            "case_type": "corporate",
            "client_name": "ABC Enterprises",
            "opponent_name": "XYZ Ltd",
            "opponent_lawyer": "Adv. R. Mehta",
            "judge_name": "Hon. Justice R. Naidu",
            "status": "active",
            "filing_date": "2025-01-05",
            "priority": "high",
            "notes": "Supply agreement breach with Rs. 25 lakh claim. Mediation has not resolved commercial exposure."
        },
        {
            "case_number": "MC/45/2024",
            "case_title": "Priya vs. Suresh - Maintenance and Custody",
            "court_name": "Family Court Warangal",
            "court_type": "district",
            "case_type": "family",
            "client_name": "Priya Devi",
            "opponent_name": "Suresh Kumar",
            "opponent_lawyer": "Adv. S. Rao",
            "judge_name": "Hon. Judge S. Lakshmi",
            "status": "active",
            "filing_date": "2024-11-20",
            "priority": "normal",
            "notes": "Maintenance and interim custody. School expense records and bank statements need to be consolidated."
        },
        {
            "case_number": "ARB/17/2025",
            "case_title": "Navya Infra vs. Coastal Steel - Arbitration Petition",
            "court_name": "Commercial Court Hyderabad",
            "court_type": "district",
            "case_type": "corporate",
            "client_name": "Navya Infra Projects Pvt Ltd",
            "opponent_name": "Coastal Steel Industries",
            "opponent_lawyer": "Adv. Deepak Sethi",
            "judge_name": "Hon. Justice P. Harinath",
            "status": "active",
            "filing_date": "2025-07-18",
            "priority": "urgent",
            "notes": "Section 9 relief sought to protect performance bank guarantee pending arbitration."
        },
        {
            "case_number": "LAB/118/2025",
            "case_title": "Ramesh Yadav vs. Sunrise Logistics - Wrongful Termination",
            "court_name": "Labour Court Secunderabad",
            "court_type": "tribunal",
            "case_type": "employment",
            "client_name": "Ramesh Yadav",
            "opponent_name": "Sunrise Logistics Pvt Ltd",
            "opponent_lawyer": "Adv. Kavitha Menon",
            "judge_name": "Presiding Officer A. Prasad",
            "status": "active",
            "filing_date": "2025-09-04",
            "priority": "normal",
            "notes": "Termination without domestic inquiry. Wage records and email trail support reinstatement claim."
        },
        {
            "case_number": "BA/302/2026",
            "case_title": "Rafiq Ahmed vs. State of Telangana - Bail Petition",
            "court_name": "Sessions Court Hyderabad",
            "court_type": "district",
            "case_type": "criminal",
            "client_name": "Rafiq Ahmed",
            "opponent_name": "State of Telangana",
            "opponent_lawyer": "Addl. Public Prosecutor",
            "judge_name": "Hon. Judge A. Sreedhar",
            "status": "active",
            "filing_date": "2026-03-18",
            "priority": "urgent",
            "notes": "Regular bail petition. Medical records and parity with co-accused are central."
        },
    ]

    for case in cases:
        case["created_at"] = firestore.SERVER_TIMESTAMP
        case["updated_at"] = firestore.SERVER_TIMESTAMP
        db.collection("cases").add(case)
    print(f"Seeded {len(cases)} cases")


def seed_hearings():
    hearings = [
        {
            "case_number": "WP/1234/2024",
            "hearing_date": iso(2),
            "hearing_time": "10:15",
            "court_room": "Court Room 3",
            "purpose": "Final arguments on compensation quantum",
            "status": "scheduled",
            "notes": "Carry valuation chart, comparable sale deeds, and written submissions."
        },
        {
            "case_number": "CS/234/2024",
            "hearing_date": iso(4),
            "hearing_time": "11:00",
            "court_room": "Court Room 5",
            "purpose": "Arguments on interim injunction application",
            "status": "scheduled",
            "notes": "Survey sketch, site photographs, and RTI road widening record to be shown."
        },
        {
            "case_number": "CRL/567/2023",
            "hearing_date": iso(6),
            "hearing_time": "12:15",
            "court_room": "Court Room 12",
            "purpose": "Cross-examination of complainant witness",
            "status": "scheduled",
            "notes": "Challenge bank memo timing and prior business dealings."
        },
        {
            "case_number": "OS/89/2025",
            "hearing_date": iso(9),
            "hearing_time": "14:00",
            "court_room": "Court Room 8",
            "purpose": "Case management hearing after failed mediation",
            "status": "scheduled",
            "notes": "Need damages calculation sheet and email chain chronology."
        },
        {
            "case_number": "MC/45/2024",
            "hearing_date": iso(11),
            "hearing_time": "11:30",
            "court_room": "Court Room 2",
            "purpose": "Evidence - client examination-in-chief",
            "status": "scheduled",
            "notes": "Prepare expense ledger, school fee receipts, and interim maintenance chart."
        },
        {
            "case_number": "ARB/17/2025",
            "hearing_date": iso(14),
            "hearing_time": "10:45",
            "court_room": "Commercial Bench 2",
            "purpose": "Section 9 interim protection hearing",
            "status": "scheduled",
            "notes": "Bank guarantee invocation email and contract milestones bundle required."
        },
        {
            "case_number": "LAB/118/2025",
            "hearing_date": iso(18),
            "hearing_time": "12:00",
            "court_room": "Labour Court Hall 1",
            "purpose": "Conciliation failure recording and evidence issues",
            "status": "scheduled",
            "notes": "Bring appointment letter, salary slips, and termination email printouts."
        },
        {
            "case_number": "BA/302/2026",
            "hearing_date": iso(1),
            "hearing_time": "10:30",
            "court_room": "Sessions Court Hall 4",
            "purpose": "Regular bail arguments",
            "status": "scheduled",
            "notes": "Highlight medical grounds and co-accused parity order."
        },
        {
            "case_number": "WP/1234/2024",
            "hearing_date": iso(23),
            "hearing_time": "10:00",
            "court_room": "Court Room 3",
            "purpose": "Pronouncement / further directions",
            "status": "scheduled",
            "notes": "Keep client on standby for valuation settlement possibility."
        },
        {
            "case_number": "CS/234/2024",
            "hearing_date": iso(-8),
            "hearing_time": "10:30",
            "court_room": "Court Room 5",
            "purpose": "Document submission",
            "status": "completed",
            "outcome": f"All property documents accepted. Next arguments fixed for {iso(4)}.",
            "notes": ""
        },
        {
            "case_number": "ARB/17/2025",
            "hearing_date": iso(-3),
            "hearing_time": "15:00",
            "court_room": "Commercial Bench 2",
            "purpose": "Mentioning on urgency and notice",
            "status": "completed",
            "outcome": f"Notice issued to respondent. Interim protection hearing listed on {iso(14)}.",
            "notes": ""
        },
    ]

    for hearing in hearings:
        hearing["created_at"] = firestore.SERVER_TIMESTAMP
        db.collection("hearings").add(hearing)
    print(f"Seeded {len(hearings)} hearings")


def seed_tasks():
    tasks = [
        {
            "case_number": "WP/1234/2024",
            "title": "Finalize written arguments and valuation table",
            "assigned_to": "Junior - Anil",
            "due_date": iso(1),
            "priority": "urgent",
            "status": "in_progress",
            "task_type": "drafting",
            "description": "Prepare compensation comparison chart with recent sale deed references and solatium calculation."
        },
        {
            "case_number": "WP/1234/2024",
            "title": "Collect certified copy of award proceedings",
            "assigned_to": "Clerk - Ravi",
            "due_date": iso(5),
            "priority": "high",
            "status": "pending",
            "task_type": "filing",
            "description": "Obtain copy from land acquisition office and scan into case file."
        },
        {
            "case_number": "CS/234/2024",
            "title": "Prepare interim injunction compilation",
            "assigned_to": "Junior - Anil",
            "due_date": iso(3),
            "priority": "urgent",
            "status": "pending",
            "task_type": "drafting",
            "description": "Bundle survey map, photos, RTI reply, and neighbor affidavit."
        },
        {
            "case_number": "CS/234/2024",
            "title": "Arrange site sketch attestation from surveyor",
            "assigned_to": "self",
            "due_date": iso(2),
            "priority": "high",
            "status": "pending",
            "task_type": "client_communication",
            "description": "Coordinate with client and surveyor for attested copy before injunction hearing."
        },
        {
            "case_number": "CRL/567/2023",
            "title": "Prepare cross-examination questions for complainant",
            "assigned_to": "self",
            "due_date": iso(5),
            "priority": "high",
            "status": "in_progress",
            "task_type": "research",
            "description": "Focus on bank memo inconsistencies, date of presentation, and prior settlements."
        },
        {
            "case_number": "OS/89/2025",
            "title": "Review damages working and settlement position",
            "assigned_to": "self",
            "due_date": iso(7),
            "priority": "normal",
            "status": "pending",
            "task_type": "research",
            "description": "Prepare best-case and negotiated exposure scenarios before next commercial hearing."
        },
        {
            "case_number": "MC/45/2024",
            "title": "Compile school fee receipts and monthly expense chart",
            "assigned_to": "Paralegal - Meena",
            "due_date": iso(8),
            "priority": "normal",
            "status": "pending",
            "task_type": "client_communication",
            "description": "Create clean annexure folder for maintenance evidence."
        },
        {
            "case_number": "ARB/17/2025",
            "title": "Draft Section 9 written note on irreparable injury",
            "assigned_to": "Junior - Sushma",
            "due_date": iso(10),
            "priority": "urgent",
            "status": "pending",
            "task_type": "drafting",
            "description": "Focus on bank guarantee exposure, cash-flow risk, and ongoing project milestones."
        },
        {
            "case_number": "LAB/118/2025",
            "title": "Prepare chronology of employment and termination",
            "assigned_to": "Paralegal - Kiran",
            "due_date": iso(13),
            "priority": "normal",
            "status": "pending",
            "task_type": "research",
            "description": "Map appointment, disciplinary history, and termination communication for evidence bundle."
        },
        {
            "case_number": "BA/302/2026",
            "title": "Collect latest medical records from jail hospital",
            "assigned_to": "Clerk - Ravi",
            "due_date": iso(0),
            "priority": "urgent",
            "status": "pending",
            "task_type": "court_visit",
            "description": "Need certified medical papers before tomorrow's bail arguments."
        },
        {
            "case_number": "BA/302/2026",
            "title": "Obtain co-accused bail order copy",
            "assigned_to": "self",
            "due_date": iso(-1),
            "priority": "high",
            "status": "pending",
            "task_type": "research",
            "description": "Parity ground must be ready for oral arguments."
        },
    ]

    for task in tasks:
        task["created_at"] = firestore.SERVER_TIMESTAMP
        task["completed_at"] = None
        db.collection("tasks").add(task)
    print(f"Seeded {len(tasks)} tasks")


def seed_case_notes():
    notes = [
        {
            "case_number": "CS/234/2024",
            "note_type": "observation",
            "title": f"Site Visit Findings - {long_label(-12)}",
            "content": (
                "Visited the disputed property with the client and surveyor. The municipal boundary wall "
                "still encroaches approximately 3 feet into the client's land. Fresh photographs and "
                "video clips were collected. Neighbor statements remain consistent with the 2019 road widening narrative."
            ),
            "author": "Advocate Satyanarayana"
        },
        {
            "case_number": "CS/234/2024",
            "note_type": "research",
            "title": "Limitation and Specific Relief Position",
            "content": (
                "Primary relief remains injunction plus mandatory restoration. RTI response on road widening approval "
                "should be used to show unilateral municipal action. Need to keep alternate possession arguments ready "
                "if court queries delay in filing."
            ),
            "author": "Junior - Anil"
        },
        {
            "case_number": "WP/1234/2024",
            "note_type": "client_meeting",
            "title": f"Client Conference - Compensation Review ({long_label(-5)})",
            "content": (
                "Lakshmi Devi agreed to rely on the latest market sale deeds from adjoining villages. "
                "Client wants minimum compensation pitched at Rs. 62 lakhs including statutory benefits. "
                "Original patta, pahanis, and certified award copy are available."
            ),
            "author": "Advocate Satyanarayana"
        },
        {
            "case_number": "CRL/567/2023",
            "note_type": "research",
            "title": "Jurisdiction Analysis - NI Act 138",
            "content": (
                "Dashrath Rupsingh Rathod still helps on territorial jurisdiction framing, but we should also prepare "
                "for statutory amendments and subsequent case law that may narrow the objection. Bank branch details need exact verification."
            ),
            "author": "Junior - Anil"
        },
        {
            "case_number": "ARB/17/2025",
            "note_type": "strategy",
            "title": "Bank Guarantee Risk Note",
            "content": (
                "If invocation is not restrained this week, project cash flow may be materially disrupted. "
                "Need to emphasize fraud / special equities threshold carefully and keep arbitration notice chronology ready."
            ),
            "author": "Advocate Satyanarayana"
        },
        {
            "case_number": "BA/302/2026",
            "note_type": "research",
            "title": "Bail Strategy - Medical Grounds and Parity",
            "content": (
                "Medical condition plus co-accused parity gives the best chance of success. "
                "Need concise custody duration note and assurance on cooperation with investigation."
            ),
            "author": "Junior - Sushma"
        },
        {
            "case_number": "LAB/118/2025",
            "note_type": "client_meeting",
            "title": f"Client Intake Update - {long_label(-7)}",
            "content": (
                "Client confirms no domestic enquiry notice was served before termination. Salary slips for the last 11 months "
                "have been handed over. WhatsApp instructions from reporting manager may support unfair labour practice narrative."
            ),
            "author": "Paralegal - Kiran"
        },
    ]

    for note in notes:
        note["created_at"] = firestore.SERVER_TIMESTAMP
        db.collection("case_notes").add(note)
    print(f"Seeded {len(notes)} case notes")


def seed_precedents():
    precedents = [
        {
            "case_citation": "(2020) 5 SCC 1",
            "case_name": "Indore Development Authority vs. Manoharlal",
            "court": "Supreme Court of India",
            "year": 2020,
            "subject_area": "property",
            "summary": (
                "Landmark judgment on compensation under the 2013 land acquisition framework. "
                "Market value must be anchored in comparable sales, with statutory solatium and benefits preserved."
            ),
            "key_principles": "Fair market value, 100% solatium, retrospective application, comparable sale method"
        },
        {
            "case_citation": "(2019) 3 SCC 244",
            "case_name": "Vidyadharan vs. State of Kerala",
            "court": "Supreme Court of India",
            "year": 2019,
            "subject_area": "property",
            "summary": (
                "Clarified adverse possession claims against the State and the standard for hostile, open, and continuous possession."
            ),
            "key_principles": "Adverse possession, government land, 30-year period, hostile possession"
        },
        {
            "case_citation": "(2014) 9 SCC 737",
            "case_name": "Dashrath Rupsingh Rathod vs. State of Maharashtra",
            "court": "Supreme Court of India",
            "year": 2014,
            "subject_area": "criminal",
            "summary": (
                "Jurisdiction ruling in cheque dishonour litigation identifying the place of dishonour as central to maintainability."
            ),
            "key_principles": "NI Act Section 138, jurisdiction, place of dishonour, drawee bank"
        },
        {
            "case_citation": "(2023) 8 SCC 282",
            "case_name": "Pankaj Bansal vs. Union of India",
            "court": "Supreme Court of India",
            "year": 2023,
            "subject_area": "criminal",
            "summary": (
                "Stressed procedural fairness in arrest and remand-related safeguards, useful when arguing liberty and due process."
            ),
            "key_principles": "Personal liberty, procedural safeguards, arrest grounds, remand fairness"
        },
        {
            "case_citation": "(2018) 9 SCC 261",
            "case_name": "K. Bhagirathi Bai vs. Kalawati",
            "court": "Supreme Court of India",
            "year": 2018,
            "subject_area": "family",
            "summary": (
                "Explained how maintenance must reflect standard of living, actual need, and changing economic circumstances."
            ),
            "key_principles": "Section 125 CrPC, maintenance quantum, standard of living, changed circumstances"
        },
        {
            "case_citation": "(2016) 2 SCC 176",
            "case_name": "Shrimant Shamrao Suryavanshi vs. Pralhad Bhairoba Suryavanshi",
            "court": "Supreme Court of India",
            "year": 2016,
            "subject_area": "property",
            "summary": (
                "Affirmed that co-sharers maintain an inherent right to seek partition and delay alone cannot defeat that right."
            ),
            "key_principles": "Partition, co-sharer rights, family property, continuing cause"
        },
        {
            "case_citation": "(2021) 6 SCC 258",
            "case_name": "Amazon.com NV Investment Holdings LLC vs. Future Retail Ltd.",
            "court": "Supreme Court of India",
            "year": 2021,
            "subject_area": "corporate",
            "summary": (
                "Recognized the enforceability of emergency arbitration-related protections in the Indian arbitration context."
            ),
            "key_principles": "Arbitration, emergency award, interim protection, enforceability"
        },
        {
            "case_citation": "(2023) 7 SCC 1",
            "case_name": "NN Global Mercantile Pvt. Ltd. vs. Indo Unique Flame Ltd.",
            "court": "Supreme Court of India",
            "year": 2023,
            "subject_area": "corporate",
            "summary": (
                "Clarified the separability and enforceability approach around arbitration agreements and stamp-duty objections."
            ),
            "key_principles": "Arbitration agreement, stamp duty, separability, referral standard"
        },
        {
            "case_citation": "(1978) 2 SCC 213",
            "case_name": "Workmen of Firestone Tyre & Rubber Co. vs. Management",
            "court": "Supreme Court of India",
            "year": 1973,
            "subject_area": "employment",
            "summary": (
                "Foundational labour law ruling on domestic enquiries, management discipline, and tribunal review standards."
            ),
            "key_principles": "Domestic enquiry, labour tribunal review, misconduct, termination"
        },
    ]

    for precedent in precedents:
        precedent["created_at"] = firestore.SERVER_TIMESTAMP
        db.collection("precedents").add(precedent)
    print(f"Seeded {len(precedents)} precedents")


if __name__ == "__main__":
    print("Starting CasePilot Firestore seed...")
    print(f"Base date for rolling demo data: {TODAY.isoformat()}")
    print("Clearing existing data...")
    for col in ["cases", "hearings", "tasks", "case_notes", "precedents", "case_files"]:
        clear_collection(col)

    print("\nSeeding fresh data...")
    seed_cases()
    seed_hearings()
    seed_tasks()
    seed_case_notes()
    seed_precedents()

    print("\nAll done! CasePilot database is ready.")
