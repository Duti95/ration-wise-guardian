-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.item_transaction_report;

CREATE VIEW public.item_transaction_report 
WITH (security_invoker=true)
AS
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