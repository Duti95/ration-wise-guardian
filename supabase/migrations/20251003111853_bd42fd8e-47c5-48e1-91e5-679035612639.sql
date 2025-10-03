-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'readonly');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles
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

-- Step 4: RLS policy for user_roles table (admins can manage, users can view their own)
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Step 5: Update RLS policies for all tables to require authentication
-- Drop existing overly permissive policies

-- Vendors table
DROP POLICY IF EXISTS "Allow all operations" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can update vendors" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can delete vendors" ON public.vendors;

CREATE POLICY "Admin and staff can view vendors"
ON public.vendors FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert vendors"
ON public.vendors FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update vendors"
ON public.vendors FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete vendors"
ON public.vendors FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Items table
DROP POLICY IF EXISTS "Allow all operations" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can view items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can insert items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can delete items" ON public.items;

CREATE POLICY "Admin and staff can view items"
ON public.items FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert items"
ON public.items FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update items"
ON public.items FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete items"
ON public.items FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Purchases table
DROP POLICY IF EXISTS "Allow all operations" ON public.purchases;
DROP POLICY IF EXISTS "Authenticated users can view purchases" ON public.purchases;
DROP POLICY IF EXISTS "Authenticated users can insert purchases" ON public.purchases;
DROP POLICY IF EXISTS "Authenticated users can update purchases" ON public.purchases;
DROP POLICY IF EXISTS "Authenticated users can delete purchases" ON public.purchases;

CREATE POLICY "Admin and staff can view purchases"
ON public.purchases FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert purchases"
ON public.purchases FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update purchases"
ON public.purchases FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete purchases"
ON public.purchases FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Purchase items table
DROP POLICY IF EXISTS "Allow all operations" ON public.purchase_items;
DROP POLICY IF EXISTS "Authenticated users can view purchase_items" ON public.purchase_items;
DROP POLICY IF EXISTS "Authenticated users can insert purchase_items" ON public.purchase_items;
DROP POLICY IF EXISTS "Authenticated users can update purchase_items" ON public.purchase_items;
DROP POLICY IF EXISTS "Authenticated users can delete purchase_items" ON public.purchase_items;

CREATE POLICY "Admin and staff can view purchase items"
ON public.purchase_items FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert purchase items"
ON public.purchase_items FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update purchase items"
ON public.purchase_items FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete purchase items"
ON public.purchase_items FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Stock issues table
DROP POLICY IF EXISTS "Allow all operations" ON public.stock_issues;
DROP POLICY IF EXISTS "Authenticated users can view stock_issues" ON public.stock_issues;
DROP POLICY IF EXISTS "Authenticated users can insert stock_issues" ON public.stock_issues;
DROP POLICY IF EXISTS "Authenticated users can update stock_issues" ON public.stock_issues;
DROP POLICY IF EXISTS "Authenticated users can delete stock_issues" ON public.stock_issues;

CREATE POLICY "Admin and staff can view stock issues"
ON public.stock_issues FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert stock issues"
ON public.stock_issues FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update stock issues"
ON public.stock_issues FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete stock issues"
ON public.stock_issues FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Stock issue items table
DROP POLICY IF EXISTS "Allow all operations" ON public.stock_issue_items;
DROP POLICY IF EXISTS "Authenticated users can view stock_issue_items" ON public.stock_issue_items;
DROP POLICY IF EXISTS "Authenticated users can insert stock_issue_items" ON public.stock_issue_items;
DROP POLICY IF EXISTS "Authenticated users can update stock_issue_items" ON public.stock_issue_items;
DROP POLICY IF EXISTS "Authenticated users can delete stock_issue_items" ON public.stock_issue_items;

