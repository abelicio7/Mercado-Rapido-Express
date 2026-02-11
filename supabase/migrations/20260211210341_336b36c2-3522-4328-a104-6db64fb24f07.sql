
-- Table to track confirmed subscription payments
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  plan_type text NOT NULL,
  billing_period text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  payment_reference text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Only admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.subscription_payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sellers can view their own payments
CREATE POLICY "Sellers can view their own payments"
ON public.subscription_payments
FOR SELECT
USING (auth.uid() = seller_id);

-- No direct inserts from client - only service role (edge function) inserts
