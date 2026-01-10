-- Create store_reviews table for customer reviews
CREATE TABLE public.store_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (store_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly readable"
ON public.store_reviews
FOR SELECT
USING (true);

-- Authenticated users can create reviews (one per store)
CREATE POLICY "Users can create reviews"
ON public.store_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.store_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.store_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_store_reviews_updated_at
BEFORE UPDATE ON public.store_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();