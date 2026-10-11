-- CFLB 2027 : inscriptions des candidates
-- Projet Supabase : Vote Project (dlfbwbrcsriqllypjpkx)

-- Statuts possibles d'une inscription
create type public.statut_inscription_cflb_2027 as enum ('en_attente', 'acceptee', 'refusee');

create table public.inscription_cflb_2027 (
  id                   uuid primary key default gen_random_uuid(),

  -- Identité et contact
  nom                  text not null,
  prenom               text not null,
  date_naissance       date not null,
  ville                text not null,
  telephone_whatsapp   text not null,
  email                text not null,

  -- Photo portrait (optionnelle)
  photo_url            text,

  -- Profil
  profession           text not null,
  structure            text,
  categorie            text not null,

  -- Pourquoi je veux participer (lettre de motivation)
  motivation           text not null,

  -- CV obligatoire (chemin du PDF dans le bucket)
  cv_url               text not null,

  -- Consentements : tous obligatoires pour déposer une inscription
  consent_image        boolean not null,
  consent_reglement    boolean not null,
  consent_exactitude   boolean not null,

  -- Suivi administratif
  statut               public.statut_inscription_cflb_2027 not null default 'en_attente',
  created_at           timestamptz not null default now(),
  reviewed_at          timestamptz,

  constraint consentements_requis
    check (consent_image and consent_reglement and consent_exactitude),
  constraint motivation_longueur
    check (char_length(motivation) between 50 and 2000),
  constraint email_format
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

comment on table public.inscription_cflb_2027 is
  'CFLB 2027 : candidatures déposées depuis le parcours /postuler.';

-- Une seule inscription par email
create unique index inscription_cflb_2027_email_unique
  on public.inscription_cflb_2027 (lower(email));
create index inscription_cflb_2027_statut_idx
  on public.inscription_cflb_2027 (statut, created_at desc);

-- Sécurité : RLS active
alter table public.inscription_cflb_2027 enable row level security;

-- Le public peut déposer une inscription, uniquement en statut 'en_attente'.
-- Aucune lecture, modification ni suppression côté public.
-- Côté front : insérer sans demander la ligne en retour (pas de .select()).
create policy "inscription_cflb_2027_depot_public"
  on public.inscription_cflb_2027
  for insert
  to anon
  with check (statut = 'en_attente' and reviewed_at is null);

-- L'administration (liste, accepter, refuser) passe par Supabase Auth :
-- voir les règles "admin" en fin de fichier. Aucune clé secrète côté application.

-- Stockage des fichiers (photo et CV) : bucket privé, 5 Mo maximum
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inscription-cflb-2027',
  'inscription-cflb-2027',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Le public peut déposer des fichiers dans ce bucket, mais pas les lire.
create policy "inscription_cflb_2027_upload_public"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'inscription-cflb-2027');

-- ---------------------------------------------------------------------------
-- Administration via Supabase Auth (l'application n'utilise que la clé anon)
-- Un compte est administrateur si son app_metadata contient cflb_admin = true.
-- ---------------------------------------------------------------------------

create or replace function public.est_admin_cflb()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'cflb_admin')::boolean, false)
$$;

create policy "inscription_cflb_2027_lecture_admin"
  on public.inscription_cflb_2027 for select to authenticated
  using ((select public.est_admin_cflb()));

create policy "inscription_cflb_2027_statut_admin"
  on public.inscription_cflb_2027 for update to authenticated
  using ((select public.est_admin_cflb()))
  with check ((select public.est_admin_cflb()));

-- L'administration ne peut modifier que le statut
revoke update on public.inscription_cflb_2027 from authenticated, anon;
grant update (statut) on public.inscription_cflb_2027 to authenticated;

-- reviewed_at est rempli automatiquement au changement de statut
create or replace function public.inscription_cflb_2027_suivi()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.statut is distinct from old.statut then
    new.reviewed_at := case when new.statut = 'en_attente' then null else now() end;
  end if;
  return new;
end
$$;

create trigger inscription_cflb_2027_suivi
  before update on public.inscription_cflb_2027
  for each row execute function public.inscription_cflb_2027_suivi();

-- Lecture des photos et CV (URL signées) réservée à l'administration
create policy "inscription_cflb_2027_fichiers_admin"
  on storage.objects for select to authenticated
  using (bucket_id = 'inscription-cflb-2027' and (select public.est_admin_cflb()));

-- Attribution du rôle (à exécuter une fois le compte créé dans Authentication) :
-- update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"cflb_admin": true}'
--   where email = '<email admin>';
