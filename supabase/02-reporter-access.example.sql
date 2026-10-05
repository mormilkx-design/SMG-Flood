-- Replace email before running. One Gmail may be assigned multiple companies.
insert into public.reporter_access(email,company,enabled)
values ('yourname@gmail.com','BKC',true)
on conflict(email,company) do update set enabled=true;
-- Disable access:
-- update public.reporter_access set enabled=false where email='yourname@gmail.com';
