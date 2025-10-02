-- Update issue_transactions_report to include vendor information
-- by linking to the most recent purchase for each item
CREATE OR REPLACE VIEW issue_transactions_report AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY si.issue_date DESC) as sno,
  si.issue_date as transaction_date,
  COALESCE(
    (
      SELECT v.name 
      FROM purchase_items pi
      JOIN purchases p ON pi.purchase_id = p.id
      JOIN vendors v ON p.vendor_id = v.id
      WHERE pi.item_id = i.id
      ORDER BY p.purchase_date DESC
      LIMIT 1
    ),
    'N/A'
  )::text as vendor_name,
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

-- Update item_transaction_report to properly combine purchase and issue transactions
-- Using UNION ALL to show each transaction as a separate row
CREATE OR REPLACE VIEW item_transaction_report AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY transaction_date DESC) as sno,
  transaction_date,
  vendor_name,
  item_name,
  purchased_quantity,
  purchased_amount,
  issued_quantity,
  issued_amount,
  balance_quantity,
  balance_amount,
  dep_warden_signature,
  principal_signature,
  remarks,
  item_id,
  transaction_id,
  transaction_type
FROM (
  -- Purchase transactions
  SELECT 
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
  WHERE i.id IS NOT NULL

  UNION ALL

  -- Issue transactions with vendor from most recent purchase
  SELECT 
    si.issue_date as transaction_date,
    COALESCE(
      (
        SELECT v.name 
        FROM purchase_items pi
        JOIN purchases p ON pi.purchase_id = p.id
        JOIN vendors v ON p.vendor_id = v.id
        WHERE pi.item_id = i.id
        ORDER BY p.purchase_date DESC
        LIMIT 1
      ),
      'N/A'
    )::text as vendor_name,
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
  WHERE i.id IS NOT NULL
) combined_transactions
ORDER BY transaction_date DESC;