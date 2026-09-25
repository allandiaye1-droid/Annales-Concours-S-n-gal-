-- Schema PostgreSQL / Supabase pour AnnalesConcours Senegal
-- Prix stockes en francs CFA sans decimales.

create extension if not exists pgcrypto;

create type public.order_status as enum ('pending', 'paid', 'cancelled', 'refunded');
create type public.payment_method as enum ('wave', 'orange_money', 'manual');
create type public.payment_status as enum ('pending', 'successful', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) >= 2),
  last_name text not null check (char_length(trim(last_name)) >= 2),
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.annales (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  slug text not null unique,
  category text not null,
  description text,
  exercise_count integer not null default 320 check (exercise_count > 0),
  price_xof integer not null default 2000 check (price_xof = 2000),
  cover_path text not null,
  pdf_path text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending',
  currency char(3) not null default 'XOF' check (currency = 'XOF'),
  total_xof integer not null default 0 check (total_xof >= 0),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  annale_id uuid not null references public.annales(id) on delete restrict,
  title_snapshot text not null,
  unit_price_xof integer not null default 2000 check (unit_price_xof = 2000),
  quantity integer not null default 1 check (quantity = 1),
  created_at timestamptz not null default now(),
  unique (order_id, annale_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  provider_reference text unique,
  amount_xof integer not null check (amount_xof >= 0),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  download_token uuid not null unique default gen_random_uuid(),
  download_count integer not null default 0 check (download_count >= 0),
  expires_at timestamptz,
  last_downloaded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, order_item_id)
);

