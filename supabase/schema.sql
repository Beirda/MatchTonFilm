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
-- `set search_path = ''` + table qualifiée : obligatoire pour un SECURITY DEFINER,
-- sinon l'insert échoue avec « Database error saving new user ».
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
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
-- FONCTIONS ANTI-RÉCURSION RLS
-- Court-circuitent la RLS (SECURITY DEFINER) pour éviter qu'une policy sur
-- group_members ne se référence elle-même → « infinite recursion ».
-- =============================================================================
create or replace function is_group_member(gid uuid)
returns boolean
language sql security definer set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function is_group_admin(gid uuid)
returns boolean
language sql security definer set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'admin'
  );
$$;


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

create policy "profiles: création de son propre profil"
  on profiles for insert
  with check (auth.uid() = id);


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
  using (is_group_member(id));

create policy "groups: création authentifiée"
  on groups for insert
  with check (auth.uid() = created_by);

create policy "groups: modification par l'admin"
  on groups for update
  using (is_group_admin(id));

create policy "groups: suppression par l'admin"
  on groups for delete
  using (is_group_admin(id));


-- group_members : visible par tous les membres du groupe
create policy "group_members: lecture par les membres"
  on group_members for select
  using (is_group_member(group_id));

create policy "group_members: rejoindre un groupe"
  on group_members for insert
  with check (auth.uid() = user_id);

create policy "group_members: quitter un groupe"
  on group_members for delete
  using (auth.uid() = user_id);


-- =============================================================================
-- RPC : création / rejoindre un groupe (GH-3 / GH-4)
-- SECURITY DEFINER pour contourner l'impasse RLS (on doit toucher le groupe
-- avant d'en être membre). Voir migration 003.
-- =============================================================================
create or replace function create_group(
  p_name       text,
  p_genres     text[],
  p_age_rating text,
  p_language   text,
  p_code       text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  insert into public.groups (name, genres, age_rating, language, invitation_code, created_by)
  values (p_name, p_genres, p_age_rating, p_language, p_code, v_uid)
  returning id into v_id;
  insert into public.group_members (group_id, user_id, role)
  values (v_id, v_uid, 'admin');
  return v_id;
end;
$$;

create or replace function join_group(p_code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select id into v_id from public.groups where invitation_code = p_code;
  if v_id is null then
    return null;
  end if;
  insert into public.group_members (group_id, user_id, role)
  values (v_id, v_uid, 'member')
  on conflict (group_id, user_id) do nothing;
  return v_id;
end;
$$;

grant execute on function create_group(text, text[], text, text, text) to authenticated;
grant execute on function join_group(text) to authenticated;


-- -----------------------------------------------------------------------------
-- GH-8 : votes
-- Like/dislike par (user, groupe, film). La clé primaire composite empêche
-- les doublons et permet un upsert (re-swipe = vote mis à jour).
-- -----------------------------------------------------------------------------
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


-- -----------------------------------------------------------------------------
-- GH-11 : reset_group_votes
-- RPC SECURITY DEFINER : permet à l'admin de supprimer les votes de tout le
-- groupe pour relancer un cycle (la policy "votes: CRUD ses propres votes"
-- limite chaque membre à ses propres votes).
-- -----------------------------------------------------------------------------
create or replace function reset_group_votes(p_group_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_group_admin(p_group_id) then
    raise exception 'not authorized';
  end if;

  delete from public.votes where group_id = p_group_id;
end;
$$;

grant execute on function reset_group_votes(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- GH-6 : get_group_member_genres
-- RPC SECURITY DEFINER : agrège les genres préférés de tous les membres d'un
-- groupe. Nécessaire car la RLS de user_genres limite le SELECT à ses propres
-- lignes — sans cette RPC, chaque membre calculait un pool de films différent
-- et aucun match n'était possible. Réservée aux membres du groupe.
-- -----------------------------------------------------------------------------
create or replace function get_group_member_genres(p_group_id uuid)
returns table (tmdb_genre_id integer)
language sql security definer set search_path = ''
as $$
  select distinct ug.tmdb_genre_id
  from public.user_genres ug
  join public.group_members gm on gm.user_id = ug.user_id
  where gm.group_id = p_group_id
    and public.is_group_member(p_group_id);
$$;

grant execute on function get_group_member_genres(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- GH-4 : remove_group_member
-- RPC SECURITY DEFINER : permet à l'admin de retirer un autre membre du groupe.
-- La policy « group_members: quitter un groupe » ne couvre que le départ
-- volontaire (auth.uid() = user_id) ; cette fonction contourne donc la RLS pour
-- l'admin, tout en refusant qu'il se retire lui-même par ce biais.
-- -----------------------------------------------------------------------------
create or replace function remove_group_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_group_admin(p_group_id) then
    raise exception 'not authorized';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'cannot remove self';
  end if;

  delete from public.group_members
  where group_id = p_group_id and user_id = p_user_id;
end;
$$;

grant execute on function remove_group_member(uuid, uuid) to authenticated;


-- =============================================================================
-- INDEXES (performance)
-- =============================================================================
create index if not exists idx_user_genres_user_id  on user_genres(user_id);
create index if not exists idx_user_films_user_id   on user_films(user_id);
create index if not exists idx_group_members_group  on group_members(group_id);
create index if not exists idx_group_members_user   on group_members(user_id);
create index if not exists idx_groups_invitation    on groups(invitation_code);
create index if not exists idx_votes_group          on votes(group_id);


-- =============================================================================
-- NOTES FUTURES
-- =============================================================================
-- GH-9  : fait — score calculé côté client (lib/matches.ts) à partir de la
--         table votes, pas de table dédiée nécessaire.
-- GH-10 : vue results_group agrégeant votes + matches par groupe
-- GH-11 : fait — reset_group_votes(p_group_id), RPC admin (voir migration 005)
-- =============================================================================
