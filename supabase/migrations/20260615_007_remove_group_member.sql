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
