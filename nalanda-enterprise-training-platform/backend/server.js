import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import { v4 as uuid } from "uuid";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 500 } });
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const roles = ["Admin", "Manager", "User"];
const now = () => new Date().toISOString();
const nextCourseId = (skill = "GN") => `NLD-${skill.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

const users = [
  { id: "EMP-1001", name: "Aarav Menon", email: "aarav@nalanda.local", passwordHash: bcrypt.hashSync("Password@123", 10), department: "Sales", role: "Manager", managerId: "EMP-1288", status: "Active", createdAt: now() },
  { id: "EMP-1034", name: "Diya Sharma", email: "diya@nalanda.local", passwordHash: bcrypt.hashSync("Password@123", 10), department: "Engineering", role: "User", managerId: "EMP-1102", status: "Active", createdAt: now() },
  { id: "EMP-1102", name: "Kabir Sethi", email: "kabir@nalanda.local", passwordHash: bcrypt.hashSync("Password@123", 10), department: "Engineering", role: "Manager", managerId: "EMP-1288", status: "Active", createdAt: now() },
  { id: "EMP-1288", name: "Nisha Rao", email: "admin@nalanda.local", passwordHash: bcrypt.hashSync("Password@123", 10), department: "People Ops", role: "Admin", managerId: null, status: "Active", createdAt: now() },
];

const courses = [
  { id: "NLD-SC-2048", title: "Secure Coding for Cloud Teams", description: "Threat modeling, OWASP controls, and secure release patterns.", skill: "Security", tags: ["OWASP", "Cloud"], contentTypes: ["PDF", "Rich Text", "Video Link"], approval: "Approved", status: "Active", ownerId: "EMP-1288", version: 3, createdAt: now(), updatedAt: now() },
  { id: "NLD-LD-1130", title: "Manager Essentials: Feedback Systems", description: "Coaching rituals and measurable development plans.", skill: "Leadership", tags: ["People", "Coaching"], contentTypes: ["Rich Text", "Uploaded Video"], approval: "Pending", status: "Active", ownerId: "EMP-1001", version: 1, createdAt: now(), updatedAt: now() },
];

const assessments = [
  { id: "ASM-9001", title: "Secure Release Readiness", courseId: "NLD-SC-2048", type: "Timed Quiz", approval: "Approved", strictMode: true, questions: [{ id: "Q1", type: "MCQ", prompt: "Best control for leaked API key prevention?", options: ["Manual approval", "CI secret scanning", "Newsletter", "Post audit"], answer: 1 }], durationMinutes: 45, passScore: 80, ownerId: "EMP-1288", createdAt: now() },
  { id: "ASM-9038", title: "Feedback Scenario Review", courseId: "NLD-LD-1130", type: "Descriptive", approval: "Pending", strictMode: true, questions: [{ id: "Q1", type: "Descriptive", prompt: "Write feedback for a missed target using SBI." }], durationMinutes: 60, passScore: 70, ownerId: "EMP-1001", createdAt: now() },
];

const assignments = [
  { id: uuid(), courseId: "NLD-SC-2048", userId: "EMP-1034", assignedBy: "EMP-1102", progress: 76, timeSpentSeconds: 11200, completedAt: null, createdAt: now() },
];

const attempts = [];
const proctoringLogs = [];
const auditLogs = [];
let settings = { fullscreenRequired: true, cameraRequired: true, microphoneRequired: true, tabSwitchAutoSubmit: true, noiseThreshold: 70, maxAssessmentFlags: 2 };

const publicUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

const audit = (actorId, action, entityType, entityId, metadata = {}) => {
  auditLogs.unshift({ id: uuid(), actorId, action, entityType, entityId, metadata, createdAt: now() });
};

const signToken = (user) => jwt.sign({ sub: user.id, role: user.role, department: user.department }, JWT_SECRET, { expiresIn: "30m" });

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing bearer token" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    const user = users.find((item) => item.id === payload.sub && item.status === "Active");
    if (!user) return res.status(401).json({ error: "Inactive or unknown user" });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireRole = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
  return next();
};

const canManageCourse = (user, course) => user.role === "Admin" || course.ownerId === user.id;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Nalanda API", time: now() });
});

app.post("/api/auth/login", (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = users.find((item) => item.email === parsed.data.email && item.status === "Active");
  if (!user || !bcrypt.compareSync(parsed.data.password, user.passwordHash)) return res.status(401).json({ error: "Invalid credentials" });
  audit(user.id, "LOGIN", "USER", user.id);
  return res.json({ token: signToken(user), user: publicUser(user) });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user), permissions: req.user.role });
});

app.get("/api/users", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const { department, role, status = "Active" } = req.query;
  let visible = req.user.role === "Admin" ? users : users.filter((user) => user.managerId === req.user.id || user.id === req.user.id);
  if (department) visible = visible.filter((user) => user.department === department);
  if (role) visible = visible.filter((user) => user.role === role);
  if (status !== "All") visible = visible.filter((user) => user.status === status);
  res.json({ data: visible.map(publicUser), total: visible.length });
});

app.post("/api/users", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), department: z.string().min(2), role: z.enum(roles), managerId: z.string().nullable().optional(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = { id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`, ...parsed.data, status: "Active", passwordHash: bcrypt.hashSync(parsed.data.password, 10), createdAt: now() };
  delete user.password;
  users.push(user);
  audit(req.user.id, "CREATE_USER", "USER", user.id, { role: user.role });
  res.status(201).json({ data: publicUser(user) });
});

