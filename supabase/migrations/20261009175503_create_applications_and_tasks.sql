-- Job Tracker schema: applications and tasks, isolated per user with RLS.

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company text not null check (char_length(company) between 1 and 200),
  position text not null check (char_length(position) between 1 and 200),
  status text not null default 'applied'
    check (status in ('applied', 'interviewing', 'offer', 'rejected')),
  applied_on date not null default current_date,
  notes text check (char_length(notes) <= 5000),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications (user_id);
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_application_id_idx on public.tasks (application_id);

alter table public.applications enable row level security;
alter table public.tasks enable row level security;

-- Applications
create policy "Users can view their own applications"
  on public.applications for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own applications"
  on public.applications for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own applications"
  on public.applications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own applications"
  on public.applications for delete to authenticated
  using (user_id = (select auth.uid()));

-- Tasks (a task may only point to an application owned by the same user)
create policy "Users can view their own tasks"
  on public.tasks for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own tasks"
  on public.tasks for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = (select auth.uid())
    )
  );

create policy "Users can update their own tasks"
  on public.tasks for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = (select auth.uid())
    )
  );

create policy "Users can delete their own tasks"
  on public.tasks for delete to authenticated
  using (user_id = (select auth.uid()));
