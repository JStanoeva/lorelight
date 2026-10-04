-- 004: Trigger functions are not part of the API
-- Functions in the public schema can be called through /rest/v1/rpc/ by default.
-- These security definer functions only make sense as triggers, so nobody may
-- call them directly. Triggers still fire, because firing a trigger doesn't
-- check EXECUTE.
--
-- is_lore_public() stays executable on purpose: the RLS policies call it as the
-- querying user, and it only reveals whether an entry is public.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.remove_saves_of_hidden_lore() from public, anon, authenticated;
revoke execute on function public.remove_saves_of_hidden_project() from public, anon, authenticated;
