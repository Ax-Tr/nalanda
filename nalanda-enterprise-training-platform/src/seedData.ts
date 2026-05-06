import { AppData, now, uid } from "./types";

const prefs = { theme: "dark" as const, language: "en" as const, emailNotifications: true, pushNotifications: true, weeklyDigest: true, courseReminders: true, fontSize: "medium" as const, reducedMotion: false, highContrast: false };

export const seedData: AppData = {
  users: [
    { id: "EMP-1001", name: "Nisha Rao", email: "admin@nalanda.local", password: "Password@123", avatar: "NR", role: "Admin", department: "People Ops", designation: "L&D Director", managerId: null, status: "Active", joinedAt: "2024-01-15", lastActive: "Today", preferences: { ...prefs } },
    { id: "EMP-1002", name: "Aarav Menon", email: "aarav@nalanda.local", password: "Password@123", avatar: "AM", role: "Manager", department: "Sales", designation: "Sales Lead", managerId: "EMP-1001", status: "Active", joinedAt: "2024-03-10", lastActive: "Today", preferences: { ...prefs } },
    { id: "EMP-1003", name: "Kabir Sethi", email: "kabir@nalanda.local", password: "Password@123", avatar: "KS", role: "Manager", department: "Engineering", designation: "Tech Lead", managerId: "EMP-1001", status: "Active", joinedAt: "2024-02-20", lastActive: "Yesterday", preferences: { ...prefs } },
    { id: "EMP-1004", name: "Diya Sharma", email: "diya@nalanda.local", password: "Password@123", avatar: "DS", role: "Employee", department: "Engineering", designation: "Software Engineer", managerId: "EMP-1003", status: "Active", joinedAt: "2024-06-01", lastActive: "Today", preferences: { ...prefs } },
    { id: "EMP-1005", name: "Meera Iyer", email: "meera@nalanda.local", password: "Password@123", avatar: "MI", role: "Employee", department: "Sales", designation: "Account Exec", managerId: "EMP-1002", status: "Active", joinedAt: "2024-07-15", lastActive: "2 days ago", preferences: { ...prefs } },
    { id: "EMP-1006", name: "Rohan Das", email: "rohan@nalanda.local", password: "Password@123", avatar: "RD", role: "Employee", department: "Operations", designation: "Ops Analyst", managerId: "EMP-1002", status: "Active", joinedAt: "2024-08-01", lastActive: "Today", preferences: { ...prefs } },
  ],
  skills: [
    { id: "SKILL-SEC", name: "Security", category: "Technical", description: "Secure coding, OWASP controls, and threat modeling.", status: "Active", createdAt: now() },
    { id: "SKILL-LEAD", name: "Leadership", category: "Leadership", description: "Feedback, coaching, and team development practices.", status: "Active", createdAt: now() },
    { id: "SKILL-ANL", name: "Analytics", category: "Functional", description: "Data interpretation, storytelling, and business review skills.", status: "Active", createdAt: now() },
    { id: "SKILL-COMM", name: "Communication", category: "Behavioral", description: "Clear stakeholder communication and presentation skills.", status: "Active", createdAt: now() },
    { id: "SKILL-COMP", name: "Compliance", category: "Compliance", description: "Policy, risk, and regulatory readiness.", status: "Active", createdAt: now() },
  ],
  targetSkills: [
    { id: "TS-001", skillId: "SKILL-SEC", scope: "Department", department: "Engineering", targetLevel: "Advanced", targetScore: 85, priority: "High" },
    { id: "TS-002", skillId: "SKILL-ANL", scope: "Department", department: "Sales", targetLevel: "Intermediate", targetScore: 75, priority: "Medium" },
    { id: "TS-003", skillId: "SKILL-LEAD", scope: "Role", designation: "Sales Lead", targetLevel: "Advanced", targetScore: 85, priority: "High" },
    { id: "TS-004", skillId: "SKILL-COMP", scope: "Organization", targetLevel: "Intermediate", targetScore: 70, priority: "High" },
    { id: "TS-005", skillId: "SKILL-SEC", scope: "Employee", userId: "EMP-1004", targetLevel: "Advanced", targetScore: 90, priority: "High" },
  ],
  courses: [
    { id: "CRS-001", title: "Secure Coding for Cloud Teams", description: "Threat modeling, OWASP controls, and secure release patterns.", skill: "Security", skillIds: ["SKILL-SEC"], targetLevel: "Advanced", prerequisites: [], category: "Technical", tags: ["OWASP", "Cloud"], thumbnailColor: "#22d3ee", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 2, difficulty: "Advanced", estimatedHours: 6, createdAt: now(), updatedAt: now() },
    { id: "CRS-002", title: "Manager Essentials: Feedback Systems", description: "Practical rituals for coaching and performance reviews.", skill: "Leadership", skillIds: ["SKILL-LEAD", "SKILL-COMM"], targetLevel: "Intermediate", prerequisites: [], category: "Soft Skills", tags: ["Coaching", "People"], thumbnailColor: "#a78bfa", ownerId: "EMP-1002", approval: "Approved", status: "Active", version: 1, difficulty: "Intermediate", estimatedHours: 4, createdAt: now(), updatedAt: now() },
    { id: "CRS-003", title: "Data Storytelling for Business Reviews", description: "Build executive narratives with evidence and charts.", skill: "Analytics", skillIds: ["SKILL-ANL"], targetLevel: "Beginner", prerequisites: [], category: "Business", tags: ["BI", "Charts"], thumbnailColor: "#34d399", ownerId: "EMP-1003", approval: "Pending", status: "Active", version: 1, difficulty: "Beginner", estimatedHours: 3, createdAt: now(), updatedAt: now() },
  ],
  chapters: [
    { id: "CH-001", courseId: "CRS-001", sequence: 1, title: "Threat Model Primer", description: "Identify assets, actors, and trust boundaries.", contentType: "Rich Text", body: "A threat model identifies what you're protecting (assets), who might attack (threat actors), where trust changes (boundaries), and what could go wrong (threats). Document controls and validation evidence before every release.", durationMinutes: 25 },
    { id: "CH-002", courseId: "CRS-001", sequence: 2, title: "OWASP Top 10 Deep Dive", description: "Master the OWASP Top 10 vulnerabilities.", contentType: "PDF", body: "Comprehensive walkthrough of all OWASP Top 10 items with real-world exploit examples and mitigation strategies.", fileName: "owasp-top10.pdf", durationMinutes: 35 },
    { id: "CH-003", courseId: "CRS-001", sequence: 3, title: "Secret Scanning & CI/CD", description: "Automated secret detection in pipelines.", contentType: "Video Link", body: "Learn to configure secret scanning tools in your CI/CD pipeline.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", durationMinutes: 20 },
    { id: "CH-004", courseId: "CRS-002", sequence: 1, title: "SBI Feedback Method", description: "Situation, Behavior, Impact framework.", contentType: "Rich Text", body: "The SBI model structures feedback around observable Situations, specific Behaviors, and measurable Impact. This makes feedback concrete and actionable rather than vague.", durationMinutes: 20 },
    { id: "CH-005", courseId: "CRS-002", sequence: 2, title: "Coaching Conversations", description: "Running effective 1:1 coaching sessions.", contentType: "Rich Text", body: "Structure your coaching around GROW: Goal, Reality, Options, Will. Ask powerful questions instead of giving answers.", durationMinutes: 30 },
    { id: "CH-006", courseId: "CRS-003", sequence: 1, title: "Narrative Flow Fundamentals", description: "Start with the decision, show signal, explain risk.", contentType: "Rich Text", body: "Every data story should answer: What decision does this inform? What does the data signal? What's the risk of inaction?", durationMinutes: 20 },
    { id: "CH-007", courseId: "CRS-003", sequence: 2, title: "Chart Selection Patterns", description: "Choosing the right visualization for your data.", contentType: "PDF", body: "Guide to selecting appropriate chart types based on data relationships.", fileName: "chart-patterns.pdf", durationMinutes: 25 },
  ],
  assessments: [
    { id: "ASM-001", title: "Threat Model Assessment", chapterId: "CH-001", courseId: "CRS-001", type: "MCQ", ownerId: "EMP-1003", approval: "Approved", durationMinutes: 15, passScore: 70, questions: [
      { id: "Q-001", type: "MCQ", prompt: "What should be documented first in a threat model?", options: ["Team lunch plan", "Assets and trust boundaries", "Marketing launch", "Sprint velocity"], answer: 1, points: 25 },
      { id: "Q-002", type: "MCQ", prompt: "Which control prevents API key exposure in production?", options: ["Manual approval", "CI secret scanning", "Quarterly email", "Post-release audit"], answer: 1, points: 25 },
    ]},
    { id: "ASM-002", title: "OWASP Knowledge Check", chapterId: "CH-002", courseId: "CRS-001", type: "MCQ", ownerId: "EMP-1003", approval: "Approved", durationMinutes: 20, passScore: 75, questions: [
      { id: "Q-003", type: "MCQ", prompt: "Which OWASP category covers injection attacks?", options: ["A01 Broken Access", "A03 Injection", "A05 Misconfiguration", "A09 Logging"], answer: 1, points: 50 },
    ]},
    { id: "ASM-003", title: "Secret Scanning Quiz", chapterId: "CH-003", courseId: "CRS-001", type: "Mixed", ownerId: "EMP-1003", approval: "Approved", durationMinutes: 15, passScore: 60, questions: [
      { id: "Q-004", type: "MCQ", prompt: "Where should secrets be stored?", options: ["Source code", "Environment variables / vault", "README file", "Slack channel"], answer: 1, points: 30 },
      { id: "Q-005", type: "Descriptive", prompt: "Describe your ideal CI/CD secret scanning setup.", points: 20 },
    ]},
    { id: "ASM-004", title: "SBI Feedback Check", chapterId: "CH-004", courseId: "CRS-002", type: "Descriptive", ownerId: "EMP-1002", approval: "Approved", durationMinutes: 20, passScore: 60, questions: [
      { id: "Q-006", type: "Descriptive", prompt: "Write a feedback note using Situation, Behavior, and Impact.", points: 50 },
    ]},
    { id: "ASM-005", title: "Coaching Assessment", chapterId: "CH-005", courseId: "CRS-002", type: "MCQ", ownerId: "EMP-1002", approval: "Pending", durationMinutes: 15, passScore: 70, questions: [
      { id: "Q-007", type: "MCQ", prompt: "What does GROW stand for?", options: ["Goal Reality Options Will", "Growth Review Outcome Work", "Guide Reflect Observe Write", "Goal Results Objectives Win"], answer: 0, points: 50 },
    ]},
  ],
  enrollments: [
    { id: "ENR-001", courseId: "CRS-001", userId: "EMP-1004", assignedBy: "EMP-1003", dueAt: "2026-05-20", priority: "High", mandatory: true, progress: 66, completedChapters: ["CH-001", "CH-002"], timeSpentMinutes: 84, startedAt: now(), completedAt: null },
    { id: "ENR-002", courseId: "CRS-002", userId: "EMP-1005", assignedBy: "EMP-1002", dueAt: "2026-05-18", priority: "Medium", mandatory: true, progress: 50, completedChapters: ["CH-004"], timeSpentMinutes: 45, startedAt: now(), completedAt: null },
    { id: "ENR-003", courseId: "CRS-001", userId: "EMP-1002", assignedBy: "EMP-1001", dueAt: "2026-05-25", priority: "Medium", mandatory: false, progress: 33, completedChapters: ["CH-001"], timeSpentMinutes: 30, startedAt: now(), completedAt: null },
    { id: "ENR-004", courseId: "CRS-002", userId: "EMP-1006", assignedBy: "EMP-1002", dueAt: "2026-05-10", priority: "Low", mandatory: false, progress: 100, completedChapters: ["CH-004", "CH-005"], timeSpentMinutes: 65, startedAt: now(), completedAt: now() },
  ],
  attempts: [
    { id: "ATT-001", assessmentId: "ASM-001", chapterId: "CH-001", courseId: "CRS-001", userId: "EMP-1004", status: "Passed", score: 85, maxScore: 100, feedback: "Excellent understanding of threat modeling.", answers: { "Q-001": 1, "Q-002": 1 }, startedAt: now(), submittedAt: now() },
    { id: "ATT-002", assessmentId: "ASM-002", chapterId: "CH-002", courseId: "CRS-001", userId: "EMP-1004", status: "Passed", score: 90, maxScore: 100, feedback: "Strong OWASP knowledge.", answers: { "Q-003": 1 }, startedAt: now(), submittedAt: now() },
    { id: "ATT-003", assessmentId: "ASM-004", chapterId: "CH-004", courseId: "CRS-002", userId: "EMP-1005", status: "Passed", score: 78, maxScore: 100, feedback: "Good use of SBI framework.", answers: { "Q-006": "In yesterday's standup (S), you interrupted two team members (B), which made them hesitant to share updates (I)." }, startedAt: now(), submittedAt: now() },
  ],
  chapterFeedbacks: [
    { id: "CF-001", chapterId: "CH-001", courseId: "CRS-001", userId: "EMP-1004", rating: 5, clarity: 5, relevance: 4, comments: "Very clear and practical content.", submittedAt: now() },
    { id: "CF-002", chapterId: "CH-002", courseId: "CRS-001", userId: "EMP-1004", rating: 4, clarity: 4, relevance: 5, comments: "PDF was comprehensive but dense.", submittedAt: now() },
  ],
  skillRatings: [
    { id: "SK-001", userId: "EMP-1004", skill: "Security", score: 87, assessmentsBased: 2, trend: "up", lastUpdated: now() },
    { id: "SK-002", userId: "EMP-1004", skill: "Leadership", score: 42, assessmentsBased: 0, trend: "stable", lastUpdated: now() },
    { id: "SK-003", userId: "EMP-1004", skill: "Analytics", score: 55, assessmentsBased: 0, trend: "stable", lastUpdated: now() },
    { id: "SK-004", userId: "EMP-1004", skill: "Communication", score: 70, assessmentsBased: 1, trend: "up", lastUpdated: now() },
    { id: "SK-005", userId: "EMP-1004", skill: "Compliance", score: 63, assessmentsBased: 1, trend: "stable", lastUpdated: now() },
    { id: "SK-006", userId: "EMP-1005", skill: "Leadership", score: 78, assessmentsBased: 1, trend: "up", lastUpdated: now() },
    { id: "SK-007", userId: "EMP-1005", skill: "Security", score: 35, assessmentsBased: 0, trend: "stable", lastUpdated: now() },
    { id: "SK-008", userId: "EMP-1005", skill: "Communication", score: 82, assessmentsBased: 1, trend: "up", lastUpdated: now() },
    { id: "SK-009", userId: "EMP-1006", skill: "Leadership", score: 91, assessmentsBased: 2, trend: "up", lastUpdated: now() },
    { id: "SK-010", userId: "EMP-1002", skill: "Security", score: 72, assessmentsBased: 1, trend: "up", lastUpdated: now() },
    { id: "SK-011", userId: "EMP-1002", skill: "Leadership", score: 88, assessmentsBased: 2, trend: "up", lastUpdated: now() },
  ],
  audit: [{ id: "AUD-001", actorId: "EMP-1001", action: "System initialized", entity: "SYSTEM", at: now() }],
};
