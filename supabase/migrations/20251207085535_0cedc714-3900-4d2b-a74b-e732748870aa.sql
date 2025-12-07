-- Create transaction_metadata table to store signatures, remarks, and custom balance values
CREATE TABLE public.transaction_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  dep_warden_signature TEXT,
  principal_signature TEXT,
  remarks TEXT,
  custom_balance_quantity NUMERIC,
  custom_balance_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, transaction_type, item_id)
);

-- Enable Row Level Security
ALTER TABLE public.transaction_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin and staff can view transaction metadata" 
ON public.transaction_metadata 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'readonly'::app_role));

CREATE POLICY "Admin and staff can insert transaction metadata" 
ON public.transaction_metadata 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admin and staff can update transaction metadata" 
ON public.transaction_metadata 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Only admins can delete transaction metadata" 
ON public.transaction_metadata 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transaction_metadata_updated_at
BEFORE UPDATE ON public.transaction_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();