create table if not exists appointments (
  id text primary key,
  name text not null,
  service text not null,
  start timestamptz not null,
  duration_minutes integer not null default 30,
  status text not null default 'booked',
  created_at timestamptz not null default now()
);

create index if not exists appointments_start_idx on appointments(start);
create index if not exists appointments_status_idx on appointments(status);
