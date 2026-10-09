-- Manual ordering inside each Kanban column (status).
-- New rows get a more negative value than any other, so they appear at the top of their column.
alter table public.applications
  add column sort_order double precision not null default (-extract(epoch from clock_timestamp()));

-- Keep the current order for existing rows: newest application first within each status.
update public.applications a
set sort_order = r.rn * 1000
from (
  select id, row_number() over (partition by user_id, status order by applied_on desc, created_at desc) as rn
  from public.applications
) r
where a.id = r.id;
