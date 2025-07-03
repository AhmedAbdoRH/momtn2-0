-- إزالة السياسة القديمة للقراءة
DROP POLICY IF EXISTS "Enable read access for comments" ON public.comments;

-- إنشاء سياسة جديدة للقراءة تتبع نفس منطق الصور
CREATE POLICY "Users can view comments on photos they can access" 
ON public.comments 
FOR SELECT 
TO authenticated, anon 
USING (
  EXISTS (
    SELECT 1 FROM public.photos p
    WHERE p.id = comments.photo_id
    AND (
      -- الصور الشخصية (بدون مجموعة)
      (p.group_id IS NULL AND p.user_id = auth.uid())
      OR
      -- صور المجموعة (المستخدم عضو في المجموعة)
      (p.group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = p.group_id 
        AND gm.user_id = auth.uid()
      ))
    )
  )
);