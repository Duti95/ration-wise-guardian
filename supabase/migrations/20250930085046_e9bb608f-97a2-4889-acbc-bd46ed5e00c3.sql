-- Enable RLS on all tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_issue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendors table
CREATE POLICY "Authenticated users can view vendors"
ON public.vendors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert vendors"
ON public.vendors FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update vendors"
ON public.vendors FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete vendors"
ON public.vendors FOR DELETE
TO authenticated
USING (true);

-- Create RLS policies for purchases table
CREATE POLICY "Authenticated users can view purchases"
ON public.purchases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert purchases"
ON public.purchases FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchases"
ON public.purchases FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete purchases"
ON public.purchases FOR DELETE
TO authenticated
USING (true);

-- Create RLS policies for purchase_items table
CREATE POLICY "Authenticated users can view purchase_items"
ON public.purchase_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert purchase_items"
ON public.purchase_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchase_items"
ON public.purchase_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete purchase_items"
ON public.purchase_items FOR DELETE
TO authenticated
USING (true);

-- Create RLS policies for items table
CREATE POLICY "Authenticated users can view items"
ON public.items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert items"
ON public.items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
ON public.items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete items"
ON public.items FOR DELETE
TO authenticated
USING (true);

-- Create RLS policies for stock_issues table
CREATE POLICY "Authenticated users can view stock_issues"
ON public.stock_issues FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert stock_issues"
ON public.stock_issues FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update stock_issues"
ON public.stock_issues FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete stock_issues"
ON public.stock_issues FOR DELETE
TO authenticated
USING (true);

-- Create RLS policies for stock_issue_items table
CREATE POLICY "Authenticated users can view stock_issue_items"
ON public.stock_issue_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert stock_issue_items"
ON public.stock_issue_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update stock_issue_items"
ON public.stock_issue_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete stock_issue_items"
ON public.stock_issue_items FOR DELETE
TO authenticated
USING (true);

-- Create RLS policies for strength_categories table
CREATE POLICY "Authenticated users can view strength_categories"
ON public.strength_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert strength_categories"
ON public.strength_categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update strength_categories"
ON public.strength_categories FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete strength_categories"
ON public.strength_categories FOR DELETE
TO authenticated
USING (true);