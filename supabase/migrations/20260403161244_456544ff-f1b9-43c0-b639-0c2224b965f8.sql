
CREATE POLICY "Admin and staff can delete utensils" ON public.utensils
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
