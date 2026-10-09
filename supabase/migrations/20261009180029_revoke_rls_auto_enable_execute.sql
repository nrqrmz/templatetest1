-- rls_auto_enable() is an event-trigger function (ensure_rls). It must not be callable through the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