app.patch("/api/users/:id", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ name: z.string().min(2).optional(), department: z.string().min(2).optional(), role: z.enum(roles).optional(), managerId: z.string().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  Object.assign(user, parsed.data);
  audit(req.user.id, "UPDATE_USER", "USER", user.id, parsed.data);
  res.json({ data: publicUser(user) });
});

app.patch("/api/users/:id/status", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.status = parsed.data.status;
  audit(req.user.id, "CHANGE_USER_STATUS", "USER", user.id, parsed.data);
  res.json({ data: publicUser(user), note: "Users are inactivated, never deleted." });
});

app.get("/api/courses", authenticate, (req, res) => {
  const { skill, approval, status = "Active" } = req.query;
  let visible = courses;
  if (req.user.role === "Manager") visible = visible.filter((course) => course.ownerId === req.user.id || course.approval === "Approved");
  if (req.user.role === "User") visible = visible.filter((course) => course.approval === "Approved" && course.status === "Active");
  if (skill) visible = visible.filter((course) => course.skill === skill);
  if (approval) visible = visible.filter((course) => course.approval === approval);
  if (status !== "All") visible = visible.filter((course) => course.status === status);
  res.json({ data: visible, total: visible.length });
});

app.post("/api/courses", authenticate, requireRole("Admin", "Manager"), upload.fields([{ name: "pdf" }, { name: "video" }]), (req, res) => {
  const body = typeof req.body.payload === "string" ? JSON.parse(req.body.payload) : req.body;
  const schema = z.object({ title: z.string().min(4), description: z.string().min(10), skill: z.string().min(2), tags: z.array(z.string()).default([]), contentTypes: z.array(z.string()).default(["Rich Text"]) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const course = { id: nextCourseId(parsed.data.skill), ...parsed.data, approval: req.user.role === "Admin" ? "Approved" : "Pending", status: "Active", ownerId: req.user.id, version: 1, createdAt: now(), updatedAt: now(), storage: { files: Object.keys(req.files || {}) } };
  courses.unshift(course);
  audit(req.user.id, "CREATE_COURSE", "COURSE", course.id, { approval: course.approval });
  res.status(201).json({ data: course });
});

app.put("/api/courses/:id", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const course = courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });
  Object.assign(course, req.body, { version: course.version + 1, approval: req.user.role === "Admin" ? "Approved" : "Pending", updatedAt: now() });
  audit(req.user.id, "UPDATE_COURSE", "COURSE", course.id, { version: course.version });
  res.json({ data: course });
});

app.post("/api/courses/:id/duplicate", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const source = courses.find((item) => item.id === req.params.id);
  if (!source) return res.status(404).json({ error: "Course not found" });
  const copy = { ...source, id: nextCourseId(source.skill), title: `${source.title} Copy`, approval: req.user.role === "Admin" ? "Approved" : "Pending", ownerId: req.user.id, version: 1, createdAt: now(), updatedAt: now() };
  courses.unshift(copy);
  audit(req.user.id, "DUPLICATE_COURSE", "COURSE", copy.id, { sourceId: source.id });
  res.status(201).json({ data: copy });
});

