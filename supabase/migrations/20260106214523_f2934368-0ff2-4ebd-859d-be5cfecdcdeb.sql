-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
ON public.categories FOR SELECT USING (true);

-- Insert default categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Electrónicos', 'electronicos', 'Smartphone'),
  ('Móveis', 'moveis', 'Sofa'),
  ('Moda', 'moda', 'Shirt'),
  ('Veículos', 'veiculos', 'Car'),
  ('Acessórios', 'acessorios', 'ShoppingBag'),
  ('Desporto', 'desporto', 'Dumbbell'),
  ('Bebé e Criança', 'bebe-crianca', 'Baby'),
  ('Ferramentas', 'ferramentas', 'Wrench'),
  ('Computadores', 'computadores', 'Laptop'),
  ('Casa e Jardim', 'casa-jardim', 'Home');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT '{}',
  is_highlighted BOOLEAN DEFAULT false,
  highlight_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable if seller has active plan or in trial
CREATE POLICY "Products are publicly readable for active sellers"
ON public.products FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = products.seller_id
    AND (
      p.plan_expires_at > now()
      OR p.trial_ends_at > now()
    )
  )
  AND is_active = true
);

-- Sellers can manage their own products
CREATE POLICY "Sellers can insert their own products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own products"
ON public.products FOR DELETE
USING (auth.uid() = seller_id);

-- Sellers can view all their own products (including inactive)
CREATE POLICY "Sellers can view all their own products"
ON public.products FOR SELECT
USING (auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create interest clicks tracking table
CREATE TABLE public.interest_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interest_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert clicks
CREATE POLICY "Authenticated users can insert clicks"
ON public.interest_clicks FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Sellers can view clicks on their products
CREATE POLICY "Sellers can view clicks on their products"
ON public.interest_clicks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = interest_clicks.product_id
    AND p.seller_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_highlighted ON public.products(is_highlighted) WHERE is_highlighted = true;
CREATE INDEX idx_interest_clicks_product_id ON public.interest_clicks(product_id);
CREATE INDEX idx_interest_clicks_clicked_at ON public.interest_clicks(clicked_at);