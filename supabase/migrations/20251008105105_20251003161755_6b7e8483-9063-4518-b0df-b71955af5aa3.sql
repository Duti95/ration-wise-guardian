-- Drop existing report tables/views
DROP TABLE IF EXISTS public.purchase_transactions_report CASCADE;
DROP TABLE IF EXISTS public.issue_transactions_report CASCADE;
DROP VIEW IF EXISTS public.purchase_transactions_report CASCADE;
DROP VIEW IF EXISTS public.issue_transactions_report CASCADE;

-- Create purchase transactions view
CREATE OR REPLACE VIEW public.purchase_transactions_report AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY p.purchase_date DESC, pi.created_at DESC) as sno,
  gen_random_uuid() as id,
  p.id as transaction_id,
  p.purchase_date as transaction_date,
  'purchase'::text as transaction_type,
  i.id as item_id,
  i.name as item_name,
  v.name as vendor_name,
  pi.quantity as purchased_quantity,
  pi.total_price as purchased_amount,
  0::numeric as issued_quantity,
  0::numeric as issued_amount,
  i.current_stock as balance_quantity,
  (i.current_stock * i.rate_per_unit) as balance_amount,
  COALESCE(pi.damaged_quantity, 0) as damaged_quantity,
  COALESCE(pi.damaged_quantity * pi.rate_per_unit, 0) as damaged_amount,
  ''::text as remarks,
  ''::text as principal_signature,
  ''::text as dep_warden_signature,
  p.created_at,
  p.updated_at
FROM purchases p
JOIN purchase_items pi ON p.id = pi.purchase_id
JOIN items i ON pi.item_id = i.id
JOIN vendors v ON p.vendor_id = v.id
ORDER BY p.purchase_date DESC, pi.created_at DESC;

-- Create issue transactions view
CREATE OR REPLACE VIEW public.issue_transactions_report AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY si.issue_date DESC, sii.created_at DESC) as sno,
  gen_random_uuid() as id,
  si.id as transaction_id,
  si.issue_date as transaction_date,
  'issue'::text as transaction_type,
  i.id as item_id,
  i.name as item_name,
  COALESCE(
    (SELECT v.name 
     FROM purchases p 
     JOIN purchase_items pi ON p.id = pi.purchase_id 
     JOIN vendors v ON p.vendor_id = v.id
     WHERE pi.item_id = i.id 
     ORDER BY p.purchase_date DESC 
     LIMIT 1),
    'N/A'
  ) as vendor_name,
  0::numeric as purchased_quantity,
  0::numeric as purchased_amount,
  sii.quantity as issued_quantity,
  sii.total_price as issued_amount,
  i.current_stock as balance_quantity,
  (i.current_stock * i.rate_per_unit) as balance_amount,
  0::numeric as damaged_quantity,
  0::numeric as damaged_amount,
  ''::text as remarks,
  ''::text as principal_signature,
  ''::text as dep_warden_signature,
  si.created_at,
  si.updated_at
FROM stock_issues si
JOIN stock_issue_items sii ON si.id = sii.issue_id
JOIN items i ON sii.item_id = i.id
ORDER BY si.issue_date DESC, sii.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.purchase_transactions_report TO authenticated;
GRANT SELECT ON public.issue_transactions_report TO authenticated;