import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, Avatar } from "./components";
import { navByRole, uid, now } from "./types";
import type { AppData, ModuleKey, User } from "./types";
import { seedData } from "./seedData";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Assessments from "./pages/Assessments";
import Skills from "./pages/Skills";
import Users from "./pages/Users";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";

function useLocalState<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal] as const;
}

function normalizeData(data: AppData): AppData {
  return {
    ...data,
    skills: data.skills?.length ? data.skills : seedData.skills,
    targetSkills: data.targetSkills?.length ? data.targetSkills : seedData.targetSkills,
    courses: data.courses.map((course) => {
      const seedCourse = seedData.courses.find((item) => item.id === course.id);
      const skill = data.skills?.find((item) => item.name === course.skill) || seedData.skills.find((item) => item.name === course.skill);
      return {
        ...course,
        skillIds: course.skillIds?.length ? course.skillIds : seedCourse?.skillIds || (skill ? [skill.id] : []),
        targetLevel: course.targetLevel || seedCourse?.targetLevel || course.difficulty,
        prerequisites: course.prerequisites || [],
      };
    }),
    enrollments: data.enrollments.map((enrollment) => ({
      ...enrollment,
      dueAt: enrollment.dueAt || null,
      priority: enrollment.priority || "Medium",
      mandatory: enrollment.mandatory ?? false,
    })),
    assessments: data.assessments.map((assessment) => {
      const course = data.courses.find((item) => item.id === assessment.courseId) || seedData.courses.find((item) => item.id === assessment.courseId);
      return {
        ...assessment,
        difficulty: assessment.difficulty || course?.difficulty || "Beginner",
        createdAt: assessment.createdAt || now(),
        updatedAt: assessment.updatedAt || assessment.createdAt || now(),
      };
    }),
  };
}

export default function App() {
  const [rawData, setDataState] = useLocalState<AppData>("nalanda-v3", seedData);
  const data = normalizeData(rawData);
  const [sessionId, setSessionId] = useLocalState<string | null>("nalanda-session-v3", null);
  const [module, setModule] = useState<ModuleKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentUser = data.users.find((u) => u.id === sessionId && u.status === "Active") || null;
  const setData = (next: AppData) => setDataState(next);
  const signIn = (u: User) => { setSessionId(u.id); setData({ ...data, audit: [{ id: uid("AUD"), actorId: u.id, action: "Signed in", entity: u.id, at: now() }, ...data.audit] }); };
  const resetDemo = () => { setDataState(seedData); setSessionId(null); };

  useEffect(() => {
    if (currentUser && !navByRole[currentUser.role].some((n) => n.key === module)) setModule("dashboard");
  }, [currentUser, module]);

  if (!currentUser) return <Login users={data.users} onLogin={signIn} />;

  const nav = navByRole[currentUser.role];

  const render = () => {
    switch (module) {
      case "dashboard": return <Dashboard data={data} currentUser={currentUser} />;
      case "my-learning": return <Courses data={{ ...data, courses: data.courses.filter((c) => data.enrollments.some((e) => e.userId === currentUser.id && e.courseId === c.id) && c.approval === "Approved") }} currentUser={{ ...currentUser, role: "Employee" }} setData={setData} />;
      case "courses": return <Courses data={data} currentUser={currentUser} setData={setData} />;
      case "assessments": return <Assessments data={data} currentUser={currentUser} setData={setData} />;
      case "skills": return <Skills data={data} currentUser={currentUser} setData={setData} />;
      case "users": return <Users data={data} currentUser={currentUser} setData={setData} />;
      case "team": return <Team data={data} currentUser={currentUser} />;
      case "settings": return <Settings data={data} currentUser={currentUser} setData={setData} />;
      case "reports": return <Reports data={data} currentUser={currentUser} />;
      default: return <Dashboard data={data} currentUser={currentUser} />;
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-mesh" />
      <div className="relative z-10 flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-2xl border border-cyan-200/30 bg-cyan-300/10">
              <motion.span className="absolute inset-2 rounded-xl bg-cyan-300/80" animate={{ scale: [1, 0.72, 1], opacity: [0.95, 0.55, 0.95] }} transition={{ duration: 3, repeat: Infinity }} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">Nalanda</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">L&D Platform</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-medium text-white text-sm">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.role} · {currentUser.department}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setSessionId(null)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5">Sign out</button>
              <button onClick={resetDemo} className="rounded-full border border-rose-300/20 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-300/10">Reset</button>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1">
            {nav.map((n) => (
              <button key={n.key} onClick={() => setModule(n.key)} className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition", module === n.key ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
                <span className="text-base">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-white">Nalanda v1.0</p>
            <p className="mt-1 text-xs text-slate-500 leading-5">Data persists in localStorage. Frontend demo with mock data.</p>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl border border-white/10 p-2 text-white">☰</button>
            <p className="font-display text-lg font-semibold text-white">Nalanda</p>
            <button onClick={() => setSessionId(null)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300">Sign out</button>
          </header>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -200 }} className="absolute top-full left-0 w-64 border-r border-white/10 bg-slate-950 p-4 shadow-2xl">
                <nav className="space-y-1">
                  {nav.map((n) => (
                    <button key={n.key} onClick={() => { setModule(n.key); setSidebarOpen(false); }} className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium", module === n.key ? "bg-white text-slate-950" : "text-slate-400")}>
                      <span>{n.icon}</span><span>{n.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main content */}
        <section className="min-w-0 flex-1 p-4 pt-16 md:p-6 lg:p-8 lg:pt-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{currentUser.role} workspace</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-white">{nav.find((n) => n.key === module)?.label}</h1>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${currentUser.id}-${module}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              {render()}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
