-- SUPABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor

-- 1. Tables Creation
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  sizes TEXT[] NOT NULL,
  condition TEXT,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  customer_email TEXT,
  customer JSONB,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration commands for existing projects:
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer JSONB;

-- 2. Row Level Security (RLS) Policies

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can read their own profile" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Products Policies
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT USING (status = 'active' OR (auth.uid() IN (SELECT id FROM users WHERE role = 'admin')));

CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders Policies
CREATE POLICY "Users can read their own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders" ON public.orders
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Functions & Triggers

-- Function to handle new user registration from Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 
    CASE 
      WHEN new.email IN ('studiosventa@gmail.com', 'thriftbd71@gmail.com', 'mimpy124ahon124@gmail.com') THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
