-- Drop the existing SECURITY DEFINER views
DROP VIEW IF EXISTS public.purchase_transactions_report;
DROP VIEW IF EXISTS public.issue_transactions_report;

-- Recreate purchase_transactions_report view with SECURITY INVOKER (default, but explicit)
CREATE VIEW public.purchase_transactions_report
WITH (security_invoker = true)
AS
SELECT 
    row_number() OVER (ORDER BY p.purchase_date DESC, pi.created_at DESC) AS sno,
    gen_random_uuid() AS id,
    p.id AS transaction_id,
    p.purchase_date AS transaction_date,
    'purchase'::text AS transaction_type,
    i.id AS item_id,
    i.name AS item_name,
    v.name AS vendor_name,
    pi.quantity AS purchased_quantity,
    pi.total_price AS purchased_amount,
    (0)::numeric AS issued_quantity,
    (0)::numeric AS issued_amount,
    i.current_stock AS balance_quantity,
    (i.current_stock * i.rate_per_unit) AS balance_amount,
    pi.damaged_quantity,
    (pi.damaged_quantity * pi.rate_per_unit) AS damaged_amount,
    ''::text AS remarks,
    ''::text AS principal_signature,
    ''::text AS dep_warden_signature,
    p.created_at,
    p.updated_at
FROM purchases p
JOIN purchase_items pi ON p.id = pi.purchase_id
JOIN items i ON pi.item_id = i.id
JOIN vendors v ON p.vendor_id = v.id
ORDER BY p.purchase_date DESC, pi.created_at DESC;

-- Recreate issue_transactions_report view with SECURITY INVOKER (default, but explicit)
CREATE VIEW public.issue_transactions_report
WITH (security_invoker = true)
AS
SELECT 
    row_number() OVER (ORDER BY si.issue_date DESC, sii.created_at DESC) AS sno,
    gen_random_uuid() AS id,
    si.id AS transaction_id,
    si.issue_date AS transaction_date,
    'issue'::text AS transaction_type,
    i.id AS item_id,
    i.name AS item_name,
    COALESCE(
        (SELECT v.name
         FROM purchases p
         JOIN purchase_items pi ON p.id = pi.purchase_id
         JOIN vendors v ON p.vendor_id = v.id
         WHERE pi.item_id = i.id
         ORDER BY p.purchase_date DESC
         LIMIT 1), 
        'N/A'::text
    ) AS vendor_name,
    (0)::numeric AS purchased_quantity,
    (0)::numeric AS purchased_amount,
    sii.quantity AS issued_quantity,
    sii.total_price AS issued_amount,
    i.current_stock AS balance_quantity,
    (i.current_stock * i.rate_per_unit) AS balance_amount,
    (0)::numeric AS damaged_quantity,
    (0)::numeric AS damaged_amount,
    ''::text AS remarks,
    ''::text AS principal_signature,
    ''::text AS dep_warden_signature,
    si.created_at,
    si.updated_at
FROM stock_issues si
JOIN stock_issue_items sii ON si.id = sii.issue_id
JOIN items i ON sii.item_id = i.id
ORDER BY si.issue_date DESC, sii.created_at DESC;