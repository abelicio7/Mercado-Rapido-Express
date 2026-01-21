-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update products RLS policy to allow admins to bypass plan restrictions
DROP POLICY IF EXISTS "Products are publicly readable for active sellers" ON public.products;

CREATE POLICY "Products are publicly readable for active sellers or admins"
ON public.products
FOR SELECT
USING (
  (
    (EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = products.seller_id
      AND (p.plan_expires_at > now() OR p.trial_ends_at > now())
    ))
    AND is_active = true
  )
  OR public.has_role(products.seller_id, 'admin')
  OR auth.uid() = seller_id
);

-- Insert admin role for abeliciosimoney@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'abeliciosimoney@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;