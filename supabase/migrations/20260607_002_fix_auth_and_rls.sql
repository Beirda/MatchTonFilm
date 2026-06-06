-- Migration 002 — Correctifs Auth (GH-1) + récursion RLS (GH-3/GH-4)
-- Généré le 2026-06-07
--
-- Pour appliquer :
--   supabase db push
-- ou copier-coller dans le SQL Editor de l'interface Supabase.
--
-- Corrige deux bugs détectés sur la base distante :
--   1. signUp → « Database error saving new user » : le trigger handle_new_user
--      (SECURITY DEFINER) n'avait pas de search_path figé ni de table qualifiée.
--   2. select sur groups / group_members → « infinite recursion detected in policy » :
--      les policies s'auto-référençaient. On passe par des fonctions SECURITY DEFINER
--      qui court-circuitent la RLS.


-- -----------------------------------------------------------------------------
-- 1. GH-1 : trigger de création de profil
-- -----------------------------------------------------------------------------
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

-- Filet de sécurité : autorise un user à créer/voir sa propre ligne profil.
drop policy if exists "profiles: création de son propre profil" on profiles;
create policy "profiles: création de son propre profil"
  on profiles for insert
  with check (auth.uid() = id);


-- -----------------------------------------------------------------------------
-- 2. GH-3/GH-4 : fonctions anti-récursion
-- -----------------------------------------------------------------------------
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


-- -----------------------------------------------------------------------------
-- 3. Policies groups — réécrites via les fonctions
-- -----------------------------------------------------------------------------
drop policy if exists "groups: lecture par les membres"   on groups;
drop policy if exists "groups: modification par l'admin"   on groups;
drop policy if exists "groups: suppression par l'admin"    on groups;

create policy "groups: lecture par les membres"
  on groups for select
  using (is_group_member(id));

create policy "groups: modification par l'admin"
  on groups for update
  using (is_group_admin(id));

create policy "groups: suppression par l'admin"
  on groups for delete
  using (is_group_admin(id));


-- -----------------------------------------------------------------------------
-- 4. Policies group_members — réécrites via les fonctions
-- -----------------------------------------------------------------------------
drop policy if exists "group_members: lecture par les membres" on group_members;

create policy "group_members: lecture par les membres"
  on group_members for select
  using (is_group_member(group_id));
