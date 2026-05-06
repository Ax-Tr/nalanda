// Types for the Nalanda L&D Platform
export type Role = "Admin" | "Manager" | "Employee";
export type ModuleKey = "dashboard" | "my-learning" | "courses" | "chapters" | "assessments" | "team" | "users" | "settings" | "skills" | "reports";
export type Status = "Active" | "Inactive";
export type Approval = "Approved" | "Pending" | "Rejected";
export type AssessmentType = "MCQ" | "Descriptive" | "Mixed";
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: Role;
  department: string;
  designation: string;
  managerId: string | null;
  status: Status;
  joinedAt: string;
  lastActive: string;
  preferences: UserPreferences;
};

export type UserPreferences = {
  theme: "dark" | "light" | "system";
  language: "en" | "hi" | "ta";
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  courseReminders: boolean;
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;
  highContrast: boolean;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  skill: string;
  skillIds: string[];
  targetLevel: SkillLevel;
  prerequisites: string[];
  category: string;
  tags: string[];
  thumbnailColor: string;
  ownerId: string;
  approval: Approval;
  status: Status;
  version: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
};

export type Chapter = {
  id: string;
  courseId: string;
  sequence: number;
  title: string;
  description: string;
  contentType: "Rich Text" | "PDF" | "Video Link";
  body: string;
  url?: string;
  fileName?: string;
  durationMinutes: number;
  isCompleted?: boolean;
};

export type ChapterFeedback = {
  id: string;
  chapterId: string;
  courseId: string;
  userId: string;
  rating: number; // 1-5
  clarity: number; // 1-5
  relevance: number; // 1-5
  comments: string;
  submittedAt: string;
};

export type Assessment = {
  id: string;
  title: string;
  chapterId: string;
  courseId: string;
  type: AssessmentType;
  ownerId: string;
  approval: Approval;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  passScore: number;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
};

export type Question = {
  id: string;
  type: "MCQ" | "Descriptive";
  prompt: string;
  options?: string[];
  answer?: number;
  points: number;
};

export type Attempt = {
  id: string;
  assessmentId: string;
  chapterId: string;
  courseId: string;
  userId: string;
  status: "InProgress" | "Submitted" | "Passed" | "Failed";
  score: number | null;
  maxScore: number;
  feedback: string;
  answers: Record<string, string | number>;
  startedAt: string;
  submittedAt: string | null;
};

export type Enrollment = {
  id: string;
  courseId: string;
  userId: string;
  assignedBy: string;
  dueAt: string | null;
  priority: "Low" | "Medium" | "High";
  mandatory: boolean;
  progress: number;
  completedChapters: string[];
  timeSpentMinutes: number;
  startedAt: string;
  completedAt: string | null;
};

export type SkillRating = {
  id: string;
  userId: string;
  skill: string;
  score: number; // 0-100
  assessmentsBased: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
};

export type Skill = {
  id: string;
  name: string;
  category: "Technical" | "Functional" | "Leadership" | "Compliance" | "Behavioral";
  description: string;
  status: Status;
  createdAt: string;
};

export type TargetSkill = {
  id: string;
  skillId: string;
  scope: "Organization" | "Department" | "Role" | "Employee";
  department?: string;
  designation?: string;
  userId?: string;
  targetLevel: SkillLevel;
  targetScore: number;
  priority: "Low" | "Medium" | "High";
};

export type Audit = {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  at: string;
};

export type AppData = {
  users: User[];
  skills: Skill[];
  targetSkills: TargetSkill[];
  courses: Course[];
  chapters: Chapter[];
  assessments: Assessment[];
  enrollments: Enrollment[];
  attempts: Attempt[];
  chapterFeedbacks: ChapterFeedback[];
  skillRatings: SkillRating[];
  audit: Audit[];
};

export const navByRole: Record<Role, { key: ModuleKey; label: string; icon: string }[]> = {
  Admin: [
    { key: "dashboard", label: "Command Center", icon: "◆" },
    { key: "users", label: "User Management", icon: "◈" },
    { key: "courses", label: "Courses", icon: "◇" },
    { key: "assessments", label: "Assessments", icon: "◎" },
    { key: "skills", label: "Skill Master", icon: "◉" },
    { key: "reports", label: "Analytics", icon: "▦" },
    { key: "settings", label: "Settings", icon: "⚙" },
  ],
  Manager: [
    { key: "dashboard", label: "Team Dashboard", icon: "◆" },
    { key: "my-learning", label: "My Learning", icon: "▶" },
    { key: "courses", label: "Course Studio", icon: "◇" },
    { key: "assessments", label: "Assessment Studio", icon: "◎" },
    { key: "team", label: "Team Monitor", icon: "◈" },
    { key: "settings", label: "Settings", icon: "⚙" },
  ],
  Employee: [
    { key: "dashboard", label: "My Learning", icon: "◆" },
    { key: "courses", label: "My Courses", icon: "◇" },
    { key: "skills", label: "Skill Analysis", icon: "◉" },
    { key: "settings", label: "Settings", icon: "⚙" },
  ],
};

export const colors = ["#22d3ee", "#a78bfa", "#34d399", "#f59e0b", "#fb7185", "#818cf8", "#2dd4bf", "#f472b6"];
export const now = () => new Date().toISOString();
export const uid = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
