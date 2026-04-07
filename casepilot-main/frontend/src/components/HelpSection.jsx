import { useState } from "react";
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  Target, 
  LayoutDashboard, 
  BriefcaseBusiness, 
  CalendarRange, 
  SquareCheckBig, 
  ScrollText, 
  Link2,
  Sparkles
} from "lucide-react";

export default function HelpSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-auto pt-4">
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl bg-[#24286f]/5 px-4 py-3 text-sm font-semibold text-[#24286f] transition hover:bg-[#24286f]/10"
      >
        <HelpCircle className="h-5 w-5 shrink-0" />
        <span>How to use CasePilot?</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="relative h-full max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl transition-all duration-300">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-stone-100 bg-[#24286f] px-8 py-6 text-white text-center flex-col relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-4">
                <Sparkles className="h-8 w-8 text-[#ffd046]" />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight">Welcome to CasePilot</h2>
              <p className="mt-2 text-indigo-100/80">Your AI-Powered Legal Multi-Agent Assistant</p>
            </header>

            {/* Content */}
            <div className="h-full overflow-y-auto px-8 py-8 pb-32">
              <section className="space-y-8">
                {/* About Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-brass" />
                    <h3 className="text-lg font-bold text-ink uppercase tracking-wider">What is CasePilot?</h3>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    CasePilot is a sophisticated, AI-powered multi-agent assistant designed specifically for Indian lawyers. 
                    It acts as your virtual legal clerk and researcher, understanding the nuances of the Indian legal system 
                    to help you manage your practice more efficiently.
                  </p>
                </div>

                {/* Benefits Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-brass" />
                    <h3 className="text-lg font-bold text-ink uppercase tracking-wider">How it helps you</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { title: "Automated Tracking", desc: "Never miss a hearing with automated monitoring of court dates." },
                      { title: "Conversational Research", desc: "Search 264M+ cases via eCourts using natural language." },
                      { title: "Smart Briefings", desc: "Get a 'Good Morning' brief of your entire day's agenda instantly." },
                      { title: "Task Management", desc: "Effortlessly delegate and track tasks across your legal team." }
                    ].map((item, i) => (
                      <div key={i} className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
                        <h4 className="font-bold text-[#24286f] text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-stone-500 leading-normal">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pages Guide */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <LayoutDashboard className="h-5 w-5 text-brass" />
                    <h3 className="text-lg font-bold text-ink uppercase tracking-wider">Platform Tour</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: LayoutDashboard, label: "Dashboard", desc: "Your daily control center with urgent alerts and today's schedule." },
                      { icon: BriefcaseBusiness, label: "All Cases", desc: "Complete database of your cases with priority-based tracking." },
                      { icon: CalendarRange, label: "Hearings", desc: "Visual calendar of upcoming court appearances and past outcomes." },
                      { icon: SquareCheckBig, label: "Tasks", desc: "Manage office work, filings, and research assignments." },
                      { icon: ScrollText, label: "Research", desc: "Search internal notes and Supreme Court/High Court precedents." },
                      { icon: Link2, label: "Connections", desc: "Intergrate with eCourts and manage your AI power-ups." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 rounded-2xl p-3 transition hover:bg-stone-50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-stone-100">
                          <item.icon className="h-5 w-5 text-[#24286f]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-ink">{item.label}</h4>
                          <p className="text-xs text-stone-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="rounded-3xl bg-[#ffd046]/10 border border-[#ffd046]/30 p-6">
                  <h4 className="flex items-center gap-2 font-bold text-ink mb-2">
                    <Sparkles className="h-5 w-5 text-brass" />
                    Pro Tip: Talk to it!
                  </h4>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    CasePilot is designed for <strong>Natural Language</strong>. You don't need to fill forms. 
                    Just tell the AI: <i>"Show me today's hearings"</i>, <i>"Assign Anil to draft the Sharma case notice"</i>, 
                    or <i>"Find judgments on Section 138"</i>.
                  </p>
                </div>
              </section>
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-stone-100 bg-white p-6 flex justify-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-[#24286f] px-10 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1a1d52] active:scale-95"
              >
                Got it, let's start!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
