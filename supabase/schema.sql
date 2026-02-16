-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- USERS & ROLES
-- -----------------------------------------------------------------------------

-- Create an enum for user roles
create type user_role as enum ('user', 'assistant', 'admin');

-- Create an enum for assistant status
create type assistant_status as enum ('offline', 'online', 'busy');

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  phone text,
  whatsapp text,
  role user_role default 'user'::user_role,
  assistant_enabled boolean default false,
  status assistant_status default 'offline'::assistant_status,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- -----------------------------------------------------------------------------
-- CATALOG (Products & Categories)
-- -----------------------------------------------------------------------------

create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
create policy "Categories are viewable by everyone." on public.categories for select using (true);
create policy "Admins can maintain categories." on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create table public.products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  price numeric(10, 2) not null,
  currency text default 'USD',
  is_active boolean default true,
  image_urls text[], -- Array of image URLs
  priority integer default 0, -- For sorting
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Admins can maintain products." on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Gift Finder Tags
create type tag_type as enum ('sex', 'purpose', 'custom');

create table public.gift_tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type tag_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.gift_tags enable row level security;
create policy "Tags viewable by everyone" on public.gift_tags for select using (true);
create policy "Admins manage tags" on public.gift_tags for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create table public.product_tags (
  product_id uuid references public.products(id) on delete cascade,
  tag_id uuid references public.gift_tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

alter table public.product_tags enable row level security;
create policy "Product tags viewable by everyone" on public.product_tags for select using (true);
create policy "Admins manage product tags" on public.product_tags for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- -----------------------------------------------------------------------------
-- ORDERS
-- -----------------------------------------------------------------------------

create type order_status as enum (
  'placed', 'confirmed', 'processing', 'shipped', 
  'out_for_delivery', 'delivered', 
  'failed', 'cancelled', 'returned'
);

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  status order_status default 'placed'::order_status check ((status <> 'delivered'::order_status) OR (status = 'delivered'::order_status)), -- Placeholder check
  total_amount numeric(10, 2) not null default 0,
  currency text default 'USD',
  special_note text,
  custom_request text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

create table public.recipients (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text not null,
  whatsapp text
);

alter table public.recipients enable row level security;

create table public.order_addresses (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  address_text text not null,
  lat double precision,
  lng double precision,
  notes text,
  is_map_pinned boolean default false
);

alter table public.order_addresses enable row level security;

create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  product_name_snapshot text not null,
  quantity integer default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null
);

alter table public.order_items enable row level security;

create table public.order_status_events (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  status order_status not null,
  note text,
  created_by uuid references auth.users(id), -- Null if system
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_status_events enable row level security;

-- Order Policies
-- 1. Users can view their own orders.
create policy "Users can view own orders" on public.orders 
  for select using (auth.uid() = user_id);

-- 2. Admins can view all orders.
create policy "Admins can view all orders" on public.orders 
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 3. Assistants can view orders involved in conversations assigned to them OR just all orders if simpler. 
-- For now, let's allow assistants to view all orders to enable them to help easily.
create policy "Assistants can view all orders" on public.orders 
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'assistant'));

-- 4. Insert: Sender can insert own order
create policy "Users can insert own orders" on public.orders 
  for insert with check (auth.uid() = user_id);

-- 5. Update: Admin can update any. Assistant can update status (via function usually, but allow here). 
-- Users usually don't update orders directly after placement, they use edge functions or cancel.
create policy "Admins can update orders" on public.orders 
  for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Recipient/Address/Items Policies (Cascade from Order)
create policy "Users manage own order items" on public.order_items
  for all using (exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid()));
create policy "Admins manage order items" on public.order_items
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Same for Recipients and Addresses
create policy "Users manage own recipients" on public.recipients
  for all using (exists (select 1 from public.orders where id = recipients.order_id and user_id = auth.uid()));
create policy "Admins manage recipients" on public.recipients
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users manage own addresses" on public.order_addresses
  for all using (exists (select 1 from public.orders where id = order_addresses.order_id and user_id = auth.uid()));
create policy "Admins manage addresses" on public.order_addresses
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  
-- Status Events
create policy "Users can view own events" on public.order_status_events
  for select using (exists (select 1 from public.orders where id = order_status_events.order_id and user_id = auth.uid()));
create policy "Admins/Assistant view events" on public.order_status_events
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'assistant')));


-- -----------------------------------------------------------------------------
-- CHAT (Conversations & Messages)
-- -----------------------------------------------------------------------------

create type conversation_type as enum ('support', 'order');
create type message_sender_type as enum ('user', 'assistant', 'admin', 'bot', 'system');

create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  type conversation_type default 'support',
  order_id uuid references public.orders(id), -- Nullable, only for order chats
  user_id uuid references auth.users(id), -- The customer
  title text,
  is_closed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;

create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id), -- Null for system/bot if needed, or use a bot user
  sender_type message_sender_type not null default 'user',
  content text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

