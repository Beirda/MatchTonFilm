-- =============================================================================
-- Migration 006 — Pool de films commun au groupe
-- =============================================================================
-- Bug : la policy « user_genres: CRUD ses propres genres » limite aussi le
-- SELECT à ses propres lignes. Chaque membre ne lisait donc que SES genres
-- lors du calcul des recommandations → intersection différente par membre →
-- pools de films différents → aucun film en commun, aucun match possible.
--
-- Correctif : RPC SECURITY DEFINER qui agrège les genres préférés de TOUS
-- les membres d'un groupe, réservée aux membres de ce groupe.
-- =============================================================================

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
