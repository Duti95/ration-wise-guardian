-- Clear all data from the database (in correct order to respect foreign keys)

-- Clear report tables first (no foreign keys)
TRUNCATE TABLE issue_transactions_report CASCADE;
TRUNCATE TABLE item_transaction_report CASCADE;
TRUNCATE TABLE purchase_transactions_report CASCADE;
TRUNCATE TABLE transaction_metadata CASCADE;

-- Clear stock issue related tables
TRUNCATE TABLE stock_issue_items CASCADE;
TRUNCATE TABLE stock_issues CASCADE;

-- Clear purchase related tables
TRUNCATE TABLE purchase_items CASCADE;
TRUNCATE TABLE purchases CASCADE;

-- Clear other tables
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE vendors CASCADE;
TRUNCATE TABLE utensils CASCADE;
TRUNCATE TABLE strength_categories CASCADE;
TRUNCATE TABLE government_diet_menu CASCADE;