app.patch("/api/courses/:id/approval", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ approval: z.enum(["Approved", "Rejected"]), reason: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const course = courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  course.approval = parsed.data.approval;
  if (parsed.data.approval === "Rejected") course.status = "Inactive";
  audit(req.user.id, "COURSE_APPROVAL", "COURSE", course.id, parsed.data);
  res.json({ data: course });
});

app.patch("/api/courses/:id/status", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const course = courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  course.status = parsed.data.status;
  audit(req.user.id, "COURSE_STATUS", "COURSE", course.id, parsed.data);
  res.json({ data: course });
});

app.post("/api/assignments", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({ courseId: z.string(), userIds: z.array(z.string()).min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = parsed.data.userIds.map((userId) => ({ id: uuid(), courseId: parsed.data.courseId, userId, assignedBy: req.user.id, progress: 0, timeSpentSeconds: 0, completedAt: null, createdAt: now() }));
  assignments.push(...created);
  audit(req.user.id, "ASSIGN_COURSE", "COURSE", parsed.data.courseId, { count: created.length });
  res.status(201).json({ data: created });
});

app.get("/api/assessments", authenticate, (req, res) => {
  let visible = assessments;
  if (req.user.role === "Manager") visible = visible.filter((item) => item.ownerId === req.user.id || item.approval === "Approved");
  if (req.user.role === "User") visible = visible.filter((item) => item.approval === "Approved");
  res.json({ data: visible, total: visible.length });
});

app.post("/api/assessments", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({ title: z.string().min(4), courseId: z.string(), type: z.enum(["MCQ", "Descriptive", "Timed Quiz"]), strictMode: z.boolean().default(true), questions: z.array(z.record(z.string(), z.any())).min(1), durationMinutes: z.number().min(1), passScore: z.number().min(1).max(100) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const assessment = { id: `ASM-${Math.floor(1000 + Math.random() * 9000)}`, ...parsed.data, approval: req.user.role === "Admin" ? "Approved" : "Pending", ownerId: req.user.id, createdAt: now() };
  assessments.unshift(assessment);
  audit(req.user.id, "CREATE_ASSESSMENT", "ASSESSMENT", assessment.id, { approval: assessment.approval });
  res.status(201).json({ data: assessment });
});

app.patch("/api/assessments/:id/approval", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ approval: z.enum(["Approved", "Rejected"]), feedback: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const assessment = assessments.find((item) => item.id === req.params.id);
  if (!assessment) return res.status(404).json({ error: "Assessment not found" });
  assessment.approval = parsed.data.approval;
  audit(req.user.id, "ASSESSMENT_APPROVAL", "ASSESSMENT", assessment.id, parsed.data);
  res.json({ data: assessment });
});

app.post("/api/assessments/:id/attempts/start", authenticate, requireRole("User", "Manager", "Admin"), (req, res) => {
  const assessment = assessments.find((item) => item.id === req.params.id && item.approval === "Approved");
  if (!assessment) return res.status(404).json({ error: "Approved assessment not found" });
  const attempt = { id: uuid(), assessmentId: assessment.id, userId: req.user.id, startedAt: now(), submittedAt: null, status: "InProgress", score: null, flags: [] };
  attempts.unshift(attempt);
  audit(req.user.id, "START_ATTEMPT", "ASSESSMENT_ATTEMPT", attempt.id);
  res.status(201).json({ data: attempt, strictRules: assessment.strictMode ? settings : null });
});

app.post("/api/assessments/attempts/:attemptId/submit", authenticate, (req, res) => {
  const attempt = attempts.find((item) => item.id === req.params.attemptId && item.userId === req.user.id);
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });
  const assessment = assessments.find((item) => item.id === attempt.assessmentId);
  const mcqQuestions = assessment.questions.filter((question) => question.type === "MCQ");
  const mcqScore = mcqQuestions.length ? Math.round((mcqQuestions.filter((question) => req.body.answers?.[question.id] === question.answer).length / mcqQuestions.length) * 100) : null;
  Object.assign(attempt, { submittedAt: now(), status: mcqScore === null ? "PendingManualReview" : "Submitted", score: mcqScore });
  audit(req.user.id, "SUBMIT_ATTEMPT", "ASSESSMENT_ATTEMPT", attempt.id, { score: mcqScore });
  res.json({ data: attempt, feedback: mcqScore === null ? "Manual evaluation required" : mcqScore >= assessment.passScore ? "Passed" : "Needs improvement" });
});

