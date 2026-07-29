-- Subscriptions table for Flutterwave payments
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  customer_email text not null default '',
  flutterwave_transaction_id text unique,
  flutterwave_plan_id text not null default '',
  flutterwave_customer_id text,
  plan_name text not null default 'starter',
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled', 'expired', 'failed')),
  amount numeric default 0,
  currency text default 'NGN',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  cancelled_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table subscriptions enable row level security;

-- Users can read their own subscriptions
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (user_id = auth.uid());

-- Users can insert their own subscriptions
create policy "Users can insert own subscriptions"
  on subscriptions for insert
  with check (user_id = auth.uid());

-- Users can update their own subscriptions
create policy "Users can update own subscriptions"
  on subscriptions for update
  using (user_id = auth.uid());

-- Service role can manage all subscriptions (for webhooks)
create policy "Service role can manage subscriptions"
  on subscriptions for all
  using (true)
  with check (true);

-- Trigger for updated_at
create trigger set_updated_at_subscriptions
  before update on subscriptions
  for each row execute function update_updated_at_column();

-- Indexes
create index idx_subscriptions_user_id on subscriptions(user_id);
create index idx_subscriptions_status on subscriptions(status);
create index idx_subscriptions_flutterwave_tx_id on subscriptions(flutterwave_transaction_id);

-- Unique constraint on user_id for one active subscription per user
create unique index idx_subscriptions_user_active on subscriptions(user_id) where status = 'active';
