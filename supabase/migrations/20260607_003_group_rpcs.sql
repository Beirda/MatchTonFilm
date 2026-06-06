-- Migration 003 — RPC création / rejoindre un groupe (GH-3 / GH-4)
-- Généré le 2026-06-07
--
-- Pourquoi des RPC SECURITY DEFINER plutôt que des insert/select directs :
-- la policy de lecture sur `groups` exige d'être déjà membre (is_group_member).
-- Or à la création comme au join, on doit lire/écrire le groupe AVANT d'en être
-- membre → impasse RLS. Ces fonctions s'exécutent avec les droits du propriétaire
-- et encapsulent l'opération de façon atomique.


-- Crée un groupe + ajoute le créateur comme admin. Renvoie l'id du groupe.
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


-- Rejoint un groupe via son code d'invitation. Renvoie l'id, ou null si code inconnu.
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
