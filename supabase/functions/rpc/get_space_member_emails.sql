
CREATE OR REPLACE FUNCTION public.get_space_member_emails(p_space_id UUID)
RETURNS TABLE(user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_owner BOOLEAN;
  v_is_member BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول أولاً';
  END IF;
  
  -- تحقق ما إذا كان المستخدم مالك المساحة
  SELECT EXISTS (
    SELECT 1 FROM public.spaces 
    WHERE id = p_space_id AND owner_id = v_user_id
  ) INTO v_is_owner;
  
  -- تحقق ما إذا كان المستخدم عضوًا في المساحة
  SELECT EXISTS (
    SELECT 1 FROM public.space_members 
    WHERE space_id = p_space_id AND user_id = v_user_id
  ) INTO v_is_member;
  
  -- إذا لم يكن مالكًا أو عضوًا، يجب أن نرفض الطلب
  IF NOT (v_is_owner OR v_is_member) THEN
    RAISE EXCEPTION 'لا يمكنك الوصول إلى هذه المعلومات';
  END IF;
  
  -- إرجاع معرفات المستخدمين وبريدهم الإلكتروني
  RETURN QUERY
  SELECT m.user_id, u.email
  FROM public.space_members m
  JOIN auth.users u ON m.user_id = u.id
  WHERE m.space_id = p_space_id;
END;
$$;