CREATE POLICY "Admin and staff can view stock issue items"
ON public.stock_issue_items FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert stock issue items"
ON public.stock_issue_items FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update stock issue items"
ON public.stock_issue_items FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete stock issue items"
ON public.stock_issue_items FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Strength categories table
DROP POLICY IF EXISTS "Allow all operations" ON public.strength_categories;
DROP POLICY IF EXISTS "Authenticated users can view strength_categories" ON public.strength_categories;
DROP POLICY IF EXISTS "Authenticated users can insert strength_categories" ON public.strength_categories;
DROP POLICY IF EXISTS "Authenticated users can update strength_categories" ON public.strength_categories;
DROP POLICY IF EXISTS "Authenticated users can delete strength_categories" ON public.strength_categories;

CREATE POLICY "Admin and staff can view strength categories"
ON public.strength_categories FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert strength categories"
ON public.strength_categories FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update strength categories"
ON public.strength_categories FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete strength categories"
ON public.strength_categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Utensils table
DROP POLICY IF EXISTS "Allow all operations" ON public.utensils;

CREATE POLICY "Admin and staff can view utensils"
ON public.utensils FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert utensils"
ON public.utensils FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update utensils"
ON public.utensils FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete utensils"
ON public.utensils FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Government diet menu table
DROP POLICY IF EXISTS "Allow all operations" ON public.government_diet_menu;

CREATE POLICY "Admin and staff can view diet menu"
ON public.government_diet_menu FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert diet menu"
ON public.government_diet_menu FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update diet menu"
ON public.government_diet_menu FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete diet menu"
ON public.government_diet_menu FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Transaction metadata table
DROP POLICY IF EXISTS "Authenticated users can view transaction_metadata" ON public.transaction_metadata;
DROP POLICY IF EXISTS "Authenticated users can insert transaction_metadata" ON public.transaction_metadata;
DROP POLICY IF EXISTS "Authenticated users can update transaction_metadata" ON public.transaction_metadata;
DROP POLICY IF EXISTS "Authenticated users can delete transaction_metadata" ON public.transaction_metadata;

CREATE POLICY "Admin and staff can view transaction metadata"
ON public.transaction_metadata FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Admin and staff can insert transaction metadata"
ON public.transaction_metadata FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Admin and staff can update transaction metadata"
ON public.transaction_metadata FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Only admins can delete transaction metadata"
ON public.transaction_metadata FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Report tables - readonly for all authenticated with roles
DROP POLICY IF EXISTS "Authenticated users can view purchase_transactions_report" ON public.purchase_transactions_report;
DROP POLICY IF EXISTS "Authenticated users can insert purchase_transactions_report" ON public.purchase_transactions_report;
DROP POLICY IF EXISTS "Authenticated users can update purchase_transactions_report" ON public.purchase_transactions_report;
DROP POLICY IF EXISTS "Authenticated users can delete purchase_transactions_report" ON public.purchase_transactions_report;

CREATE POLICY "Admin and staff can view purchase reports"
ON public.purchase_transactions_report FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Only admins can modify purchase reports"
ON public.purchase_transactions_report FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can view issue_transactions_report" ON public.issue_transactions_report;
DROP POLICY IF EXISTS "Authenticated users can insert issue_transactions_report" ON public.issue_transactions_report;
DROP POLICY IF EXISTS "Authenticated users can update issue_transactions_report" ON public.issue_transactions_report;
DROP POLICY IF EXISTS "Authenticated users can delete issue_transactions_report" ON public.issue_transactions_report;

CREATE POLICY "Admin and staff can view issue reports"
ON public.issue_transactions_report FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Only admins can modify issue reports"
ON public.issue_transactions_report FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can view item_transaction_report" ON public.item_transaction_report;
DROP POLICY IF EXISTS "Authenticated users can insert item_transaction_report" ON public.item_transaction_report;
DROP POLICY IF EXISTS "Authenticated users can update item_transaction_report" ON public.item_transaction_report;
DROP POLICY IF EXISTS "Authenticated users can delete item_transaction_report" ON public.item_transaction_report;

CREATE POLICY "Admin and staff can view item reports"
ON public.item_transaction_report FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'readonly')
);

