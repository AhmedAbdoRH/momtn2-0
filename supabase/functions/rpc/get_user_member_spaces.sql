
CREATE OR REPLACE FUNCTION public.get_user_member_spaces()
RETURNS SETOF public.spaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول أولاً';
  END IF;
  
  RETURN QUERY
    SELECT s.*
    FROM public.spaces s
    JOIN public.space_members sm ON s.id = sm.space_id
    WHERE sm.user_id = v_user_id;
END;
$$;
