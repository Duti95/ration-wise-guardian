-- Create view for purchase transactions only
CREATE OR REPLACE VIEW purchase_transactions_report AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY p.purchase_date DESC) as sno,
  p.purchase_date as transaction_date,
  v.name as vendor_name,
  i.name as item_name,
  pi.quantity as purchased_quantity,
  pi.total_price as purchased_amount,
  0::numeric as issued_quantity,
  0::numeric as issued_amount,
  i.current_stock as balance_quantity,
  (i.current_stock * i.rate_per_unit) as balance_amount,
  ''::text as dep_warden_signature,
  ''::text as principal_signature,
  ''::text as remarks,
  i.id as item_id,
  p.id as transaction_id,
  'purchase'::text as transaction_type
FROM purchases p
LEFT JOIN vendors v ON p.vendor_id = v.id
LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
LEFT JOIN items i ON pi.item_id = i.id
WHERE i.id IS NOT NULL;

-- Create view for issue transactions only
CREATE OR REPLACE VIEW issue_transactions_report AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY si.issue_date DESC) as sno,
  si.issue_date as transaction_date,
  ''::text as vendor_name,
  i.name as item_name,
  0::numeric as purchased_quantity,
  0::numeric as purchased_amount,
  sii.quantity as issued_quantity,
  sii.total_price as issued_amount,
  i.current_stock as balance_quantity,
  (i.current_stock * i.rate_per_unit) as balance_amount,
  ''::text as dep_warden_signature,
  ''::text as principal_signature,
  ''::text as remarks,
  i.id as item_id,
  si.id as transaction_id,
  'issue'::text as transaction_type
FROM stock_issues si
LEFT JOIN stock_issue_items sii ON si.id = sii.issue_id
LEFT JOIN items i ON sii.item_id = i.id
WHERE i.id IS NOT NULL;

-- Grant access to these views
GRANT SELECT ON purchase_transactions_report TO authenticated;
GRANT SELECT ON issue_transactions_report TO authenticated;
GRANT SELECT ON purchase_transactions_report TO anon;
GRANT SELECT ON issue_transactions_report TO anon;