-- Chat Policies
-- Users can see conversations they are a participant in OR they own (as the user_id).
create policy "Participants view conversations" on public.conversations
  for select using (
    user_id = auth.uid() OR
    exists (select 1 from public.conversation_participants where conversation_id = conversations.id and user_id = auth.uid()) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Users can insert conversations (start support chat)
create policy "Users start conversations" on public.conversations
  for insert with check (user_id = auth.uid());

-- Participants View Messages
create policy "Participants view messages" on public.messages
  for select using (
    exists (select 1 from public.conversations c 
            left join public.conversation_participants cp on c.id = cp.conversation_id
            where c.id = messages.conversation_id 
            and (c.user_id = auth.uid() OR cp.user_id = auth.uid() OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')))
  );

-- Participants Send Messages
create policy "Participants send messages" on public.messages
  for insert with check (
    sender_id = auth.uid() AND
    exists (select 1 from public.conversations c 
            left join public.conversation_participants cp on c.id = cp.conversation_id
            where c.id = messages.conversation_id 
            and (c.user_id = auth.uid() OR cp.user_id = auth.uid() OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')))
  );

-- Realtime publication
-- Add tables to realtime publication
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.order_status_events;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.conversations;

-- -----------------------------------------------------------------------------
-- UPDATES FOR CHAT ESCALATION & MOBILE ADMIN
-- -----------------------------------------------------------------------------

-- A) Push Notification Tokens
create table if not exists public.push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text, -- ios|android
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, token)
);

alter table public.push_tokens enable row level security;
create policy "Users manage own tokens" on public.push_tokens for all using (auth.uid() = user_id);
create policy "Admins/System read tokens" on public.push_tokens for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- B) Conversation Fields
alter table public.conversations
  add column if not exists status text not null default 'open_bot', -- open_bot, escalated_waiting, assigned_human, resolved
  add column if not exists escalated_at timestamp with time zone,
  add column if not exists closed_at timestamp with time zone,
  add column if not exists assigned_assistant_id uuid references public.profiles(id);

-- C) Conversation Reviews
create table if not exists public.conversation_reviews (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  rated_by uuid not null references public.profiles(id) on delete cascade,   
  agent_id uuid references public.profiles(id) on delete set null,          
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(conversation_id, rated_by)
);

alter table public.conversation_reviews enable row level security;
create policy "Users create reviews" on public.conversation_reviews for insert with check (auth.uid() = rated_by);
create policy "Admins read reviews" on public.conversation_reviews for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- D) Assistant Assignments (Audit)
create table if not exists public.assistant_assignments (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  assistant_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unassigned_at timestamp with time zone
);

alter table public.assistant_assignments enable row level security;
create policy "Admins view assignments" on public.assistant_assignments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Updated RLS for Conversations (Assistants see assigned)
-- Drop old policy if exists or recreate
drop policy if exists "Participants view conversations" on public.conversations;
create policy "Participants & Assigned view conversations" on public.conversations
  for select using (
    user_id = auth.uid() OR
    exists (select 1 from public.conversation_participants where conversation_id = conversations.id and user_id = auth.uid()) OR
    assigned_assistant_id = auth.uid() OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Helper to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer;

-- -----------------------------------------------------------------------------
-- UPDATES FOR PAYMENTS, QUOTES, & CUSTOM REQUESTS (v2)
-- -----------------------------------------------------------------------------

-- 1. Profile Updates (Banning)
alter table public.profiles 
  add column if not exists is_banned boolean default false,
  add column if not exists banned_reason text;

-- 2. Order Updates
alter table public.orders 
  add column if not exists order_kind text default 'catalog', -- catalog, custom
  add column if not exists payment_status text default 'unpaid', -- unpaid, pending, paid, failed, refunded
  add column if not exists paid_at timestamp with time zone;

-- 3. Payments Table
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null, -- stripe, paystack, etc
  amount numeric not null,
  currency text not null default 'USD',
  status text not null, -- pending, succeeded, failed
  provider_reference text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;
create policy "Users view own payments" on public.payments for select using (
  exists (select 1 from public.orders where id = payments.order_id and user_id = auth.uid())
);

-- 4. Custom Requests
create table if not exists public.custom_requests (
  order_id uuid primary key references public.orders(id) on delete cascade,
  purpose_tag_id uuid references public.gift_tags(id),
  budget_min numeric,
  budget_max numeric,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.custom_requests enable row level security;
create policy "Users view own custom requests" on public.custom_requests for select using (
  exists (select 1 from public.orders where id = custom_requests.order_id and user_id = auth.uid())
);

-- 5. Order Quotes
create table if not exists public.order_quotes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'USD',
  note text,
  status text default 'sent', -- sent, accepted, rejected
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_quotes enable row level security;
create policy "Users view own quotes" on public.order_quotes for select using (
  exists (select 1 from public.orders where id = order_quotes.order_id and user_id = auth.uid())
);

-- 6. Message Attachments (Chat Media)
create table if not exists public.message_attachments (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.messages(id) on delete cascade,
  bucket text not null,
  path text not null,
  mime_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.message_attachments enable row level security;
create policy "Participants view attachments" on public.message_attachments for select using (
  exists (select 1 from public.messages m join public.conversations c on m.conversation_id = c.id
          where m.id = message_attachments.message_id 
          and (c.user_id = auth.uid() 
               OR exists (select 1 from public.conversation_participants cp where cp.conversation_id = c.id and cp.user_id = auth.uid())
               OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
          ))
);

-- 7. Product Submissions (Assistant Drafts)
create table if not exists public.product_submissions (
  id uuid primary key default uuid_generate_v4(),
  submitted_by uuid references public.profiles(id),
  name text not null,
  description text,
  price numeric,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.product_submissions enable row level security;
create policy "Admins manage submissions" on public.product_submissions for all using (is_admin());
create policy "Assistants create submissions" on public.product_submissions for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'assistant')
);

-- 8. Insert new Gift Tags
insert into public.gift_tags (type, name, slug) values
('purpose', 'Birthday', 'birthday'),
('purpose', 'Valentine', 'valentine'),
('purpose', 'Office guest', 'office-guest'),
('purpose', 'Random gift', 'random-gift'),
('purpose', 'Wedding', 'wedding'),
('purpose', 'Office event', 'office-event'),
('purpose', 'Church event', 'church-event'),
('purpose', 'Others', 'others')
on conflict do nothing;