create index annales_category_idx on public.annales(category);
create index annales_active_idx on public.annales(is_active);
create index orders_user_id_idx on public.orders(user_id);
create index order_items_order_id_idx on public.order_items(order_id);
create index downloads_user_id_idx on public.downloads(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger annales_updated_at
before update on public.annales
for each row execute function public.set_updated_at();

create or replace function public.calculate_order_total()
returns trigger
language plpgsql
as $$
begin
  update public.orders
  set total_xof = (
    select coalesce(sum(unit_price_xof * quantity), 0)
    from public.order_items
    where order_id = coalesce(new.order_id, old.order_id)
  )
  where id = coalesce(new.order_id, old.order_id);
  return coalesce(new, old);
end;
$$;

create trigger order_items_total_after_change
after insert or update or delete on public.order_items
for each row execute function public.calculate_order_total();

create or replace function public.create_download_after_payment()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'successful' and old.status is distinct from 'successful' then
    insert into public.downloads (user_id, order_item_id)
    select o.user_id, oi.id
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.id = new.order_id
    on conflict (user_id, order_item_id) do nothing;

    update public.orders
    set status = 'paid', paid_at = coalesce(paid_at, now())
    where id = new.order_id;
  end if;
  return new;
end;
$$;

create trigger payment_success_creates_downloads
after update on public.payments
for each row execute function public.create_download_after_payment();

-- Catalogue initial des 23 annales deja presentes dans le projet.
insert into public.annales (title, slug, category, exercise_count, cover_path, pdf_path) values
('Concours ENA', 'concours-ena', 'Administration', 320, 'image/WhatsApp Image 2026-09-23 at 21.00.30 (1).jpeg', 'pdf/Concours_ENA_Senegal_Tome_1_320_exercices.pdf'),
('Concours Police', 'concours-police', 'Defense & securite', 300, 'image/WhatsApp Image 2026-09-23 at 21.00.30.jpeg', 'pdf/Concours_Police_Senegal_Tome_1_300_exercices.pdf'),
('Concours Douane', 'concours-douane', 'Administration', 320, 'image/WhatsApp Image 2026-09-23 at 21.00.31.jpeg', 'pdf/Concours_Douane_Senegal_Tome_1_320_exercices.pdf'),
('Concours BT Comptabilite', 'concours-bt-comptabilite', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-24 at 13.40.05.jpeg', 'pdf/Concours_BT_Comptabilite_Senegal_Tome_1_320_exercices.pdf'),
('Concours Gendarmerie', 'concours-gendarmerie', 'Defense & securite', 300, 'image/WhatsApp Image 2026-09-24 at 13.40.06 (1).jpeg', 'pdf/Concours_Gendarmerie_Senegal_Tome_1_300_exercices.pdf'),
('Concours Eaux & Forets', 'concours-eaux-forets', 'Defense & securite', 320, 'image/WhatsApp Image 2026-09-24 at 13.40.06 (3).jpeg', 'pdf/Concours_Eaux_Forets_Senegal_Tome_1_320_exercices.pdf'),
('Concours BTS Genie civil', 'concours-bts-genie-civil', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-24 at 13.40.06.jpeg', 'pdf/Concours_BTS_Genie_Civil_Senegal_Tome_1_320_exercices.pdf'),
('Concours FASTEF', 'concours-fastef', 'Administration', 320, 'image/WhatsApp Image 2026-09-24 at 13.40.07 (1).jpeg', 'pdf/Concours_FASTEF_Senegal_Tome_1_320_exercices.pdf'),
('Concours ESP', 'concours-esp', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-24 at 13.40.07.jpeg', 'pdf/Concours_ESP_Senegal_Tome_1_320_exercices.pdf'),
('Concours Magistrature', 'concours-magistrature', 'Administration', 320, 'image/WhatsApp Image 2026-09-24 at 13.40.08.jpeg', 'pdf/Concours_Magistrature_Senegal_Tome_1_320_exercices.pdf'),
('Concours Greffe', 'concours-greffe', 'Administration', 320, 'image/WhatsApp Image 2026-09-24 at 13.48.46.jpeg', 'pdf/Concours_Greffe_Senegal_Tome_1_320_exercices.pdf'),
('Concours EAA', 'concours-eaa', 'Administration', 320, 'image/WhatsApp Image 2026-09-24 at 13.59.00.jpeg', 'pdf/Concours_EAA_Senegal_Tome_1_320_exercices.pdf'),
('Concours CREM', 'concours-crem', 'Administration', 320, 'image/WhatsApp Image 2026-09-24 at 14.45.35 (1).jpeg', 'pdf/Concours_CREM_Senegal_Tome_1_320_exercices.pdf'),
('Concours ENSOA', 'concours-ensoa', 'Defense & securite', 320, 'image/WhatsApp Image 2026-09-24 at 14.45.35.jpeg', 'pdf/Concours_ENSOA_Senegal_Tome_1_320_exercices.pdf'),
('Concours ESOGN', 'concours-esogn', 'Defense & securite', 320, 'image/WhatsApp Image 2026-09-24 at 14.45.36.jpeg', 'pdf/Concours_ESOGN_Senegal_Tome_1_320_exercices.pdf'),
('Concours BTS Comptabilite', 'concours-bts-comptabilite', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-23 at 21.26.36 (1).jpeg', 'pdf/Concours_BTS_Comptabilite_Gestion_Senegal_Tome_1_320_exercices.pdf'),
('Concours BTS Transit', 'concours-bts-transit', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-23 at 21.26.36.jpeg', 'pdf/Concours_BTS_Transit_Senegal_Tome_1_320_exercices.pdf'),
('Concours BTS Secretariat', 'concours-bts-secretariat', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-23 at 21.26.37.jpeg', 'pdf/Concours_BTS_Secretariat_Bureautique_Senegal_Tome_1_320_exercices.pdf'),
('Concours BTS Logistique', 'concours-bts-logistique', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-23 at 21.26.38.jpeg', 'pdf/Concours_BTS_Gestion_Chaine_Approvisionnement_Logistique_Senegal_Tome_1_320_exercices.pdf'),
('Concours BT Secretariat', 'concours-bt-secretariat', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-23 at 21.26.39 (1).jpeg', 'pdf/Concours_BT_Secretariat_Bureautique_Senegal_Tome_1_320_exercices.pdf'),
('Concours ENDSS', 'concours-endss', 'Administration', 320, 'image/WhatsApp Image 2026-09-23 at 21.02.42.jpeg', 'pdf/Concours_ENDSS_Senegal_Tome_1_320_exercices.pdf'),
('Concours IFACE', 'concours-iface', 'Technique & gestion', 320, 'image/WhatsApp Image 2026-09-23 at 21.04.49.jpeg', 'pdf/Concours_IFACE_Senegal_Tome_1_320_exercices.pdf'),
('Probatoire Senegal', 'probatoire-senegal', 'Administration', 320, 'image/WhatsApp Image 2026-09-23 at 21.14.07.jpeg', 'pdf/Probatoire_Senegal_Tome_1_320_exercices.pdf');

-- RLS de base : chaque candidat ne voit que ses propres commandes et telechargements.
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.downloads enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "order_items_select_own" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "downloads_select_own" on public.downloads for select using (auth.uid() = user_id);
create policy "annales_public_read" on public.annales for select using (is_active = true);
