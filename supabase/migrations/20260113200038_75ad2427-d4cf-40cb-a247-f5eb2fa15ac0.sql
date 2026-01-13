-- Add promotional price and expiration date columns to products table
ALTER TABLE public.products 
ADD COLUMN promotional_price numeric NULL,
ADD COLUMN promotion_expires_at timestamp with time zone NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.products.promotional_price IS 'Promotional price (must be less than regular price)';
COMMENT ON COLUMN public.products.promotion_expires_at IS 'Date and time when the promotion expires';