CREATE POLICY "Only admins can modify item reports"
ON public.item_transaction_report FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Step 6: Fix database functions to have fixed search_path
CREATE OR REPLACE FUNCTION populate_purchase_transaction_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase_date TIMESTAMP WITH TIME ZONE;
  v_vendor_name TEXT;
  v_item_name TEXT;
  v_balance_quantity NUMERIC := 0;
  v_balance_amount NUMERIC := 0;
BEGIN
  SELECT p.purchase_date, v.name
  INTO v_purchase_date, v_vendor_name
  FROM purchases p
  LEFT JOIN vendors v ON p.vendor_id = v.id
  WHERE p.id = NEW.purchase_id;

  SELECT name INTO v_item_name
  FROM items
  WHERE id = NEW.item_id;

  SELECT COALESCE(balance_quantity, 0), COALESCE(balance_amount, 0)
  INTO v_balance_quantity, v_balance_amount
  FROM purchase_transactions_report
  WHERE item_id = NEW.item_id
  ORDER BY transaction_date DESC, created_at DESC
  LIMIT 1;

  v_balance_quantity := v_balance_quantity + NEW.quantity - COALESCE(NEW.damaged_quantity, 0);
  v_balance_amount := v_balance_amount + NEW.total_price;

  INSERT INTO purchase_transactions_report (
    transaction_id,
    transaction_type,
    transaction_date,
    item_id,
    item_name,
    vendor_name,
    purchased_quantity,
    purchased_amount,
    balance_quantity,
    balance_amount
  ) VALUES (
    NEW.purchase_id,
    'purchase',
    v_purchase_date,
    NEW.item_id,
    v_item_name,
    v_vendor_name,
    NEW.quantity - COALESCE(NEW.damaged_quantity, 0),
    NEW.total_price,
    v_balance_quantity,
    v_balance_amount
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION populate_issue_transaction_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_issue_date TIMESTAMP WITH TIME ZONE;
  v_issue_type TEXT;
  v_item_name TEXT;
  v_vendor_name TEXT;
  v_balance_quantity NUMERIC := 0;
  v_balance_amount NUMERIC := 0;
BEGIN
  SELECT si.issue_date, si.issue_type
  INTO v_issue_date, v_issue_type
  FROM stock_issues si
  WHERE si.id = NEW.issue_id;

  SELECT name INTO v_item_name
  FROM items
  WHERE id = NEW.item_id;

  SELECT vendor_name
  INTO v_vendor_name
  FROM purchase_transactions_report
  WHERE item_id = NEW.item_id
  ORDER BY transaction_date DESC
  LIMIT 1;

  SELECT COALESCE(balance_quantity, 0), COALESCE(balance_amount, 0)
  INTO v_balance_quantity, v_balance_amount
  FROM issue_transactions_report
  WHERE item_id = NEW.item_id
  ORDER BY transaction_date DESC, created_at DESC
  LIMIT 1;

  IF v_balance_quantity = 0 THEN
    SELECT COALESCE(balance_quantity, 0), COALESCE(balance_amount, 0)
    INTO v_balance_quantity, v_balance_amount
    FROM purchase_transactions_report
    WHERE item_id = NEW.item_id
    ORDER BY transaction_date DESC, created_at DESC
    LIMIT 1;
  END IF;

  v_balance_quantity := v_balance_quantity - NEW.quantity;
  v_balance_amount := v_balance_amount - NEW.total_price;

  INSERT INTO issue_transactions_report (
    transaction_id,
    transaction_type,
    transaction_date,
    item_id,
    item_name,
    vendor_name,
    issued_quantity,
    issued_amount,
    balance_quantity,
    balance_amount
  ) VALUES (
    NEW.issue_id,
    v_issue_type,
    v_issue_date,
    NEW.item_id,
    v_item_name,
    v_vendor_name,
    NEW.quantity,
    NEW.total_price,
    v_balance_quantity,
    v_balance_amount
  );

  RETURN NEW;
END;
$$;