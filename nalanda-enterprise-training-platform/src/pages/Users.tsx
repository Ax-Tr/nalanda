import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { Panel, Modal, StatusPill, Input, Select, Avatar, cn } from "../components";
import type { AppData, User, Role } from "../types";
import { now, uid } from "../types";

export default function Users({ data, currentUser, setData }: { data: AppData; currentUser: User; setData: (d: AppData) => void }) {
  const [open, setOpen] = useState(false);
  const managers = data.users.filter((u) => u.role === "Manager" || u.role === "Admin");
  const [form, setForm] = useState({ employeeId: "", name: "", email: "", role: "Employee" as Role, department: "Engineering", designation: "", managerId: managers[0]?.id || "", password: "Password@123", dateOfJoining: new Date().toISOString().slice(0, 10) });
  const addAudit = (d: AppData, a: string, e: string): AppData => ({ ...d, audit: [{ id: uid("AUD"), actorId: currentUser.id, action: a, entity: e, at: now() }, ...d.audit] });

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (!form.employeeId.trim()) return;
    if (data.users.some((u) => u.id === form.employeeId)) return;
    const u: User = { id: form.employeeId, name: form.name, email: form.email, password: form.password, avatar: form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(), role: form.role, department: form.department, designation: form.designation, managerId: form.managerId || null, status: "Active", joinedAt: form.dateOfJoining, lastActive: "Never", preferences: { theme: "dark", language: "en", emailNotifications: true, pushNotifications: true, weeklyDigest: true, courseReminders: true, fontSize: "medium", reducedMotion: false, highContrast: false } };
    setData(addAudit({ ...data, users: [u, ...data.users] }, "Created user", u.id));
    setOpen(false);
  };
  const patch = (id: string, p: Partial<User>) => setData(addAudit({ ...data, users: data.users.map((u) => u.id === id ? { ...u, ...p } : u) }, "Updated user", id));

  return (
    <div className="space-y-6">
      <Panel title="User management" kicker="Admin" action={<button onClick={() => setOpen(true)} className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-slate-950">Create user</button>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.25em] text-slate-500">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Manager</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.users.map((u) => (
                <tr key={u.id} className="text-slate-300">
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><div><p className="font-medium text-white">{u.name}</p><p className="text-xs text-slate-500">{u.id} · {u.department} · {u.designation} · DOJ: {u.joinedAt}</p></div></div></td>
                  <td className="px-4 py-4"><select value={u.role} onChange={(e) => patch(u.id, { role: e.target.value as Role })} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm"><option>Admin</option><option>Manager</option><option>Employee</option></select></td>
                  <td className="px-4 py-4"><select value={u.managerId || ""} onChange={(e) => patch(u.id, { managerId: e.target.value || null })} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm"><option value="">None</option>{managers.filter((m) => m.id !== u.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></td>
                  <td className="px-4 py-4"><StatusPill tone={u.status === "Active" ? "green" : "red"}>{u.status}</StatusPill></td>
                  <td className="px-4 py-4"><button onClick={() => patch(u.id, { status: u.status === "Active" ? "Inactive" : "Active" })} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-white/5">{u.status === "Active" ? "Deactivate" : "Activate"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Audit trail" kicker="Activity log">
        <div className="grid gap-3 md:grid-cols-2">{data.audit.slice(0, 10).map((e) => <div key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">{e.action} — {e.entity}<p className="mt-1 text-xs text-slate-500">{new Date(e.at).toLocaleString()}</p></div>)}</div>
      </Panel>
      <AnimatePresence>{open && <Modal title="Create user" onClose={() => setOpen(false)}><form onSubmit={create} className="grid gap-4 md:grid-cols-2"><Input label="Employee ID *" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} placeholder="e.g. EMP-2001" /><Input label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} /><label className="space-y-2 text-sm text-slate-400"><span>Date of Joining</span><input type="date" value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300" /></label><Input label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} /><Input label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} /><Select label="Role" value={form.role} values={["Admin", "Manager", "Employee"]} onChange={(v) => setForm({ ...form, role: v })} /><label className="space-y-2 text-sm text-slate-400"><span>Manager</span><select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"><option value="">None</option>{managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><button className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 md:col-span-2">Save user</button></form></Modal>}</AnimatePresence>
    </div>
  );
}
