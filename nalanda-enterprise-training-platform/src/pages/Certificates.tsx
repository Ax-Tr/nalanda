import { useMemo, useState } from "react";
import { Panel, Input, Select, Metric, StatusPill } from "../components";
import type { AppData, User } from "../types";

type Template = "Executive" | "Classic" | "Modern" | "Minimal";

const templates: Record<Template, { accent: string; border: string; font: string; pattern: string }> = {
  Executive: { accent: "#0f766e", border: "double", font: "Georgia, serif", pattern: "linear-gradient(135deg, rgba(15,118,110,.12), transparent 35%, rgba(245,158,11,.12))" },
  Classic: { accent: "#b45309", border: "solid", font: "Georgia, serif", pattern: "radial-gradient(circle at center, rgba(180,83,9,.10), transparent 55%)" },
  Modern: { accent: "#2563eb", border: "solid", font: "Inter, Arial, sans-serif", pattern: "linear-gradient(120deg, rgba(37,99,235,.12), rgba(34,211,238,.10))" },
  Minimal: { accent: "#334155", border: "solid", font: "Arial, sans-serif", pattern: "linear-gradient(180deg, #fff, #f8fafc)" },
};

export default function Certificates({ data, currentUser }: { data: AppData; currentUser: User }) {
  const completed = data.enrollments.filter((enrollment) => enrollment.progress >= 100 || enrollment.completedAt);
  const defaultEnrollment = completed[0] || data.enrollments[0];
  const [employeeId, setEmployeeId] = useState(defaultEnrollment?.userId || data.users[0]?.id || "");
  const [courseId, setCourseId] = useState(defaultEnrollment?.courseId || data.courses[0]?.id || "");
  const [duration, setDuration] = useState("6 hours");
  const [template, setTemplate] = useState<Template>("Executive");
  const [title, setTitle] = useState("Certificate of Completion");
  const [subtitle, setSubtitle] = useState("This certificate is proudly awarded to");
  const [footer, setFooter] = useState("For successfully completing the learning program with Nalanda.");
  const [accent, setAccent] = useState(templates.Executive.accent);

  const employee = data.users.find((user) => user.id === employeeId) || data.users[0];
  const course = data.courses.find((item) => item.id === courseId) || data.courses[0];
  const enrollment = data.enrollments.find((item) => item.userId === employeeId && item.courseId === courseId);
  const templateStyle = templates[template];

  const eligibleEmployees = useMemo(() => {
    const ids = new Set(completed.map((item) => item.userId));
    return data.users.filter((user) => ids.has(user.id));
  }, [completed, data.users]);

  const printCertificate = () => {
    if (!employee || !course) return;
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>${title} - ${employee.name}</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            body { margin: 0; background: #e2e8f0; font-family: ${templateStyle.font}; }
            .sheet { box-sizing: border-box; width: 297mm; height: 210mm; padding: 18mm; background: ${templateStyle.pattern}; }
            .certificate { box-sizing: border-box; display: flex; min-height: 100%; flex-direction: column; align-items: center; justify-content: center; border: 6px ${templateStyle.border} ${accent}; background: rgba(255,255,255,.92); padding: 18mm; text-align: center; color: #0f172a; }
            .kicker { color: ${accent}; font-size: 13px; letter-spacing: 6px; text-transform: uppercase; }
            h1 { margin: 16px 0 18px; font-size: 44px; color: ${accent}; }
            .subtitle { font-size: 18px; color: #475569; }
            .name { margin: 18px 0; font-size: 54px; font-weight: 800; border-bottom: 2px solid ${accent}; padding: 0 24px 12px; }
            .course { font-size: 25px; font-weight: 700; max-width: 850px; }
            .meta { display: flex; gap: 28px; margin-top: 28px; color: #475569; font-size: 15px; }
            .signatures { display: flex; justify-content: space-between; width: 78%; margin-top: 36px; font-size: 14px; color: #334155; }
            .line { border-top: 1px solid #64748b; padding-top: 8px; min-width: 180px; }
            .footer { margin-top: 24px; max-width: 760px; color: #475569; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="certificate">
              <div class="kicker">Nalanda Enterprise Training Platform</div>
              <h1>${title}</h1>
              <div class="subtitle">${subtitle}</div>
              <div class="name">${employee.name}</div>
              <div class="subtitle">for completing</div>
              <div class="course">${course.title}</div>
              <div class="meta">
                <span>Employee ID: ${employee.id}</span>
                <span>Duration: ${duration}</span>
                <span>Date: ${new Date().toLocaleDateString()}</span>
              </div>
              <p class="footer">${footer}</p>
              <div class="signatures">
                <div class="line">Issued by ${currentUser.name}</div>
                <div class="line">Learning Authority</div>
              </div>
            </div>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>`;
    const win = window.open("", "_blank");
    win?.document.write(html);
    win?.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Eligible" value={String(eligibleEmployees.length)} helper="Employees with completed courses" tone="green" />
        <Metric label="Templates" value="4" helper="Executive, Classic, Modern, Minimal" tone="cyan" />
        <Metric label="Format" value="PDF" helper="Generated through print/save" tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Certificate builder" kicker="Award setup" action={<button onClick={printCertificate} className="rounded-full bg-gradient-to-r from-amber-300 to-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">Generate PDF</button>}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-400"><span>Employee</span><select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white">{data.users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.id})</option>)}</select></label>
            <label className="space-y-2 text-sm text-slate-400"><span>Course</span><select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white">{data.courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <Input label="Duration" value={duration} onChange={setDuration} />
            <Select label="Template" value={template} values={["Executive", "Classic", "Modern", "Minimal"]} onChange={(value) => { setTemplate(value); setAccent(templates[value].accent); }} />
            <Input label="Certificate title" value={title} onChange={setTitle} />
            <Input label="Subtitle" value={subtitle} onChange={setSubtitle} />
            <Input label="Footer note" value={footer} onChange={setFooter} />
            <label className="space-y-2 text-sm text-slate-400"><span>Accent color</span><input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} className="h-[50px] w-full rounded-2xl border border-white/10 bg-slate-900 p-2" /></label>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <StatusPill tone={enrollment?.progress && enrollment.progress >= 100 ? "green" : "amber"}>{enrollment?.progress ?? 0}% complete</StatusPill>
            <p className="mt-3 text-slate-400">Certificates can be generated for any selected employee and course. Completion status is shown for review before issuing.</p>
          </div>
        </Panel>

        <Panel title="Live certificate preview" kicker={template}>
          <div className="rounded-3xl border border-white/10 bg-slate-200 p-4">
            <div className="aspect-[1.414/1] rounded-2xl p-6 text-center text-slate-900" style={{ background: templateStyle.pattern, fontFamily: templateStyle.font }}>
              <div className="flex h-full flex-col items-center justify-center border-4 p-6" style={{ borderColor: accent, borderStyle: templateStyle.border }}>
                <p className="text-xs uppercase tracking-[0.35em]" style={{ color: accent }}>Nalanda</p>
                <h2 className="mt-3 text-3xl font-bold" style={{ color: accent }}>{title}</h2>
                <p className="mt-4 text-sm text-slate-600">{subtitle}</p>
                <p className="mt-3 border-b px-6 pb-2 text-4xl font-extrabold" style={{ borderColor: accent }}>{employee?.name}</p>
                <p className="mt-4 text-sm text-slate-600">for completing</p>
                <p className="mt-2 max-w-xl text-xl font-bold">{course?.title}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-slate-600">
                  <span>{employee?.id}</span><span>{duration}</span><span>{new Date().toLocaleDateString()}</span>
                </div>
                <p className="mt-5 max-w-lg text-sm text-slate-600">{footer}</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
