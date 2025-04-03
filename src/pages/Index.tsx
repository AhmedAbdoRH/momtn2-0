import { Plus, Menu, LogOut, User } from "lucide-react"; // استيراد أيقونات من مكتبة lucide-react
import PhotoGrid from "@/components/PhotoGrid"; // استيراد مكون PhotoGrid
import { Button } from "@/components/ui/button"; // استيراد مكون Button من مكتبة ui
import CreateNewDialog from "@/components/CreateNewDialog"; // استيراد مكون CreateNewDialog
import { useState } from "react"; // استيراد useState hook من React
import { useAuth } from "@/components/AuthProvider"; // استيراد hook useAuth من AuthProvider
import {
  DropdownMenu, // استيراد مكون DropdownMenu
  DropdownMenuContent, // استيراد مكون DropdownMenuContent
  DropdownMenuItem, // استيراد مكون DropdownMenuItem
  DropdownMenuTrigger, // استيراد مكون DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"; // استيراد مكونات DropdownMenu من مكتبة ui
import { HeartSoundProvider } from "@/components/HeartSound"; // استيراد HeartSoundProvider

const Index = () => { // تعريف مكون Index
  const [dialogOpen, setDialogOpen] = useState(false); // حالة فتح/إغلاق مربع الحوار CreateNewDialog
  const [sidebarOpen, setSidebarOpen] = useState(false); // حالة فتح/إغلاق الشريط الجانبي
  const [btnAnimation, setBtnAnimation] = useState(false); // حالة تأثير الرسوم المتحركة للزر
  const { signOut, user } = useAuth(); // استخراج دالة signOut و user من hook useAuth

  const handleCreateNew = () => { // تعريف دالة handleCreateNew
    setBtnAnimation(true); // تعيين حالة الرسوم المتحركة للزر إلى true
    setTimeout(() => setBtnAnimation(false), 300); // تعيين حالة الرسوم المتحركة للزر إلى false بعد 300 مللي ثانية
    setDialogOpen(true); // فتح مربع الحوار CreateNewDialog
  };

  return (
    <HeartSoundProvider> // توفير HeartSoundContext
      <div className="min-h-screen bg-background text-foreground"> {/* حاوية رئيسية بملء الشاشة */}
        {/* Sidebar Toggle Button */}
        <Button // زر تبديل الشريط الجانبي
          variant="ghost" // نمط الزر
          size="icon" // حجم الزر
          onClick={() => setSidebarOpen(!sidebarOpen)} // تبديل حالة الشريط الجانبي عند النقر
          className="fixed top-4 right-4 z-50 glass-effect text-gray-700" // أنماط CSS للزر
        >
          <Menu className="h-5 w-5" /> {/* أيقونة القائمة */}
        </Button>

        {/* User dropdown */}
        <div className="fixed top-4 left-4 z-50"> {/* حاوية قائمة المستخدم المنسدلة */}
          <DropdownMenu> {/* قائمة منسدلة */}
            <DropdownMenuTrigger asChild> {/* زر تشغيل القائمة المنسدلة */}
              <Button variant="ghost" size="icon" className="glass-effect text-gray-700"> {/* زر المستخدم */}
                <User className="h-5 w-5" /> {/* أيقونة المستخدم */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-effect text-gray-700 border border-border"> {/* محتوى القائمة المنسدلة */}
              <div className="px-2 py-1.5 text-sm font-medium text-gray-600 truncate"> {/* عرض بريد المستخدم */}
                {user?.email}
              </div>
              <DropdownMenuItem // عنصر قائمة تسجيل الخروج
                onClick={signOut} // استدعاء دالة signOut عند النقر
                className="text-red-500 focus:text-red-500 cursor-pointer focus:bg-gray-100" // أنماط CSS لعنصر القائمة
              >
                <LogOut className="mr-2 h-4 w-4" /> {/* أيقونة تسجيل الخروج */}
                <span>تسجيل الخروج</span> {/* نص تسجيل الخروج */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full glass-effect w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} // أنماط CSS للشريط الجانبي
        >
          <div className="flex-1 p-6 pt-20"> {/* حاوية محتوى الشريط الجانبي */}
            <h3 className="text-gray-700 font-semibold mb-4 text-right">الهاشتاجات</h3> {/* عنوان الشريط الجانبي */}
            <div className="flex flex-col space-y-3 items-end" id="hashtags-container"> {/* حاوية الهاشتاجات */}
              {/* Hashtags will be rendered here by PhotoGrid component */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* حاوية المحتوى الرئيسي */}
          <div className="text-center mb-8"> {/* حاوية المحتوى المركزي */}
            <div className="inline-block mb-6 w-40 h-40 sm:w-48 sm:h-48"> {/* حاوية الشعار */}
              <img 
                src="/lovable-uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png" // مسار صورة الشعار
                alt="Logo" // نص بديل لصورة الشعار
                className="w-full h-full object-contain animate-float" // أنماط CSS لصورة الشعار
              />
            </div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6"> {/* نص رئيسي */}
              ﴾ يَا أَيُّهَا النَّاسُ اذْكُرُوا نِعْمَتَ اللَّهِ عَلَيْكُمْ ﴿ 
            </p>
            
            {/* Add New Gratitude Button in the center */}
            <Button // زر "إضافة امتنان جديد" في المنتصف
              onClick={handleCreateNew} // استدعاء دالة handleCreateNew عند النقر
              className={`px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-lg mx-auto transition-all duration-300 ${ // أنماط CSS للزر
                btnAnimation ? 'scale-95 shadow-inner' : 'hover:scale-105' // تأثير الرسوم المتحركة للزر
              }`}
            >
              <Plus className={`w-5 h-5 mr-2 transition-transform duration-300 ${btnAnimation ? 'rotate-180' : ''}`} /> {/* أيقونة الإضافة */}
              إضافة امتنان جديد {/* نص الزر */}
            </Button>
          </div>

          <PhotoGrid /> {/* عرض شبكة الصور */}
          <CreateNewDialog open={dialogOpen} onOpenChange={setDialogOpen} /> {/* عرض مربع حوار إنشاء امتنان جديد */}

          {/* Floating Action Button - Fixed position */}
          <Button // زر الإضافة العائم
            onClick={handleCreateNew} // استدعاء دالة handleCreateNew عند النقر
            className={`fixed bottom-6 left-6 w-14 h-14 rounded-full glass-effect text-pink-500 shadow-lg transition-all duration-300 ${ // أنماط CSS للزر
              btnAnimation ? 'scale-95 rotate-180' : '' // تأثير الرسوم المتحركة للزر
            }`}
          >
            <Plus className="w-6 h-6" /> {/* أيقونة الإضافة */}
          </Button>
        </main>

        {/* Overlay */}
        {sidebarOpen && ( // عرض التراكب إذا كان الشريط الجانبي مفتوحًا
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30" // أنماط CSS للتراكب
            onClick={() => setSidebarOpen(false)} // إغلاق الشريط الجانبي عند النقر على التراكب
          />
        )}
      </div>
    </HeartSoundProvider> // إغلاق HeartSoundProvider
  );
};

export default Index; // تصدير مكون Index
