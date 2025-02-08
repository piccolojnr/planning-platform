/*
  # Initial Schema Setup for AI Project Planning Platform

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `model` (text) - Development model (Agile, Waterfall, etc.)
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - Reference to projects
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `shared_projects`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - Reference to projects
      - `user_id` (uuid) - Reference to auth.users
      - `role` (text) - User role (viewer, editor)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for project owners and shared users
*/


-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  model text NOT NULL DEFAULT 'agile',
  overview text
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
);


-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  duration integer NOT NULL DEFAULT 0,
  dependencies jsonb,
  status text NOT NULL DEFAULT 'pending',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared_projects table
CREATE TABLE IF NOT EXISTS shared_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create requirements table
CREATE TABLE public.requirements (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subtasks table
CREATE TABLE public.subtasks (
    id uuid default uuid_generate_v4() primary key,
    task_id uuid references public.tasks(id) on delete cascade,
    title text not null,
    description text,
    status text not null default 'pending' check (status in ('pending', 'completed')),
    "order" integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create task_requirements table
CREATE TABLE public.task_requirements (
    id uuid default uuid_generate_v4() primary key,
    task_id uuid references public.tasks(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create feedback table
CREATE TABLE public.feedback (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    type text not null check (type in ('bug', 'feature', 'improvement', 'other')),
    title text not null,
    description text not null,
    status text not null default 'pending' check (status in ('pending', 'in_review', 'accepted', 'rejected', 'implemented')),
    votes integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create feedback_votes table to track who voted
CREATE TABLE public.feedback_votes (
    id uuid default uuid_generate_v4() primary key,
    feedback_id uuid references public.feedback(id) on delete cascade,
    user_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(feedback_id, user_id)
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_projects
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_projects
      WHERE project_id = projects.id AND user_id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view project tasks"
  ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = tasks.project_id AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM shared_projects
          WHERE project_id = projects.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage project tasks"
  ON tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = tasks.project_id AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM shared_projects
          WHERE project_id = projects.id AND user_id = auth.uid() AND role = 'editor'
        )
      )
    )
  );

-- Shared projects policies
CREATE POLICY "Users can view shared projects"
  ON shared_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = shared_projects.project_id AND user_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Project owners can manage shares"
  ON shared_projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = shared_projects.project_id AND user_id = auth.uid()
    )
  );

-- Requirements policies
CREATE POLICY "Users can view requirements for projects they own or are shared with"
    ON requirements
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM shared_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert requirements for projects they own or can edit"
    ON requirements
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM shared_projects WHERE user_id = auth.uid() AND role = 'editor'
        )
    );

CREATE POLICY "Users can update requirements for projects they own or can edit"
    ON requirements
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM shared_projects WHERE user_id = auth.uid() AND role = 'editor'
        )
    );

CREATE POLICY "Users can delete requirements for projects they own or can edit"
    ON requirements
    FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM shared_projects WHERE user_id = auth.uid() AND role = 'editor'
        )
    );

-- Chat messages policies
CREATE POLICY "Users can view chat messages for projects they own or are shared with"
    ON chat_messages
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM shared_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chat messages for projects they own or can edit"
    ON chat_messages
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM shared_projects WHERE user_id = auth.uid() AND role = 'editor'
        )
    );
CREATE POLICY "Users can delete chat messages for projects they own or can edit"
ON chat_messages
FOR DELETE
USING (
    project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
        UNION
        SELECT project_id FROM shared_projects WHERE user_id = auth.uid() AND role = 'editor'
    )
);

-- Subtasks policies
CREATE POLICY "Users can view subtasks for projects they own or are shared with"
    ON subtasks
    FOR SELECT
    USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert subtasks for projects they own or can edit"
    ON subtasks
    FOR INSERT
    WITH CHECK (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid() AND sp.role = 'editor'
        )
    );

CREATE POLICY "Users can update subtasks for projects they own or can edit"
    ON subtasks
    FOR UPDATE
    USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid() AND sp.role = 'editor'
        )
    );

CREATE POLICY "Users can delete subtasks for projects they own or can edit"
    ON subtasks
    FOR DELETE
    USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid() AND sp.role = 'editor'
        )
    );

-- Task requirements policies
CREATE POLICY "Users can view task requirements for projects they own or are shared with"
    ON task_requirements
    FOR SELECT
    USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert task requirements for projects they own or can edit"
    ON task_requirements
    FOR INSERT
    WITH CHECK (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid() AND sp.role = 'editor'
        )
    );

