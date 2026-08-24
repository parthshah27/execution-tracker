-- Run this once in the Supabase SQL Editor. It secures each user's entries
-- and lets repeated saves update the same day instead of creating duplicates.
alter table public.daily_entries enable row level security;

alter table public.daily_entries
  add constraint daily_entries_user_id_entry_date_key unique (user_id, entry_date);

revoke all on table public.daily_entries from anon, authenticated;
grant select, insert, update, delete on table public.daily_entries to authenticated;

drop policy if exists "Users can read their own daily entries" on public.daily_entries;
create policy "Users can read their own daily entries"
  on public.daily_entries for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own daily entries" on public.daily_entries;
create policy "Users can create their own daily entries"
  on public.daily_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own daily entries" on public.daily_entries;
create policy "Users can update their own daily entries"
  on public.daily_entries for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own daily entries" on public.daily_entries;
create policy "Users can delete their own daily entries"
  on public.daily_entries for delete to authenticated
  using ((select auth.uid()) = user_id);
