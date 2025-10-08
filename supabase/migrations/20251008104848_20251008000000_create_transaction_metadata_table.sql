/*
  # Create Transaction Metadata Table

  1. New Tables
    - `transaction_metadata`
      - `id` (uuid, primary key) - Unique identifier for the metadata record
      - `transaction_id` (uuid, not null) - Reference to the transaction (purchase or stock_issue)
      - `transaction_type` (text, not null) - Type of transaction ('purchase' or 'issue')
      - `item_id` (uuid, not null) - Reference to the item
      - `dep_warden_signature` (text) - Deputy Warden signature
      - `principal_signature` (text) - Principal signature
      - `remarks` (text) - Additional remarks/notes
      - `custom_balance_quantity` (numeric) - Custom balance quantity override
      - `custom_balance_amount` (numeric) - Custom balance amount override
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Indexes
    - Unique index on (transaction_id, transaction_type, item_id) for efficient lookups

  3. Security
    - Enable RLS on `transaction_metadata` table
    - Add policies for authenticated users to read and manage their transaction metadata
*/

-- Create transaction_metadata table
CREATE TABLE IF NOT EXISTS public.transaction_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'issue')),
  item_id uuid NOT NULL,
  dep_warden_signature text DEFAULT '',
  principal_signature text DEFAULT '',
  remarks text DEFAULT '',
  custom_balance_quantity numeric DEFAULT NULL,
  custom_balance_amount numeric DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(transaction_id, transaction_type, item_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transaction_metadata_lookup
ON public.transaction_metadata(transaction_id, transaction_type, item_id);

-- Enable RLS
ALTER TABLE public.transaction_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view transaction metadata"
  ON public.transaction_metadata
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transaction metadata"
  ON public.transaction_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transaction metadata"
  ON public.transaction_metadata
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transaction metadata"
  ON public.transaction_metadata
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transaction_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_metadata_updated_at
  BEFORE UPDATE ON public.transaction_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_metadata_updated_at();