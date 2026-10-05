-- Run in Supabase SQL Editor on a NEW project.
-- Tables are accessible only from server-side service_role; public API returns selected fields.
create table if not exists public.companies (code text primary key, name text not null);
create table if not exists public.reporter_access (
 email text not null check(email=lower(email) and email like '%@gmail.com'),
 company text not null references public.companies(code),
 enabled boolean not null default true,
 primary key(email,company)
);
create table if not exists public.reports (
 id uuid primary key,
 company text not null references public.companies(code),
 date date not null, observed timestamptz not null, submitted timestamptz not null default now(),
 level numeric check(level>=0),
 status text not null check(status in ('normal','watch','warning','critical')),
 declared_status text,
 risk_score integer check(risk_score between 0 and 10),
 risk_reasons jsonb not null default '[]', water_trend text not null default 'unknown',
 road text not null, attendance text not null default '', production text not null,
 transport text not null, point text not null, note text not null default '', help text not null default '',
 reporter text not null default 'ผู้รายงาน', author text not null,
 photos jsonb not null default '[]', photo_points jsonb not null default '[]'
);
create table if not exists public.photo_objects (
 id uuid primary key, path text unique not null, author text not null,
 company text not null references public.companies(code), point text not null check(point in ('exterior','entrance')),
 report_id uuid references public.reports(id), created_at timestamptz not null default now()
);
create index if not exists reports_date_company on public.reports(date,company);
create index if not exists reports_observed on public.reports(observed desc,submitted desc,id desc);
create index if not exists reports_previous on public.reports(company,point,observed desc);
create index if not exists photo_author_created on public.photo_objects(author,created_at);
alter table public.companies enable row level security;
alter table public.reporter_access enable row level security;
alter table public.reports enable row level security;
alter table public.photo_objects enable row level security;
revoke all on public.companies,public.reporter_access,public.reports,public.photo_objects from anon,authenticated;
grant all on public.companies,public.reporter_access,public.reports,public.photo_objects to service_role;

insert into public.companies(code,name) values
('BKC','บริษัท บางกอกโคมัตสุ จำกัด'),
('EXT','บริษัท เอ็กเซดี้ (ประเทศไทย) จำกัด'),
('GYSI','บริษัท ยีเอส ยัวซ่า สยาม อินดัสตรีส์ จำกัด'),
('KYBT','บริษัท เควายบี (ประเทศไทย) จำกัด'),
('MSFT','บริษัท มาห์เล สยาม ฟิลเตอร์ ซิสเต็มส์ จำกัด'),
('NBMT','บริษัท เอ็น เอส เค แบริ่งส์แมนูแฟคเจอริ่ง (ประเทศไทย) จำกัด'),
('NT','บริษัท นิตตั้น (ประเทศไทย) จำกัด'),
('SGS','บริษัท สยามยีเอสแบตเตอรี่ จำกัด'),
('SHE','บริษัท สยาม ฮิตาชิ เอลลิเวเตอร์ จำกัด'),
('SNSS','บริษัท สยาม เอ็น เอส เค สเตียริ่ง ซิสเต็มส์ จำกัด'),
('SRI','บริษัท สยามริคเก้นอินดัสเตรี้ยล จำกัด'),
('SML','บริษัท มอเตอร์ โลจิสติก จำกัด'),
('SSS','บริษัท สยาม สมาร์ท โซลูชั่นส์ จำกัด'),
('MSED','บริษัท มาห์เล สยาม อิเล็คทริค ไดร์ฟ จำกัด'),
('BOSCH','บริษัท บ๊อช ออโตโมทีฟ จำกัด'),
('CHITA','บริษัท สยาม ชิตะ จำกัด'),
('VALEO','บริษัท วาเลโอ สยาม จำกัด'),
('ASTEMO','บริษัท แอสเตโม พาวเวอร์เทรน จำกัด'),
('CASONIC','บริษัท สยาม คาลโซนิค จำกัด')
on conflict(code) do update set name=excluded.name;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('flood-photos','flood-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
-- No anonymous/authenticated Storage policies. Upload via server-issued signed URL.

-- Atomic insert/link prevents concurrent reuse of pending photos.
create or replace function public.save_report(p_report jsonb)
returns uuid language plpgsql security invoker set search_path=public as $$
declare r public.reports; ids uuid[]; matched integer; updated integer;
begin
 r := jsonb_populate_record(null::public.reports,p_report);
 select array_agg(value::uuid) into ids from jsonb_array_elements_text(r.photos);
 if coalesce(array_length(ids,1),0) not between 2 and 6 then raise exception 'Invalid photo count'; end if;
 perform id from public.photo_objects where id=any(ids) order by id for update;
 select count(*) into matched from public.photo_objects where id=any(ids) and author=r.author and company=r.company and report_id is null;
 if matched<>array_length(ids,1) then raise exception 'Photos unavailable'; end if;
 insert into public.reports select r.*;
 update public.photo_objects set report_id=r.id where id=any(ids) and author=r.author and report_id is null;
 get diagnostics updated=row_count;
 if updated<>matched then raise exception 'Photo link failed'; end if;
 return r.id;
end; $$;
revoke all on function public.save_report(jsonb) from public,anon,authenticated;
grant execute on function public.save_report(jsonb) to service_role;
