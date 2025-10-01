-- Create a view for item-wise transaction report
CREATE OR REPLACE VIEW public.item_transaction_report AS
SELECT 
  row_number() OVER (ORDER BY COALESCE(p.purchase_date, si.issue_date), i.name) as sno,
  COALESCE(p.purchase_date, si.issue_date) as transaction_date,
  v.name as vendor_name,
  i.name as item_name,
  COALESCE(pi.quantity, 0) as purchased_quantity,
  COALESCE(pi.total_price, 0) as purchased_amount,
  COALESCE(sii.quantity, 0) as issued_quantity,
  COALESCE(sii.total_price, 0) as issued_amount,
  i.current_stock as balance_quantity,
  (i.current_stock * i.rate_per_unit) as balance_amount,
  '' as dep_warden_signature,
  '' as principal_signature,
  '' as remarks,
  i.id as item_id,
  COALESCE(p.id, si.id) as transaction_id,
  CASE WHEN p.id IS NOT NULL THEN 'purchase' ELSE 'issue' END as transaction_type
FROM public.items i
LEFT JOIN public.purchase_items pi ON i.id = pi.item_id
LEFT JOIN public.purchases p ON pi.purchase_id = p.id
LEFT JOIN public.vendors v ON p.vendor_id = v.id
LEFT JOIN public.stock_issue_items sii ON i.id = sii.item_id
LEFT JOIN public.stock_issues si ON sii.issue_id = si.id
WHERE COALESCE(p.purchase_date, si.issue_date) IS NOT NULL
ORDER BY transaction_date DESC, i.name;

-- Create a table to store transaction metadata (signatures, remarks, custom edits)
CREATE TABLE IF NOT EXISTS public.transaction_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'issue')),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  dep_warden_signature text,
  principal_signature text,
  remarks text,
  custom_balance_quantity numeric,
  custom_balance_amount numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(transaction_id, transaction_type, item_id)
);

-- Enable RLS
ALTER TABLE public.transaction_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for transaction_metadata
CREATE POLICY "Authenticated users can view transaction_metadata"
ON public.transaction_metadata FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert transaction_metadata"
ON public.transaction_metadata FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update transaction_metadata"
ON public.transaction_metadata FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete transaction_metadata"
ON public.transaction_metadata FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_transaction_metadata_updated_at
BEFORE UPDATE ON public.transaction_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();