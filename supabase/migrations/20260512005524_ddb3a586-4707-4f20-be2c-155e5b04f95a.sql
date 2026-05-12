
-- Roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

-- Auto-create profile + assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  assigned_role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email
  );
  -- First user becomes super_admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    assigned_role := 'super_admin';
  ELSE
    assigned_role := 'user';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Profiles: read own" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Profiles: update own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Profiles: admin delete" ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- user_roles policies
CREATE POLICY "Roles: read own" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Roles: super admin manages" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Products
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products: read auth" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Products: admin write" ON public.products FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Customers
CREATE TABLE public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers: read auth" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Customers: admin write" ON public.customers FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Inventory
CREATE TABLE public.inventory (
  product_id TEXT PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory: read auth" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory: admin write" ON public.inventory FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Sales
CREATE TABLE public.sales (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_sales_owner ON public.sales(owner_id);
CREATE INDEX idx_sales_date ON public.sales(date);

CREATE POLICY "Sales: read auth" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales: user insert own" ON public.sales FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Sales: owner or admin update" ON public.sales FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = owner_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Sales: owner or admin delete" ON public.sales FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin_or_super(auth.uid()));

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity: admin read" ON public.activity_log FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Activity: self insert" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- Settings (single row)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name TEXT NOT NULL DEFAULT 'SalesOS',
  maintenance BOOLEAN NOT NULL DEFAULT false,
  allow_signups BOOLEAN NOT NULL DEFAULT true,
  password_policy TEXT NOT NULL DEFAULT 'Min 6 characters',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings: read auth" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Settings: super write" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.settings (id) VALUES (1);
