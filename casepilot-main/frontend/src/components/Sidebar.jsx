import { NavLink } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarRange,
  Files,
  LayoutDashboard,
  Link2,
  ScrollText,
  Settings,
  SquareCheckBig,
} from "lucide-react";
import { NAV_ITEMS } from "../utils/constants";
import HelpSection from "./HelpSection";
import { useCaseStore } from "../stores/caseStore";

const iconMap = {
  Dashboard: LayoutDashboard,
  "All Cases": BriefcaseBusiness,
  Hearings: CalendarRange,
  Tasks: SquareCheckBig,
  Research: ScrollText,
  Files,
  Connections: Link2,
  Settings,
};

export default function Sidebar() {
  const { cases } = useCaseStore();

  return (
    <aside className="hidden h-[100dvh] w-[286px] shrink-0 border-r border-stone-200/80 bg-[#f4eddf] px-4 py-5 md:flex md:flex-col md:overflow-hidden">
      <BrandPanel />

      <nav className="mt-5 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.label];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive ? "bg-white text-ink shadow-sm" : "text-stone-700 hover:bg-white/70 hover:text-ink",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <HelpSection />
      
      <section className="mt-5 flex min-h-0 flex-1 flex-col rounded-[28px] border border-stone-200 bg-white/72 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Active Cases</p>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {cases.map((caseItem) => (
            <NavLink
              key={caseItem.id || caseItem.case_number}
              to={`/cases/${encodeURIComponent(caseItem.case_number)}`}
              className="block rounded-2xl border border-stone-200 px-3 py-3 transition hover:border-brass/50 hover:bg-sand"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{caseItem.case_number}</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-ink">{caseItem.case_title}</p>
            </NavLink>
          ))}
        </div>
      </section>
    </aside>
  );
}

function BrandPanel() {
  return (
    <div className="rounded-[34px] bg-[#24286f] px-5 py-6 text-white shadow-panel">
      <div className="flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center">
          <svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true">
            <g fill="none" stroke="#ffd046" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M80 16 132 38v60l-52 24-52-24V38Z" />
              <path d="M80 32v88" />
              <path d="M46 72h68" />
              <path d="M58 72v26" />
              <path d="M102 72v26" />
              <path d="M80 32v16" />
              <circle cx="80" cy="52" r="4.5" fill="#ffd046" />
              <path d="M33 121h94" />
              <circle cx="80" cy="121" r="4.5" fill="#ffd046" />
              <circle cx="52" cy="121" r="4.5" fill="#ffd046" />
              <circle cx="108" cy="121" r="4.5" fill="#ffd046" />
              <path d="M44 88c0-9 8-16 18-16s18 7 18 16" />
              <path d="M80 88c0-9 8-16 18-16s18 7 18 16" />
            </g>
          </svg>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="font-display text-[2.65rem] font-semibold leading-none tracking-[0.03em] text-white">CASE</p>
        <p className="mt-1 font-display text-[2.65rem] font-semibold leading-none tracking-[0.03em] text-[#ffd046]">
          PILOT
        </p>
        <p className="mt-2.5 text-[12px] uppercase tracking-[0.14em] text-[#b9b6ea]">AI Legal Assistant</p>
        <div className="mx-auto mt-3.5 h-[2px] w-28 bg-[#ffd046]" />
      </div>
    </div>
  );
}