CREATE POLICY "Users can update task requirements for projects they own or can edit"
    ON task_requirements
    FOR UPDATE
    USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid() AND sp.role = 'editor'
        )
    );

CREATE POLICY "Users can delete task requirements for projects they own or can edit"
    ON task_requirements
    FOR DELETE
    USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.user_id = auth.uid()
            UNION
            SELECT t.id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN shared_projects sp ON p.id = sp.project_id
            WHERE sp.user_id = auth.uid() AND sp.role = 'editor'
        )
    );

-- Feedback policies
CREATE POLICY "Users can view all feedback"
    ON feedback
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create feedback"
    ON feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
    ON feedback
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
    ON feedback
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Feedback votes policies
CREATE POLICY "Users can view all feedback votes"
    ON feedback_votes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can vote once per feedback"
    ON feedback_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        NOT EXISTS (
            SELECT 1 FROM feedback_votes
            WHERE feedback_id = feedback_votes.feedback_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove their votes"
    ON feedback_votes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to handle voting
CREATE OR REPLACE FUNCTION handle_feedback_vote()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment vote count
        UPDATE feedback
        SET votes = votes + 1
        WHERE id = NEW.feedback_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement vote count
        UPDATE feedback
        SET votes = votes - 1
        WHERE id = OLD.feedback_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for handling votes
CREATE TRIGGER feedback_vote_trigger
AFTER INSERT OR DELETE ON feedback_votes
FOR EACH ROW
EXECUTE FUNCTION handle_feedback_vote();

CREATE OR REPLACE FUNCTION public.override_project_data(
  p_project_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_tasks JSONB,
  p_requirements JSONB,
  p_overview TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Wrap everything in a transaction
  BEGIN
    -- 1) Update the projects table
    UPDATE projects
    SET title = p_name,
        description = p_description,
        overview = p_overview
    WHERE id = p_project_id;

    -- 2) Delete tasks
    DELETE FROM tasks WHERE project_id = p_project_id;

    -- 3) Insert tasks
    INSERT INTO tasks (project_id, title, description, duration, dependencies)
    SELECT p_project_id,
           t->>'name',
           t->>'description',
           (t->>'duration')::INT,
           (t->>'dependencies')::jsonb
    FROM jsonb_array_elements(p_tasks) AS t;

    -- 4) Delete requirements
    DELETE FROM requirements WHERE project_id = p_project_id;

    -- 5) Insert requirements
    INSERT INTO requirements (project_id, content)
    SELECT p_project_id, r->>'content'
    FROM jsonb_array_elements(p_requirements) as r;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in override_project_data: %', SQLERRM;
      ROLLBACK;  -- or re-raise
  END;
END;
$$;


-- function to reset conversation
CREATE OR REPLACE FUNCTION public.reset_conversation(
  p_project_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Wrap everything in a transaction
  BEGIN
    -- 1) Delete chat messages
    DELETE FROM chat_messages WHERE project_id = p_project_id;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in reset_conversation: %', SQLERRM;
      ROLLBACK;  -- or re-raise
  END;
END;
$$;


-- delete last chat from assistant
CREATE OR REPLACE FUNCTION public.delete_last_chat(
  p_project_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Wrap everything in a transaction
  BEGIN
    -- 1) Delete chat messages
    WITH cte AS (
      SELECT id
      FROM chat_messages
      WHERE project_id = p_project_id AND role = 'assistant'
      ORDER BY created_at DESC
      LIMIT 1
    )
    DELETE FROM chat_messages WHERE id IN (SELECT id FROM cte);

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in delete_last_chat: %', SQLERRM;
      ROLLBACK;  -- or re-raise
  END;
END;
$$;


-- override subtasks
CREATE OR REPLACE FUNCTION public.override_subtasks(
  p_task_id UUID,
  p_subtasks JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Wrap everything in a transaction
  BEGIN
    -- 1) Delete subtasks
    DELETE FROM subtasks WHERE task_id = p_task_id;

    -- 2) Insert subtasks
    INSERT INTO subtasks (task_id, title, description)
    SELECT p_task_id,
           s->>'title',
           s->>'description'
    FROM jsonb_array_elements(p_subtasks) AS s;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in override_subtasks: %', SQLERRM;
      ROLLBACK;  -- or re-raise
  END;
END;
$$;