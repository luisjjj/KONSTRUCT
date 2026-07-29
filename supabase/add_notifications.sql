-- Notifications table for in-app notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('phase', 'payment', 'dispute', 'evidence', 'system')),
  read boolean default false,
  link text,
  created_at timestamptz default now() not null
);

alter table notifications enable row level security;

-- Users can read their own notifications
create policy "Users can read own notifications"
  on notifications for select
  using (user_id = auth.uid());

-- Authenticated users can insert notifications
create policy "Authenticated users can insert notifications"
  on notifications for insert
  to authenticated
  with check (true);

-- Users can update own notifications (mark as read)
create policy "Users can update own notifications"
  on notifications for update
  using (user_id = auth.uid());

-- Users can delete own notifications
create policy "Users can delete own notifications"
  on notifications for delete
  using (user_id = auth.uid());

-- Indexes
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_read on notifications(read);
create index idx_notifications_created_at on notifications(created_at desc);
