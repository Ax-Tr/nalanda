import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Input } from "../components";
import type { User } from "../types";

export default function Login({ users, onLogin }: { users: User[]; onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("admin@nalanda.local");
  const [password, setPassword] = useState("Password@123");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const u = users.find((x) => x.email === email && x.password === password && x.status === "Active");
    if (!u) { setError("Invalid credentials or inactive account."); return; }
    onLogin(u);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-mesh" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center p-8 lg:p-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm uppercase tracking-[0.45em] text-cyan-200/80">Nalanda</p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Enterprise learning, governed from one secure command center.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Monitor employee learning activities, analyze skill ratings, and discover development areas — all in one platform.
            </p>
          </motion.div>
        </section>
        <section className="flex items-center justify-center p-6">
          <motion.form onSubmit={submit} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl glow-cyan">
            <h2 className="font-display text-2xl font-semibold text-white">Secure sign in</h2>
            <p className="mt-2 text-sm text-slate-400">Use any demo account. Password: Password@123</p>
            <div className="mt-6 space-y-4">
              <Input label="Email" value={email} onChange={setEmail} />
              <Input label="Password" value={password} onChange={setPassword} type="password" />
            </div>
            {error && <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
            <button className="mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-bold text-slate-950 transition hover:shadow-lg hover:shadow-cyan-400/20">
              Sign in
            </button>
            <div className="mt-6 grid gap-2 text-xs text-slate-400">
              {users.filter((u) => u.status === "Active").slice(0, 5).map((u) => (
                <button type="button" key={u.id} onClick={() => setEmail(u.email)}
                  className="rounded-2xl border border-white/10 px-3 py-2 text-left transition hover:border-cyan-300/50 hover:bg-white/5">
                  <span className="font-semibold text-cyan-200">{u.role}</span>: {u.email}
                </button>
              ))}
            </div>
          </motion.form>
        </section>
      </div>
    </main>
  );
}
