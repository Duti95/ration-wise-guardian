
-- ============================================
-- TREIS HOSTEL MANAGEMENT SYSTEM - FULL SCHEMA
-- ============================================

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'readonly');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create has_role function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper: check if user has any of the 3 roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- 4. Create items table
CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock NUMERIC DEFAULT 0,
    rate_per_unit NUMERIC DEFAULT 0,
    danger_threshold NUMERIC DEFAULT 30,
    medium_threshold NUMERIC DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 5. Create vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- 6. Create purchases table
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_no TEXT NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id),
    purchase_date TIMESTAMPTZ DEFAULT now(),
    total_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 7. Create purchase_items table
CREATE TABLE public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id),
    quantity NUMERIC NOT NULL,
    rate_per_unit NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    mrp NUMERIC,
    discount_type TEXT,
    discount_value NUMERIC DEFAULT 0,
    damaged_quantity NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- 8. Create stock_issues table
CREATE TABLE public.stock_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_date TIMESTAMPTZ DEFAULT now(),
    issue_type TEXT,
    total_value NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.stock_issues ENABLE ROW LEVEL SECURITY;

-- 9. Create stock_issue_items table
CREATE TABLE public.stock_issue_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.stock_issues(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id),
    quantity NUMERIC NOT NULL,
    rate_per_unit NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.stock_issue_items ENABLE ROW LEVEL SECURITY;

-- 10. Create strength_categories table
CREATE TABLE public.strength_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL,
    student_count NUMERIC DEFAULT 0,
    assigned_amount NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.strength_categories ENABLE ROW LEVEL SECURITY;

-- 11. Create government_diet_menu table
CREATE TABLE public.government_diet_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_date DATE NOT NULL,
    meal_type TEXT NOT NULL,
    items JSONB NOT NULL,
    week_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.government_diet_menu ENABLE ROW LEVEL SECURITY;

-- 12. Create utensils table
CREATE TABLE public.utensils (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit TEXT,
    capacity TEXT,
    current_quantity NUMERIC DEFAULT 0,
    damaged_quantity NUMERIC DEFAULT 0,
    replacement_needed NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.utensils ENABLE ROW LEVEL SECURITY;

-- 13. Create transaction_metadata table
CREATE TABLE public.transaction_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    dep_warden_signature TEXT,
    principal_signature TEXT,
    remarks TEXT,
    custom_balance_quantity NUMERIC,
    custom_balance_amount NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (transaction_id, transaction_type, item_id)
);
ALTER TABLE public.transaction_metadata ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_roles: only admins can manage, all authenticated can read own
CREATE POLICY "Users can read own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- items: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read items" ON public.items
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert items" ON public.items
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update items" ON public.items
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- vendors: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read vendors" ON public.vendors
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert vendors" ON public.vendors
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update vendors" ON public.vendors
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- purchases: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read purchases" ON public.purchases
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert purchases" ON public.purchases
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update purchases" ON public.purchases
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- purchase_items: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read purchase_items" ON public.purchase_items
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert purchase_items" ON public.purchase_items
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update purchase_items" ON public.purchase_items
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- stock_issues: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read stock_issues" ON public.stock_issues
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert stock_issues" ON public.stock_issues
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update stock_issues" ON public.stock_issues
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- stock_issue_items: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read stock_issue_items" ON public.stock_issue_items
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert stock_issue_items" ON public.stock_issue_items
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update stock_issue_items" ON public.stock_issue_items
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- strength_categories: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read strength_categories" ON public.strength_categories
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert strength_categories" ON public.strength_categories
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update strength_categories" ON public.strength_categories
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- government_diet_menu: all roles can read, admin can write
CREATE POLICY "Authenticated users with role can read diet_menu" ON public.government_diet_menu
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin can manage diet_menu" ON public.government_diet_menu
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- utensils: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read utensils" ON public.utensils
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert utensils" ON public.utensils
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update utensils" ON public.utensils
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- transaction_metadata: all roles can read, admin/staff can write
CREATE POLICY "Authenticated users with role can read transaction_metadata" ON public.transaction_metadata
    FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admin and staff can insert transaction_metadata" ON public.transaction_metadata
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admin and staff can update transaction_metadata" ON public.transaction_metadata
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- ============================================
-- REPORT VIEWS (SECURITY INVOKER)
-- ============================================

-- Purchase transactions report view
CREATE OR REPLACE VIEW public.purchase_transactions_report
WITH (security_invoker = on) AS
SELECT
    ROW_NUMBER() OVER (ORDER BY p.purchase_date DESC, pi2.created_at DESC)::INTEGER AS sno,
    pi2.id,
    p.id AS transaction_id,
    'purchase'::TEXT AS transaction_type,
    p.purchase_date AS transaction_date,
    v.name AS vendor_name,
    i.name AS item_name,
    i.id AS item_id,
    pi2.quantity AS purchased_quantity,
    pi2.total_price AS purchased_amount,
    pi2.damaged_quantity AS damaged_quantity,
    (COALESCE(pi2.damaged_quantity, 0) * pi2.rate_per_unit) AS damaged_amount,
    0::NUMERIC AS issued_quantity,
    0::NUMERIC AS issued_amount,
    i.current_stock AS balance_quantity,
    (i.current_stock * i.rate_per_unit) AS balance_amount,
    NULL::TEXT AS dep_warden_signature,
    NULL::TEXT AS principal_signature,
    NULL::TEXT AS remarks,
    p.created_at,
    p.updated_at
FROM public.purchases p
JOIN public.purchase_items pi2 ON pi2.purchase_id = p.id
JOIN public.items i ON i.id = pi2.item_id
LEFT JOIN public.vendors v ON v.id = p.vendor_id;

-- Issue transactions report view
CREATE OR REPLACE VIEW public.issue_transactions_report
WITH (security_invoker = on) AS
SELECT
    ROW_NUMBER() OVER (ORDER BY si.issue_date DESC, sii.created_at DESC)::INTEGER AS sno,
    sii.id,
    si.id AS transaction_id,
    'issue'::TEXT AS transaction_type,
    si.issue_date AS transaction_date,
    si.issue_type AS vendor_name,
    i.name AS item_name,
    i.id AS item_id,
    0::NUMERIC AS purchased_quantity,
    0::NUMERIC AS purchased_amount,
    0::NUMERIC AS damaged_quantity,
    0::NUMERIC AS damaged_amount,
    sii.quantity AS issued_quantity,
    sii.total_price AS issued_amount,
    i.current_stock AS balance_quantity,
    (i.current_stock * i.rate_per_unit) AS balance_amount,
    NULL::TEXT AS dep_warden_signature,
    NULL::TEXT AS principal_signature,
    NULL::TEXT AS remarks,
    si.created_at,
    si.updated_at
FROM public.stock_issues si
JOIN public.stock_issue_items sii ON sii.issue_id = si.id
JOIN public.items i ON i.id = sii.item_id;

-- ============================================
-- AUTO-ASSIGN ADMIN ROLE ON FIRST SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- First user gets admin, rest get staff
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DEFAULT STRENGTH CATEGORIES
-- ============================================
INSERT INTO public.strength_categories (category_name, student_count, assigned_amount) VALUES
  ('Cat 1 (5,6,7)', 150, 65),
  ('Cat 2 (8,9,10)', 120, 75);
