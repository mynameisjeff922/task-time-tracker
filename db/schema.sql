-- Database tables for Task Time Tracker (PostgreSQL / Supabase).
-- Safe to run more than once: "if not exists" skips anything already created.
-- Run it with: npm run db:setup

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text not null -- bcrypt hash, never the real password
);

create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 100),
  notes      text not null default '',
  category   text not null check (category in ('task', 'training')),
  status     text not null default 'todo' check (status in ('todo', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists time_entries (
  id       uuid primary key default gen_random_uuid(),
  task_id  uuid not null references tasks (id) on delete cascade, -- deleting a task deletes its time
  start_at timestamptz not null,
  end_at   timestamptz, -- null while the timer is running
  note     text not null default '',
  check (end_at is null or end_at >= start_at)
);

create index if not exists time_entries_task_id_idx on time_entries (task_id);

-- Only one timer can run at a time: at most one row may have end_at = null.
create unique index if not exists one_running_timer on time_entries ((true)) where end_at is null;

-- Supabase also exposes tables through its public REST API. Turning on Row Level Security
-- with no policies blocks that API completely; the app connects directly as the database
-- owner, which isn't affected.
alter table users enable row level security;
alter table tasks enable row level security;
alter table time_entries enable row level security;
