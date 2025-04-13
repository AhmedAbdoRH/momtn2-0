
-- إنشاء دالة لتحديث اسم الألبوم في جميع الصور
CREATE OR REPLACE FUNCTION public.update_album_name(old_name text, new_name text)
RETURNS void AS $$
BEGIN
  -- تحديث الهاشتاج في جميع الصور التي تستخدم الاسم القديم
  UPDATE photos
  SET hashtags = array_replace(hashtags, old_name, new_name)
  WHERE old_name = ANY(hashtags);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
