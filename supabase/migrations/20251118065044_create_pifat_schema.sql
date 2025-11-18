/*
  # PIFAT Database Schema - Digital Forensics & Acquisition Toolkit

  ## Overview
  Complete database schema for a portable AI-powered digital & IoT forensics system
  supporting evidence capture, chain of custody, AI analysis, and case management.

  ## Tables Created

  1. **users** - System users with role-based access
     - user_id (uuid, PK)
     - name, email, role, password_hash
     - last_login timestamp
     - created_at, updated_at

  2. **cases** - Investigation cases
     - case_id (uuid, PK)
     - title, description
     - created_by, assigned_to (FK to users)
     - status (open, in_progress, closed, archived)
     - created_at, updated_at

  3. **devices** - Captured devices in evidence
     - device_id (uuid, PK)
     - case_id (FK to cases)
     - device_category, device_type
     - manufacturer, model, serial_number
     - ai_fingerprint_result (jsonb)
     - metadata_json (jsonb)
     - created_at

  4. **evidence** - Evidence files and data
     - evidence_id (uuid, PK)
     - case_id, device_id (FKs)
     - file_path, encryption_key_ref
     - size, sha256_hash, md5_hash
     - uploaded_by (FK to users)
     - ai_status (pending, analyzing, complete)
     - uploaded_at

  5. **ai_results** - AI/ML analysis results
     - ai_id (uuid, PK)
     - evidence_id (FK)
     - classifier_output, anomaly_output
     - fingerprint_output, summary_report
     - risk_score (0-100)
     - created_at

  6. **chain_of_custody** - Immutable evidence trail
     - coc_id (uuid, PK)
     - evidence_id (FK)
     - action, performed_by (FK to users)
     - timestamp
     - hash_prev, hash_current (for hash chaining)

  7. **logs** - Immutable system audit logs
     - log_id (uuid, PK)
     - case_id, user_id (FKs, nullable)
     - action, details (jsonb)
     - timestamp, ip_address
     - hash_prev, hash_current (for hash chaining)

  8. **tasks** - Case investigation tasks
     - task_id (uuid, PK)
     - case_id, assigned_to (FKs)
     - description, status
     - deadline, created_at, updated_at

  ## Security
  - RLS enabled on all tables
  - Policies enforce role-based access
  - Chain of custody and logs use hash chaining for tamper-proofing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'analyst', 'field_officer', 'reviewer')),
  password_hash text NOT NULL,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  case_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES users(user_id),
  assigned_to uuid REFERENCES users(user_id),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  device_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(case_id) ON DELETE CASCADE,
  device_category text NOT NULL,
  device_type text,
  manufacturer text,
  model text,
  serial_number text,
  ai_fingerprint_result jsonb,
  metadata_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
  evidence_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(case_id) ON DELETE CASCADE,
  device_id uuid REFERENCES devices(device_id) ON DELETE SET NULL,
  file_path text NOT NULL,
  encryption_key_ref text,
  size bigint,
  sha256_hash text NOT NULL,
  md5_hash text,
  uploaded_by uuid REFERENCES users(user_id),
  ai_status text DEFAULT 'pending' CHECK (ai_status IN ('pending', 'analyzing', 'complete', 'failed')),
  uploaded_at timestamptz DEFAULT now()
);

-- AI Results table
CREATE TABLE IF NOT EXISTS ai_results (
  ai_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid REFERENCES evidence(evidence_id) ON DELETE CASCADE,
  classifier_output jsonb,
  anomaly_output jsonb,
  fingerprint_output jsonb,
  summary_report text,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at timestamptz DEFAULT now()
);

-- Chain of Custody table
CREATE TABLE IF NOT EXISTS chain_of_custody (
  coc_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid REFERENCES evidence(evidence_id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid REFERENCES users(user_id),
  timestamp timestamptz DEFAULT now(),
  hash_prev text,
  hash_current text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(case_id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  ip_address text,
  hash_prev text,
  hash_current text NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(case_id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(user_id) ON DELETE SET NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_devices_case_id ON devices(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_device_id ON evidence(device_id);
CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_ai_results_evidence_id ON ai_results(evidence_id);
CREATE INDEX IF NOT EXISTS idx_coc_evidence_id ON chain_of_custody(evidence_id);
CREATE INDEX IF NOT EXISTS idx_logs_case_id ON logs(case_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_of_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cases
CREATE POLICY "Users can view assigned cases"
  ON cases FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Users can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "Admins and case owners can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for devices
CREATE POLICY "Users can view devices in accessible cases"
  ON devices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.case_id = devices.case_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role IN ('admin', 'reviewer')
        )
      )
    )
  );

CREATE POLICY "Users can insert devices in accessible cases"
  ON devices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.case_id = devices.case_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role IN ('admin', 'field_officer')
        )
      )
    )
  );

-- RLS Policies for evidence
CREATE POLICY "Users can view evidence in accessible cases"
  ON evidence FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.case_id = evidence.case_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role IN ('admin', 'reviewer')
        )
      )
    )
  );

CREATE POLICY "Users can upload evidence to accessible cases"
  ON evidence FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.case_id = evidence.case_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role IN ('admin', 'field_officer')
        )
      )
    )
  );

-- RLS Policies for ai_results
CREATE POLICY "Users can view AI results for accessible evidence"
  ON ai_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      JOIN cases ON cases.case_id = evidence.case_id
      WHERE evidence.evidence_id = ai_results.evidence_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role IN ('admin', 'reviewer')
        )
      )
    )
  );

-- RLS Policies for chain_of_custody
CREATE POLICY "Users can view CoC for accessible evidence"
  ON chain_of_custody FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      JOIN cases ON cases.case_id = evidence.case_id
      WHERE evidence.evidence_id = chain_of_custody.evidence_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role IN ('admin', 'reviewer')
        )
      )
    )
  );

CREATE POLICY "Authenticated users can create CoC entries"
  ON chain_of_custody FOR INSERT
  TO authenticated
  WITH CHECK (performed_by = auth.uid());

-- RLS Policies for logs
CREATE POLICY "Admins can view all logs"
  ON logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own logs"
  ON logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create logs"
  ON logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in accessible cases"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.case_id = tasks.case_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role IN ('admin', 'reviewer')
        )
      )
    )
  );

CREATE POLICY "Users can create tasks in accessible cases"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.case_id = tasks.case_id
      AND (
        cases.created_by = auth.uid() OR
        cases.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can update assigned tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.case_id = tasks.case_id
      AND (
        cases.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );