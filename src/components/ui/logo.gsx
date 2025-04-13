// --->>> أنشئ هذا الملف في المسار: src/components/ui/logo.jsx <<<---

import React from 'react';

// مكون لعرض اللوجو
const Logo = ({ className }) => {
  // المسار الصحيح للوجو بناءً على وجوده في مجلد public
  // تأكد من أن الملف موجود فعلاً في: public/lovable-uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png
  const logoPath = "/lovable-uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png";

  return (
    <img
      src={logoPath}
      alt="Momtn Logo" // وصف بديل مهم للصور
      className={className} // لتمرير الأصناف الإضافية مثل حجم الصورة وتأثيرات الحركة
      loading="lazy" // لتحسين أداء تحميل الصفحة
    />
  );
};

export default Logo;
