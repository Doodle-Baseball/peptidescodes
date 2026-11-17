-- Set the "Last verified" date of every vendor coupon to 2026-11-17.
-- Run once in the Supabase SQL Editor (project onezidietuvicehxjtmo).
-- The live site picks up the new date within an hour (page cache), or right away after any save in the admin panel.

update public.vendors set verified_at = '2026-11-17';

-- Check: every row should now show 2026-11-17.
select verified_at, count(*) from public.vendors group by verified_at;
