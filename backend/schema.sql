create extension if not exists pg_trgm;

create table if not exists teams (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists standings (
  team_slug text primary key references teams(slug) on delete cascade,
  position integer not null,
  matches_played integer not null,
  wins integer not null,
  draws integer not null,
  loses integer not null,
  goals_for integer not null,
  goals_against integer not null,
  goal_difference integer not null,
  points integer not null,
  form jsonb not null default '[]'::jsonb,
  home_win_rate numeric not null default 0,
  away_win_rate numeric not null default 0,
  goals_per_match numeric not null default 0,
  xg_per_match numeric not null default 0,
  avg_rating numeric not null default 0,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists matches (
  match_id text primary key,
  team_slug text not null references teams(slug) on delete cascade,
  round_number integer not null,
  match_date date,
  match_label text,
  score text,
  venue text,
  opponent text,
  result text,
  avg_rating numeric,
  passes numeric,
  accurate_passes numeric,
  pass_accuracy_pct numeric,
  shots numeric,
  shots_on_target numeric,
  goals numeric,
  xg numeric,
  goals_for integer,
  goals_against integer,
  goal_difference integer,
  points integer,
  tackles numeric,
  tackles_won numeric,
  ball_recoveries numeric,
  interceptions numeric,
  key_passes numeric,
  crosses numeric,
  raw jsonb not null default '{}'::jsonb
);

create index if not exists matches_team_round_idx on matches(team_slug, round_number);
create index if not exists matches_result_idx on matches(result);

create table if not exists players (
  id bigserial primary key,
  player text not null,
  team_slug text references teams(slug) on delete set null,
  team text not null,
  pos text,
  position_label text,
  minutes numeric,
  matches_played numeric,
  overall numeric,
  distribution numeric,
  duels numeric,
  shooting numeric,
  defensive numeric,
  discipline numeric,
  goalkeeping numeric,
  possession_control numeric,
  goals numeric,
  xg numeric,
  xa numeric,
  assists numeric,
  passes numeric,
  accurate_passes numeric,
  pass_accuracy_pct numeric,
  shots numeric,
  shots_on_target numeric,
  tackles numeric,
  tackles_won numeric,
  clearances numeric,
  interceptions numeric,
  ball_recoveries numeric,
  saves numeric,
  raw jsonb not null default '{}'::jsonb,
  unique(player, team)
);

create index if not exists players_search_idx on players using gin (player gin_trgm_ops);
create index if not exists players_team_pos_idx on players(team_slug, pos);

create table if not exists formations (
  id bigserial primary key,
  team_slug text not null references teams(slug) on delete cascade,
  round_number integer,
  home text,
  away text,
  score text,
  formation text,
  opponent_formation text,
  result text,
  goals_for integer,
  goals_against integer,
  formation_frequency integer,
  raw jsonb not null default '{}'::jsonb
);

create index if not exists formations_team_round_idx on formations(team_slug, round_number);

create table if not exists team_metrics (
  id bigserial primary key,
  team_slug text not null references teams(slug) on delete cascade,
  metric text not null,
  team_value text,
  league_avg text,
  rank text,
  raw jsonb not null default '{}'::jsonb,
  unique(team_slug, metric)
);

create table if not exists league_summary (
  id boolean primary key default true,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint league_summary_singleton check (id)
);

create or replace view team_season_summary as
select
  t.slug,
  t.name,
  s.position,
  s.matches_played,
  s.wins,
  s.draws,
  s.loses,
  s.goals_for,
  s.goals_against,
  s.goal_difference,
  s.points,
  round(avg(m.xg)::numeric, 3) as avg_xg,
  round(avg(m.avg_rating)::numeric, 3) as avg_rating,
  round(avg(m.passes)::numeric, 2) as avg_passes,
  round(avg(m.shots)::numeric, 2) as avg_shots,
  round(avg(m.tackles)::numeric, 2) as avg_tackles,
  round(avg(m.ball_recoveries)::numeric, 2) as avg_ball_recoveries
from teams t
join standings s on s.team_slug = t.slug
left join matches m on m.team_slug = t.slug
group by t.slug, t.name, s.position, s.matches_played, s.wins, s.draws, s.loses, s.goals_for, s.goals_against, s.goal_difference, s.points;

create or replace view player_comparison_base as
select
  id,
  player,
  team,
  team_slug,
  pos,
  position_label,
  minutes,
  matches_played,
  overall,
  goals,
  xg,
  xa,
  assists,
  shots_on_target,
  (raw ->> 'Key Passes')::numeric as key_passes,
  tackles,
  ball_recoveries,
  saves,
  raw
from players;
