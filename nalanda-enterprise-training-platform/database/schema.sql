-- Nalanda Training & Development PostgreSQL schema
-- Designed for RBAC, immutable audit history, course versioning, strict assessments, and reporting.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'User');
CREATE TYPE lifecycle_status AS ENUM ('Active', 'Inactive');
CREATE TYPE approval_status AS ENUM ('Draft', 'Pending', 'Approved', 'Rejected');
CREATE TYPE assessment_type AS ENUM ('MCQ', 'Descriptive', 'Timed Quiz');
CREATE TYPE attempt_status AS ENUM ('InProgress', 'Submitted', 'AutoSubmitted', 'PendingManualReview', 'Evaluated');
CREATE TYPE proctor_event_type AS ENUM ('FULLSCREEN_EXIT', 'TAB_SWITCH', 'NOISE', 'CAMERA_OFF', 'MIC_OFF', 'FACE_MISMATCH');

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'User',
  department_id UUID REFERENCES departments(id),
  manager_id TEXT REFERENCES users(id),
  status lifecycle_status NOT NULL DEFAULT 'Active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_not_self_managed CHECK (manager_id IS NULL OR manager_id <> id)
);

CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_department ON users(department_id);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  parent_skill_id UUID REFERENCES skills(id)
);

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_id UUID REFERENCES skills(id),
  tags TEXT[] NOT NULL DEFAULT '{}',
  status lifecycle_status NOT NULL DEFAULT 'Active',
  approval approval_status NOT NULL DEFAULT 'Draft',
  owner_id TEXT NOT NULL REFERENCES users(id),
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_status_approval ON courses(status, approval);
CREATE INDEX idx_courses_skill ON courses(skill_id);

CREATE TABLE course_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id),
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  change_note TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, version)
);

CREATE TABLE course_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_id UUID NOT NULL REFERENCES course_versions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('PDF', 'Rich Text', 'Video Link', 'Embedded Video', 'Uploaded Video')),
  title TEXT NOT NULL,
  body TEXT,
  storage_key TEXT,
  external_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE course_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id),
  version INTEGER NOT NULL,
  requested_by TEXT NOT NULL REFERENCES users(id),
  reviewed_by TEXT REFERENCES users(id),
  status approval_status NOT NULL DEFAULT 'Pending',
  feedback TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  assigned_by TEXT NOT NULL REFERENCES users(id),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES course_assignments(id) ON DELETE CASCADE,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assessments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  type assessment_type NOT NULL,
  strict_mode BOOLEAN NOT NULL DEFAULT true,
  duration_minutes INTEGER NOT NULL,
  pass_score NUMERIC(5,2) NOT NULL CHECK (pass_score >= 0 AND pass_score <= 100),
  approval approval_status NOT NULL DEFAULT 'Draft',
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_assessments_approval ON assessments(approval);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_type assessment_type NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB,
  max_score NUMERIC(6,2) NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  status attempt_status NOT NULL DEFAULT 'InProgress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  feedback TEXT,
  evaluated_by TEXT REFERENCES users(id)
);

CREATE INDEX idx_attempts_user ON assessment_attempts(user_id, started_at DESC);
CREATE INDEX idx_attempts_assessment ON assessment_attempts(assessment_id);

CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  answer JSONB NOT NULL,
  auto_score NUMERIC(6,2),
  manual_score NUMERIC(6,2),
  feedback TEXT,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE proctoring_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  event_type proctor_event_type NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proctoring_attempt ON proctoring_logs(attempt_id, created_at DESC);

CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by TEXT REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT NOT NULL REFERENCES users(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('User', 'Team', 'Course')),
  format TEXT NOT NULL CHECK (format IN ('PDF', 'Excel')),
  filters JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Queued',
  storage_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);

CREATE VIEW analytics_course_effectiveness AS
SELECT
  c.id AS course_id,
  c.title,
  COUNT(DISTINCT ca.user_id) AS assigned_users,
  AVG(cp.progress_percent) AS avg_completion,
  AVG(aa.score) AS avg_assessment_score
FROM courses c
LEFT JOIN course_assignments ca ON ca.course_id = c.id
LEFT JOIN course_progress cp ON cp.assignment_id = ca.id
LEFT JOIN assessments a ON a.course_id = c.id
LEFT JOIN assessment_attempts aa ON aa.assessment_id = a.id
GROUP BY c.id, c.title;

-- Soft-delete status for assessments
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS status lifecycle_status NOT NULL DEFAULT 'Active';
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Super Admin deletion archive with mandatory audit metadata
CREATE TABLE deleted_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('User', 'Course', 'Assessment')),
  entity_id TEXT NOT NULL,
  entity_data JSONB NOT NULL,
  related_data JSONB NOT NULL DEFAULT '{}',
  deleted_by TEXT NOT NULL REFERENCES users(id),
  deletion_comment TEXT NOT NULL CHECK (length(trim(deletion_comment)) >= 10),
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_archives_entity ON deleted_archives(entity_type, deleted_at DESC);
CREATE INDEX idx_archives_deleted_by ON deleted_archives(deleted_by);