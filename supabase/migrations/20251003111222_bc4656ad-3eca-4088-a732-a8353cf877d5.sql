-- Function to populate purchase transactions report
CREATE OR REPLACE FUNCTION populate_purchase_transaction_report()
RETURNS TRIGGER AS $$
DECLARE
  v_purchase_date timestamp with time zone;
  v_vendor_name text;
  v_item_name text;
  v_item_unit text;
  v_running_balance_qty numeric;
  v_running_balance_amt numeric;
  v_row_number bigint;
BEGIN
  -- Get purchase details
  SELECT p.purchase_date, v.name
  INTO v_purchase_date, v_vendor_name
  FROM purchases p
  LEFT JOIN vendors v ON p.vendor_id = v.id
  WHERE p.id = NEW.purchase_id;
  
  -- Get item details
  SELECT name, unit
  INTO v_item_name, v_item_unit
  FROM items
  WHERE id = NEW.item_id;
  
  -- Calculate row number for this transaction
  SELECT COALESCE(MAX(sno), 0) + 1
  INTO v_row_number
  FROM purchase_transactions_report
  WHERE item_id = NEW.item_id;
  
  -- Get previous balance
  SELECT 
    COALESCE(balance_quantity, 0),
    COALESCE(balance_amount, 0)
  INTO v_running_balance_qty, v_running_balance_amt
  FROM purchase_transactions_report
  WHERE item_id = NEW.item_id
  ORDER BY transaction_date DESC, created_at DESC
  LIMIT 1;
  
  -- If no previous balance, start from 0
  v_running_balance_qty := COALESCE(v_running_balance_qty, 0);
  v_running_balance_amt := COALESCE(v_running_balance_amt, 0);
  
  -- Calculate new balance
  v_running_balance_qty := v_running_balance_qty + NEW.quantity;
  v_running_balance_amt := v_running_balance_amt + NEW.total_price;
  
  -- Insert into purchase_transactions_report
  INSERT INTO purchase_transactions_report (
    sno,
    transaction_id,
    transaction_date,
    transaction_type,
    item_id,
    item_name,
    vendor_name,
    purchased_quantity,
    purchased_amount,
    issued_quantity,
    issued_amount,
    balance_quantity,
    balance_amount,
    created_at
  ) VALUES (
    v_row_number,
    NEW.purchase_id,
    v_purchase_date,
    'purchase',
    NEW.item_id,
    v_item_name,
    v_vendor_name,
    NEW.quantity,
    NEW.total_price,
    0,
    0,
    v_running_balance_qty,
    v_running_balance_amt,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to populate issue transactions report
CREATE OR REPLACE FUNCTION populate_issue_transaction_report()
RETURNS TRIGGER AS $$
DECLARE
  v_issue_date timestamp with time zone;
  v_item_name text;
  v_item_unit text;
  v_vendor_name text;
  v_running_balance_qty numeric;
  v_running_balance_amt numeric;
  v_row_number bigint;
  v_rate_per_unit numeric;
BEGIN
  -- Get issue date
  SELECT issue_date
  INTO v_issue_date
  FROM stock_issues
  WHERE id = NEW.issue_id;
  
  -- Get item details
  SELECT name, unit
  INTO v_item_name, v_item_unit
  FROM items
  WHERE id = NEW.item_id;
  
  -- Get most recent vendor for this item from purchases
  SELECT v.name
  INTO v_vendor_name
  FROM purchase_items pi
  JOIN purchases p ON pi.purchase_id = p.id
  JOIN vendors v ON p.vendor_id = v.id
  WHERE pi.item_id = NEW.item_id
  ORDER BY p.purchase_date DESC
  LIMIT 1;
  
  -- Calculate row number for this transaction
  SELECT COALESCE(MAX(sno), 0) + 1
  INTO v_row_number
  FROM issue_transactions_report
  WHERE item_id = NEW.item_id;
  
  -- Get previous balance from the most recent transaction (either purchase or issue)
  WITH latest_purchase AS (
    SELECT balance_quantity, balance_amount, transaction_date
    FROM purchase_transactions_report
    WHERE item_id = NEW.item_id
    ORDER BY transaction_date DESC, created_at DESC
    LIMIT 1
  ),
  latest_issue AS (
    SELECT balance_quantity, balance_amount, transaction_date
    FROM issue_transactions_report
    WHERE item_id = NEW.item_id
    ORDER BY transaction_date DESC, created_at DESC
    LIMIT 1
  )
  SELECT 
    COALESCE(
      CASE 
        WHEN lp.transaction_date > li.transaction_date OR li.transaction_date IS NULL 
        THEN lp.balance_quantity 
        ELSE li.balance_quantity 
      END, 
      0
    ),
    COALESCE(
      CASE 
        WHEN lp.transaction_date > li.transaction_date OR li.transaction_date IS NULL 
        THEN lp.balance_amount 
        ELSE li.balance_amount 
      END, 
      0
    )
  INTO v_running_balance_qty, v_running_balance_amt
  FROM latest_purchase lp
  FULL OUTER JOIN latest_issue li ON true;
  
  -- If no previous balance, start from current stock
  IF v_running_balance_qty IS NULL THEN
    SELECT current_stock, current_stock * rate_per_unit
    INTO v_running_balance_qty, v_running_balance_amt
    FROM items
    WHERE id = NEW.item_id;
  END IF;
  
  v_running_balance_qty := COALESCE(v_running_balance_qty, 0);
  v_running_balance_amt := COALESCE(v_running_balance_amt, 0);
  
  -- Calculate new balance (subtract issued quantity)
  v_running_balance_qty := v_running_balance_qty - NEW.quantity;
  v_running_balance_amt := v_running_balance_amt - NEW.total_price;
  
  -- Insert into issue_transactions_report
  INSERT INTO issue_transactions_report (
    sno,
    transaction_id,
    transaction_date,
    transaction_type,
    item_id,
    item_name,
    vendor_name,
    purchased_quantity,
    purchased_amount,
    issued_quantity,
    issued_amount,
    balance_quantity,
    balance_amount,
    created_at
  ) VALUES (
    v_row_number,
    NEW.issue_id,
    v_issue_date,
    'issue',
    NEW.item_id,
    v_item_name,
    COALESCE(v_vendor_name, 'N/A'),
    0,
    0,
    NEW.quantity,
    NEW.total_price,
    v_running_balance_qty,
    v_running_balance_amt,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_populate_purchase_report ON purchase_items;
CREATE TRIGGER trigger_populate_purchase_report
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION populate_purchase_transaction_report();

DROP TRIGGER IF EXISTS trigger_populate_issue_report ON stock_issue_items;
CREATE TRIGGER trigger_populate_issue_report
AFTER INSERT ON stock_issue_items
FOR EACH ROW
EXECUTE FUNCTION populate_issue_transaction_report();

-- Backfill existing purchase transactions
INSERT INTO purchase_transactions_report (
  sno,
  transaction_id,
  transaction_date,
  transaction_type,
  item_id,
  item_name,
  vendor_name,
  purchased_quantity,
  purchased_amount,
  issued_quantity,
  issued_amount,
  balance_quantity,
  balance_amount,
  created_at
)
SELECT
  ROW_NUMBER() OVER (PARTITION BY pi.item_id ORDER BY p.purchase_date, pi.created_at) as sno,
  p.id as transaction_id,
  p.purchase_date as transaction_date,
  'purchase' as transaction_type,
  pi.item_id,
  i.name as item_name,
  COALESCE(v.name, 'N/A') as vendor_name,
  pi.quantity as purchased_quantity,
  pi.total_price as purchased_amount,
  0 as issued_quantity,
  0 as issued_amount,
  SUM(pi.quantity) OVER (PARTITION BY pi.item_id ORDER BY p.purchase_date, pi.created_at) as balance_quantity,
  SUM(pi.total_price) OVER (PARTITION BY pi.item_id ORDER BY p.purchase_date, pi.created_at) as balance_amount,
  pi.created_at
FROM purchase_items pi
JOIN purchases p ON pi.purchase_id = p.id
JOIN items i ON pi.item_id = i.id
LEFT JOIN vendors v ON p.vendor_id = v.id
ORDER BY pi.item_id, p.purchase_date, pi.created_at;

-- Backfill existing issue transactions
WITH purchase_balances AS (
  SELECT 
    item_id,
    MAX(balance_quantity) as final_purchase_qty,
    MAX(balance_amount) as final_purchase_amt
  FROM purchase_transactions_report
  GROUP BY item_id
)
INSERT INTO issue_transactions_report (
  sno,
  transaction_id,
  transaction_date,
  transaction_type,
  item_id,
  item_name,
  vendor_name,
  purchased_quantity,
  purchased_amount,
  issued_quantity,
  issued_amount,
  balance_quantity,
  balance_amount,
  created_at
)
SELECT
  ROW_NUMBER() OVER (PARTITION BY sii.item_id ORDER BY si.issue_date, sii.created_at) as sno,
  si.id as transaction_id,
  si.issue_date as transaction_date,
  'issue' as transaction_type,
  sii.item_id,
  i.name as item_name,
  COALESCE(
    (SELECT v.name 
     FROM purchase_items pi2
     JOIN purchases p2 ON pi2.purchase_id = p2.id
     JOIN vendors v ON p2.vendor_id = v.id
     WHERE pi2.item_id = sii.item_id
     ORDER BY p2.purchase_date DESC
     LIMIT 1),
    'N/A'
  ) as vendor_name,
  0 as purchased_quantity,
  0 as purchased_amount,
  sii.quantity as issued_quantity,
  sii.total_price as issued_amount,
  COALESCE(pb.final_purchase_qty, 0) - SUM(sii.quantity) OVER (PARTITION BY sii.item_id ORDER BY si.issue_date, sii.created_at) as balance_quantity,
  COALESCE(pb.final_purchase_amt, 0) - SUM(sii.total_price) OVER (PARTITION BY sii.item_id ORDER BY si.issue_date, sii.created_at) as balance_amount,
  sii.created_at
FROM stock_issue_items sii
JOIN stock_issues si ON sii.issue_id = si.id
JOIN items i ON sii.item_id = i.id
LEFT JOIN purchase_balances pb ON pb.item_id = sii.item_id
ORDER BY sii.item_id, si.issue_date, sii.created_at;