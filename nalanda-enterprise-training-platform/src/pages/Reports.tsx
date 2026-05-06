import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Select } from "../components";
import type { AppData, User } from "../types";

export default function Reports({ data, currentUser }: { data: AppData; currentUser: User }) {
  const [dept, setDept] = useState("All");
  const [courseId, setCourseId] = useState("All");

  const filtered = data.enrollments.filter((e) => {
    const u = data.users.find((x) => x.id === e.userId);
    return (dept === "All" || u?.department === dept) && (courseId === "All" || e.courseId === courseId) && (currentUser.role === "Admin" || currentUser.role === "Manager" || e.userId === currentUser.id);
  });

  const chart = filtered.map((e) => {
    const c = data.courses.find((x) => x.id === e.courseId);
    return { name: c?.skill || "Course", progress: e.progress, time: e.timeSpentMinutes };
  });

  const trend = chart.map((c, i) => ({ month: `M${i + 1}`, engagement: c.progress, roi: +(1.1 + i * 0.15).toFixed(2) }));

  const exportReport = () => {
    const rows = ["User,Department,Course,Progress,Time", ...filtered.map((e) => {
      const u = data.users.find((x) => x.id === e.userId);
      const c = data.courses.find((x) => x.id === e.courseId);
      return `${u?.name},${u?.department},${c?.title},${e.progress},${e.timeSpentMinutes}`;
    })];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "nalanda-report.csv"; link.click();
  };

  const depts = ["All", ...Array.from(new Set(data.users.map((u) => u.department)))];

  return (
    <div className="space-y-6">
      <Panel title="Analytics & reports" kicker="Filters"
        action={<button onClick={exportReport} className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-slate-950">Export CSV</button>}>
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Department" value={dept} values={depts} onChange={setDept} />
          <label className="space-y-2 text-sm text-slate-400"><span>Course</span>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white">
              <option>All</option>{data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <div className="flex items-end"><p className="text-sm text-slate-400">{filtered.length} enrollments matched</p></div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Progress by skill" kicker="Bar chart">
          <div className="h-72 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#e2e8f0" }} />
                <Bar dataKey="progress" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="time" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Engagement trend" kicker="Line chart">
          <div className="h-72 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#e2e8f0" }} />
                <Line type="monotone" dataKey="engagement" stroke="#22d3ee" strokeWidth={3} />
                <Line type="monotone" dataKey="roi" stroke="#34d399" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Chapter feedback summary" kicker="Quality metrics">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.chapterFeedbacks.slice(0, 9).map((f) => {
            const ch = data.chapters.find((c) => c.id === f.chapterId);
            const u = data.users.find((x) => x.id === f.userId);
            return (
              <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{ch?.title}</p>
                <p className="text-xs text-slate-500 mt-1">by {u?.name}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-amber-400">★ {f.rating}/5</span>
                  <span className="text-slate-400">Clarity: {f.clarity}</span>
                  <span className="text-slate-400">Relevance: {f.relevance}</span>
                </div>
                {f.comments && <p className="mt-2 text-xs text-slate-400 italic">"{f.comments}"</p>}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
