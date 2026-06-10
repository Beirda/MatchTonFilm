-- Migration 004 — Persistance des votes (GH-8)
-- Généré le 2026-06-10
--
-- Table votes : like/dislike par (user, groupe, film). La clé primaire
-- composite empêche les doublons et permet un upsert (re-swipe = vote
-- mis à jour plutôt que dupliqué).


create table if not exists votes (
  user_id    uuid        not null references profiles(id) on delete cascade,
  group_id   uuid        not null references groups(id) on delete cascade,
  movie_id   integer     not null,
  vote       text        not null check (vote in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  primary key (user_id, group_id, movie_id)
);

alter table votes enable row level security;

create policy "votes: lecture par les membres du groupe"
  on votes for select
  using (is_group_member(group_id));

create policy "votes: CRUD ses propres votes"
  on votes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_votes_group on votes(group_id);
