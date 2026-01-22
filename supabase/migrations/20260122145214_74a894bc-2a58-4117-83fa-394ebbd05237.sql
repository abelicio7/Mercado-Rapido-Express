-- Allow admins to update the is_verified field on profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile verification status"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));