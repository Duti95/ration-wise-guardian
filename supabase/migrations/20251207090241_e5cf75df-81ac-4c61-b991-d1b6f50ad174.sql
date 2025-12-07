-- Drop the obsolete triggers that try to INSERT into views
DROP TRIGGER IF EXISTS trigger_populate_issue_report ON stock_issue_items;
DROP TRIGGER IF EXISTS trigger_populate_purchase_report ON purchase_items;

-- Drop the obsolete functions (no longer needed since views auto-generate reports)
DROP FUNCTION IF EXISTS populate_issue_transaction_report();
DROP FUNCTION IF EXISTS populate_purchase_transaction_report();