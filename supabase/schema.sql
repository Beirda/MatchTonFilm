-- =============================================================================
-- MatchTonFilm — Supabase Schema
-- =============================================================================
-- Couverture : GH-1 (Auth), GH-2 (Préférences), GH-3 (Groupes), GH-4 (Gestion groupe)
-- Tables futures : votes, matches (GH-8, GH-9)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()


-- -----------------------------------------------------------------------------
-- GH-1 : profiles
-- Étend auth.users avec les infos d'affichage.
-- Créée automatiquement via trigger après inscription.
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_color text        not null default '#ff3b47',
  created_at   timestamptz not null default now()
);

-- Trigger : crée le profil dès qu'un user s'inscrit
create or replace function handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- -----------------------------------------------------------------------------
-- GH-2 : user_genres
-- Genres TMDB préférés de l'utilisateur (onboarding).
-- -----------------------------------------------------------------------------
create table if not exists user_genres (
  user_id       uuid    not null references profiles(id) on delete cascade,
  tmdb_genre_id integer not null,
  genre_name    text    not null,
  primary key (user_id, tmdb_genre_id)
);


-- -----------------------------------------------------------------------------
-- GH-2 : user_films
-- Films TMDB préférés de l'utilisateur (onboarding).
-- -----------------------------------------------------------------------------
create table if not exists user_films (
  user_id     uuid    not null references profiles(id) on delete cascade,
  tmdb_id     integer not null,
  title       text    not null,
  poster_path text,
  primary key (user_id, tmdb_id)
);


-- -----------------------------------------------------------------------------
-- GH-3 + GH-4 : groups
-- Groupe de visionnage avec ses paramètres de filtrage.
-- -----------------------------------------------------------------------------
create table if not exists groups (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  emoji           text        not null default '🍿',
  accent          text        not null default '#ff3b47',
  -- Code court unique pour le lien d'invitation (8 chars hex)
  invitation_code text        unique not null
    default substring(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  -- Paramètres de filtrage (GH-4)
  genres          text[]      not null default '{}',
  age_rating      text        not null default 'Tous'
    check (age_rating in ('Tous', '12+', '16+', '18+')),
  language        text        not null default 'VF + VOSTFR'
    check (language in ('VF', 'VOSTFR', 'VF + VOSTFR')),
  -- Méta
  created_by      uuid        references profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- GH-3 + GH-4 : group_members
-- Table de jonction user <-> groupe avec rôle.
-- -----------------------------------------------------------------------------
create table if not exists group_members (
  group_id  uuid        not null references groups(id) on delete cascade,
  user_id   uuid        not null references profiles(id) on delete cascade,
  role      text        not null default 'member'
    check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table profiles      enable row level security;
alter table user_genres   enable row level security;
alter table user_films    enable row level security;
alter table groups        enable row level security;
alter table group_members enable row level security;


-- profiles : accès à son propre profil uniquement
create policy "profiles: lecture publique"
  on profiles for select
  using (true);

create policy "profiles: modification son propre profil"
  on profiles for update
  using (auth.uid() = id);


-- user_genres : accès à ses propres préférences
create policy "user_genres: CRUD ses propres genres"
  on user_genres for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- user_films : accès à ses propres préférences
create policy "user_films: CRUD ses propres films"
  on user_films for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- groups : visible par les membres, modifiable par l'admin
create policy "groups: lecture par les membres"
  on groups for select
  using (
    exists (
      select 1 from group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

create policy "groups: création authentifiée"
  on groups for insert
  with check (auth.uid() = created_by);

create policy "groups: modification par l'admin"
  on groups for update
  using (
    exists (
      select 1 from group_members
      where group_id = groups.id and user_id = auth.uid() and role = 'admin'
    )
  );

create policy "groups: suppression par l'admin"
  on groups for delete
  using (
    exists (
      select 1 from group_members
      where group_id = groups.id and user_id = auth.uid() and role = 'admin'
    )
  );


-- group_members : visible par tous les membres du groupe
create policy "group_members: lecture par les membres"
  on group_members for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );

create policy "group_members: rejoindre un groupe"
  on group_members for insert
  with check (auth.uid() = user_id);

create policy "group_members: quitter un groupe"
  on group_members for delete
  using (auth.uid() = user_id);


-- =============================================================================
-- INDEXES (performance)
-- =============================================================================
create index if not exists idx_user_genres_user_id  on user_genres(user_id);
create index if not exists idx_user_films_user_id   on user_films(user_id);
create index if not exists idx_group_members_group  on group_members(group_id);
create index if not exists idx_group_members_user   on group_members(user_id);
create index if not exists idx_groups_invitation    on groups(invitation_code);


-- =============================================================================
-- NOTES FUTURES
-- =============================================================================
-- GH-5  : rejoindre via invitation_code → lookup sur groups(invitation_code)
-- GH-8  : table votes (group_id, user_id, tmdb_id, liked bool, created_at)
-- GH-9  : vue/table matches (group_id, tmdb_id, score, matched_at)
-- GH-10 : vue results_group agrégeant votes + matches par groupe
-- GH-11 : reset votes → delete from votes where group_id = ?
-- =============================================================================
