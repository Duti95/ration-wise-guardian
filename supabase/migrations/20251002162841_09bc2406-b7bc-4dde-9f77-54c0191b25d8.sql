-- Drop the existing views
DROP VIEW IF EXISTS public.purchase_transactions_report;
DROP VIEW IF EXISTS public.issue_transactions_report;
DROP VIEW IF EXISTS public.item_transaction_report;

-- Create purchase_transactions_report as an editable table
CREATE TABLE public.purchase_transactions_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sno BIGINT,
  transaction_id UUID,
  transaction_date TIMESTAMP WITH TIME ZONE,
  transaction_type TEXT,
  item_id UUID,
  item_name TEXT,
  vendor_name TEXT,
  purchased_quantity NUMERIC,
  purchased_amount NUMERIC,
  issued_quantity NUMERIC,
  issued_amount NUMERIC,
  balance_quantity NUMERIC,
  balance_amount NUMERIC,
  remarks TEXT,
  principal_signature TEXT,
  dep_warden_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create issue_transactions_report as an editable table
CREATE TABLE public.issue_transactions_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sno BIGINT,
  transaction_id UUID,
  transaction_date TIMESTAMP WITH TIME ZONE,
  transaction_type TEXT,
  item_id UUID,
  item_name TEXT,
  vendor_name TEXT,
  purchased_quantity NUMERIC,
  purchased_amount NUMERIC,
  issued_quantity NUMERIC,
  issued_amount NUMERIC,
  balance_quantity NUMERIC,
  balance_amount NUMERIC,
  remarks TEXT,
  principal_signature TEXT,
  dep_warden_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create item_transaction_report as an editable table
CREATE TABLE public.item_transaction_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sno BIGINT,
  transaction_id UUID,
  transaction_date TIMESTAMP WITH TIME ZONE,
  transaction_type TEXT,
  item_id UUID,
  item_name TEXT,
  vendor_name TEXT,
  purchased_quantity NUMERIC,
  purchased_amount NUMERIC,
  issued_quantity NUMERIC,
  issued_amount NUMERIC,
  balance_quantity NUMERIC,
  balance_amount NUMERIC,
  remarks TEXT,
  principal_signature TEXT,
  dep_warden_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all three tables
ALTER TABLE public.purchase_transactions_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_transactions_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_transaction_report ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchase_transactions_report
CREATE POLICY "Authenticated users can view purchase_transactions_report"
ON public.purchase_transactions_report FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert purchase_transactions_report"
ON public.purchase_transactions_report FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update purchase_transactions_report"
ON public.purchase_transactions_report FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete purchase_transactions_report"
ON public.purchase_transactions_report FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for issue_transactions_report
CREATE POLICY "Authenticated users can view issue_transactions_report"
ON public.issue_transactions_report FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert issue_transactions_report"
ON public.issue_transactions_report FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update issue_transactions_report"
ON public.issue_transactions_report FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete issue_transactions_report"
ON public.issue_transactions_report FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for item_transaction_report
CREATE POLICY "Authenticated users can view item_transaction_report"
ON public.item_transaction_report FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert item_transaction_report"
ON public.item_transaction_report FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update item_transaction_report"
ON public.item_transaction_report FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete item_transaction_report"
ON public.item_transaction_report FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create updated_at triggers
CREATE TRIGGER update_purchase_transactions_report_updated_at
BEFORE UPDATE ON public.purchase_transactions_report
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issue_transactions_report_updated_at
BEFORE UPDATE ON public.issue_transactions_report
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_item_transaction_report_updated_at
BEFORE UPDATE ON public.item_transaction_report
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();