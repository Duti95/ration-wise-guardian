-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL,
  danger_threshold DECIMAL(10,2) DEFAULT 50,
  medium_threshold DECIMAL(10,2) DEFAULT 100,
  current_stock DECIMAL(10,2) DEFAULT 0,
  rate_per_unit DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_no TEXT NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id),
  quantity DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'amount')),
  discount_value DECIMAL(10,2) DEFAULT 0,
  rate_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  damaged_quantity DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strength_categories table
CREATE TABLE IF NOT EXISTS public.strength_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  student_count INTEGER DEFAULT 0,
  assigned_amount DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_issues table
CREATE TABLE IF NOT EXISTS public.stock_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  issue_type TEXT CHECK (issue_type IN ('Master', 'Handloan')) DEFAULT 'Master',
  total_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_issue_items table
CREATE TABLE IF NOT EXISTS public.stock_issue_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES public.stock_issues(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id),
  quantity DECIMAL(10,2) NOT NULL,
  rate_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utensils table
CREATE TABLE IF NOT EXISTS public.utensils (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity TEXT,
  current_quantity INTEGER DEFAULT 0,
  damaged_quantity INTEGER DEFAULT 0,
  replacement_needed INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create government_diet_menu table
CREATE TABLE IF NOT EXISTS public.government_diet_menu (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'snack')) NOT NULL,
  items JSONB NOT NULL,
  week_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(menu_date, meal_type)
);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_issue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utensils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_diet_menu ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.vendors FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'items' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.items FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchases' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.purchases FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_items' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.purchase_items FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'strength_categories' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.strength_categories FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_issues' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.stock_issues FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_issue_items' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.stock_issue_items FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'utensils' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.utensils FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'government_diet_menu' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON public.government_diet_menu FOR ALL USING (true);
  END IF;
END $$;

-- Insert sample data
INSERT INTO public.strength_categories (category_name, student_count, assigned_amount) VALUES 
('Classes Below 8', 150, 5.50),
('Classes Below 11', 100, 6.00),
('Intermediate (11-12)', 50, 6.50)
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO public.items (name, unit, danger_threshold, medium_threshold, current_stock, rate_per_unit) VALUES 
('Rice', 'kg', 100, 200, 450, 45.00),
('Dal', 'kg', 30, 60, 75, 120.00),
('Oil', 'litres', 10, 25, 25, 150.00),
('Vegetables', 'kg', 50, 100, 120, 30.00),
('Milk', 'litres', 20, 40, 45, 50.00)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.vendors (name, contact_person, phone, address) VALUES 
('Local Grocery Store', 'Ram Kumar', '9876543210', '123 Market Street'),
('Wholesale Supplies', 'Suresh Patel', '9876543211', '456 Trade Center'),
('Fresh Vegetables Co.', 'Amit Singh', '9876543212', '789 Farm Road')
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vendors_updated_at') THEN
    CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_items_updated_at') THEN
    CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_purchases_updated_at') THEN
    CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_strength_categories_updated_at') THEN
    CREATE TRIGGER update_strength_categories_updated_at BEFORE UPDATE ON public.strength_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stock_issues_updated_at') THEN
    CREATE TRIGGER update_stock_issues_updated_at BEFORE UPDATE ON public.stock_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_utensils_updated_at') THEN
    CREATE TRIGGER update_utensils_updated_at BEFORE UPDATE ON public.utensils FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;