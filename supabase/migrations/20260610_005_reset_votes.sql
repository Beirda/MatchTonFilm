-- Migration 005 — Reset des votes d'un groupe (GH-11)
-- Généré le 2026-06-10
--
-- RPC SECURITY DEFINER : la policy "votes: CRUD ses propres votes" limite
-- chaque membre à ses propres votes, l'admin doit pouvoir supprimer ceux
-- de tout le groupe pour relancer un cycle.

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
