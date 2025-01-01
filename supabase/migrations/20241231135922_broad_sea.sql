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
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
  create table public.requirements (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
create table public.chat_messages (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;
alter table public.requirements enable row level security;
alter table public.chat_messages enable row level security;

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
create policy "Users can view requirements for projects they own or are shared with"
    on requirements for select
    using (
        project_id in (
            select id from projects where user_id = auth.uid()
            union
            select project_id from shared_projects where user_id = auth.uid()
        )
    );

create policy "Users can insert requirements for projects they own or can edit"
    on requirements for insert
    with check (
        project_id in (
            select id from projects where user_id = auth.uid()
            union
            select project_id from shared_projects where user_id = auth.uid() and role = 'editor'
        )
    );

create policy "Users can update requirements for projects they own or can edit"
    on requirements for update
    using (
        project_id in (
            select id from projects where user_id = auth.uid()
            union
            select project_id from shared_projects where user_id = auth.uid() and role = 'editor'
        )
    );

create policy "Users can delete requirements for projects they own or can edit"
    on requirements for delete
    using (
        project_id in (
            select id from projects where user_id = auth.uid()
            union
            select project_id from shared_projects where user_id = auth.uid() and role = 'editor'
        )
    );

-- Chat messages policies
create policy "Users can view chat messages for projects they own or are shared with"
    on chat_messages for select
    using (
        project_id in (
            select id from projects where user_id = auth.uid()
            union
            select project_id from shared_projects where user_id = auth.uid()
        )
    );

create policy "Users can insert chat messages for projects they own or can edit"
    on chat_messages for insert
    with check (
        project_id in (
            select id from projects where user_id = auth.uid()
            union
            select project_id from shared_projects where user_id = auth.uid() and role = 'editor'
        )
    );


CREATE OR REPLACE FUNCTION public.override_project_data(
  p_project_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_tasks JSONB,
  p_requirements JSONB
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
        description = p_description
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