app.post("/api/proctoring/events", authenticate, (req, res) => {
  const schema = z.object({ attemptId: z.string(), eventType: z.enum(["FULLSCREEN_EXIT", "TAB_SWITCH", "NOISE", "CAMERA_OFF", "MIC_OFF", "FACE_MISMATCH"]), severity: z.enum(["low", "medium", "high"]), metadata: z.record(z.string(), z.any()).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const event = { id: uuid(), userId: req.user.id, ...parsed.data, createdAt: now() };
  proctoringLogs.unshift(event);
  const attempt = attempts.find((item) => item.id === parsed.data.attemptId);
  if (attempt) attempt.flags.push(event);
  if (settings.tabSwitchAutoSubmit && parsed.data.eventType === "TAB_SWITCH" && attempt) Object.assign(attempt, { status: "AutoSubmitted", submittedAt: now() });
  audit(req.user.id, "PROCTORING_EVENT", "PROCTORING_LOG", event.id, { eventType: event.eventType });
  res.status(201).json({ data: event, autoSubmitted: attempt?.status === "AutoSubmitted" });
});

app.get("/api/analytics/global", authenticate, requireRole("Admin"), (_req, res) => {
  res.json({ users: users.length, activeUsers: users.filter((user) => user.status === "Active").length, courses: courses.length, approvedCourses: courses.filter((course) => course.approval === "Approved").length, completionRate: 78, averageScore: 86, topPerformers: ["Diya Sharma", "Nisha Rao"], lowPerformers: ["Rohan Das"] });
});

app.get("/api/analytics/team", authenticate, requireRole("Manager"), (req, res) => {
  const team = users.filter((user) => user.managerId === req.user.id);
  res.json({ managerId: req.user.id, members: team.map(publicUser), completionRate: 74, skillGaps: ["Secure coding", "Data storytelling"], engagement: "Medium-high" });
});

app.get("/api/analytics/me", authenticate, (req, res) => {
  res.json({ userId: req.user.id, progress: 76, completedCourses: 9, pendingCourses: 3, strengths: ["Communication", "Compliance"], weaknesses: ["Secure coding"], suggestions: ["Complete Secure Coding for Cloud Teams", "Retake practice quiz"] });
});

app.post("/api/reports/export", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({ format: z.enum(["PDF", "Excel"]), reportType: z.enum(["User", "Team", "Course"]), filters: z.record(z.string(), z.any()).default({}) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const report = { id: uuid(), requestedBy: req.user.id, status: "Ready", downloadUrl: `/exports/${uuid()}.${parsed.data.format === "PDF" ? "pdf" : "xlsx"}`, ...parsed.data, createdAt: now() };
  audit(req.user.id, "EXPORT_REPORT", "REPORT", report.id, parsed.data);
  res.status(202).json({ data: report });
});

app.get("/api/settings", authenticate, requireRole("Admin"), (_req, res) => {
  res.json({ data: settings });
});

app.patch("/api/settings", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ fullscreenRequired: z.boolean().optional(), cameraRequired: z.boolean().optional(), microphoneRequired: z.boolean().optional(), tabSwitchAutoSubmit: z.boolean().optional(), noiseThreshold: z.number().min(1).max(100).optional(), maxAssessmentFlags: z.number().min(0).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  settings = { ...settings, ...parsed.data };
  audit(req.user.id, "UPDATE_SETTINGS", "SETTINGS", "proctoring", parsed.data);
  res.json({ data: settings });
});

app.get("/api/audit-logs", authenticate, requireRole("Admin"), (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  res.json({ data: auditLogs.slice(0, limit), total: auditLogs.length });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Nalanda API listening on http://localhost:${PORT}`);
});