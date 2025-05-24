import * as React from 'react'; // Import React
import { useState, useEffect } from "react"; // Import useState and useEffect hooks
import { Plus, Menu, LogOut, User, Settings } from "lucide-react"; // Added Settings icon
import { useNavigate } from "react-router-dom";

// --- افتراضيات لمسارات الاستيراد ---
// --- Assumptions for import paths ---
// Please adjust these paths based on your actual project structure
// الرجاء تعديل هذه المسارات بناءً على هيكل مشروعك الفعلي
// Assuming components are in a 'components' directory relative to this file or aliased via '@'
// نفترض أن المكونات موجودة في مجلد 'components' بالنسبة لهذا الملف أو معرفة باستخدام '@'
import PhotoGrid from "@/components/PhotoGrid";
import { Button } from "@/components/ui/button";
import CreateNewDialog from "@/components/CreateNewDialog";
import { useAuth } from "@/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeartSoundProvider } from "@/components/HeartSound";
// --- نهاية افتراضيات المسارات ---
// --- End of path assumptions ---


/**
 * Index Component - Main page displaying the photo grid and controls.
 * مكون Index - الصفحة الرئيسية التي تعرض شبكة الصور وعناصر التحكم.
 */
const Index = () => {
  // State for controlling the 'Create New' dialog visibility
  // حالة للتحكم في ظهور مربع حوار "إنشاء جديد"
  const [dialogOpen, setDialogOpen] = useState(false);

  // State for controlling the sidebar visibility
  // حالة للتحكم في ظهور الشريط الجانبي
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for button click animation
  // حالة لتحريك النقر على الزر
  const [btnAnimation, setBtnAnimation] = useState(false);

  // State to track if the photo grid is empty. Initialized to true.
  // This state *could* be used to control a placeholder, but we are removing the explicit placeholder in this component.
  // حالة لتتبع ما إذا كانت شبكة الصور فارغة. تبدأ بقيمة true.
  // هذه الحالة *يمكن* استخدامها للتحكم في صورة مؤقتة، لكننا نزيل الصورة المؤقتة الصريحة في هذا المكون.
  const [isGridEmpty, setIsGridEmpty] = useState(true); // Note: State remains, but associated JSX is removed. / ملاحظة: الحالة تبقى، لكن الـ JSX المرتبط بها تمت إزالته.

  // Authentication context hook
  // خطاف سياق المصادقة
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles opening the 'Create New' dialog and triggering button animation.
   * يعالج فتح مربع حوار "إنشاء جديد" وتشغيل تحريك الزر.
   */
  const handleCreateNew = () => {
    setBtnAnimation(true);
    setTimeout(() => setBtnAnimation(false), 300); // Reset animation after 300ms
    setDialogOpen(true); // Open the dialog
  };

  /**
   * Toggles the sidebar visibility.
   * يبدل ظهور الشريط الجانبي.
   */
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  /**
   * Effect to add/remove Escape key listener for closing the sidebar.
   * تأثير لإضافة/إزالة مستمع مفتاح Escape لإغلاق الشريط الجانبي.
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    // Add listener only if sidebar is open and document is available (client-side)
    // إضافة المستمع فقط إذا كان الشريط الجانبي مفتوحًا والمستند متاحًا (جانب العميل)
    if (sidebarOpen && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
    }
    // Cleanup function to remove the listener when the component unmounts or sidebar closes
    // دالة تنظيف لإزالة المستمع عند إلغاء تحميل المكون أو إغلاق الشريط الجانبي
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [sidebarOpen]); // Dependency array: re-run effect only if sidebarOpen changes

  /**
   * Callback function passed to PhotoGrid to update the grid's empty status.
   * This is still useful even without the explicit placeholder in this component,
   * as it might be used for other conditional logic in the future.
   * دالة رد نداء يتم تمريرها إلى PhotoGrid لتحديث حالة فراغ الشبكة.
   * لا تزال هذه مفيدة حتى بدون الصورة المؤقتة الصريحة في هذا المكون،
   * حيث قد تستخدم لمنطق شرطي آخر في المستقبل.
   * @param {boolean} isEmpty - True if the grid is empty, false otherwise.
   */
  const handleGridStatusChange = (isEmpty: boolean) => {
    console.log("Index: Grid empty status received from PhotoGrid:", isEmpty); // For debugging / للمعاينة
    setIsGridEmpty(isEmpty); // Update the state based on PhotoGrid's report / تحديث الحالة بناءً على تقرير PhotoGrid
  };

  return (
    // Provides heart sound context to children
    // يوفر سياق صوت القلب للأبناء
    <HeartSoundProvider>
      {/* Main container with background and text color */}
      {/* الحاوية الرئيسية مع لون الخلفية والنص */}
      <div className="min-h-screen bg-background text-foreground">

        {/* Sidebar Toggle Button (Top Right) */}
        {/* زر تبديل الشريط الجانبي (أعلى اليمين) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar" // Accessibility label / تسمية الوصولية
          className="fixed top-4 right-4 z-50 glass-effect text-gray-700" // Styling and positioning / تنسيق وتحديد الموضع
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* User Menu Dropdown (Top Left) */}
        {/* قائمة المستخدم المنسدلة (أعلى اليسار) */}
        <div className="fixed top-4 left-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Menu" className="glass-effect text-gray-700">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-effect text-gray-700 border border-border">
              {/* Display user email */}
              {/* عرض بريد المستخدم الإلكتروني */}
              <div className="px-2 py-1.5 text-sm font-medium text-white-300 truncate">{user?.email}</div>
              
              {/* Settings option */}
              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="cursor-pointer text-gray-600 focus:text-gray-800 focus:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              
              {/* Logout Button */}
              {/* زر تسجيل الخروج */}
              <DropdownMenuItem
                onClick={() => signOut?.()} // Call signOut from auth context
                className="text-red-500 focus:text-red-500 cursor-pointer focus:bg-gray-100"
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sidebar Panel */}
        {/* لوحة الشريط الجانبي */}
        <aside
          className={`fixed top-0 right-0 h-full bg-black/40 backdrop-blur-md border-l border-gray-800 w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "translate-x-full" // Conditional class for sliding animation / فئة شرطية لتحريك الانزلاق
          }`}
            aria-hidden={!sidebarOpen} // Accessibility: hide when closed / الوصولية: إخفاء عند الإغلاق
            role="complementary" // Accessibility role / دور الوصولية
        >
          {/* Sidebar content */}
          {/* محتوى الشريط الجانبي */}
          <div className="flex-1 p-6 pt-20 overflow-y-auto">
            <h3 className="text-gray-300 font-semibold mb-4 text-right">الألبومات</h3>
            {/* Container where PhotoGrid might inject album/hashtag buttons */}
            {/* الحاوية حيث قد يقوم PhotoGrid بإدخال أزرار الألبومات/الهاشتاجات */}
            <div id="hashtags-container" className="flex flex-col space-y-3 items-end">
              {/* PhotoGrid injects buttons here */}
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay (dims the background when sidebar is open) */}
        {/* تراكب الشريط الجانبي (يعتم الخلفية عند فتح الشريط الجانبي) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)} // Close sidebar on overlay click / إغلاق الشريط الجانبي عند النقر على التراكب
            aria-hidden="true" // Accessibility: purely decorative / الوصولية: زخرفي بحت
          />
        )}

        {/* Main Content Area */}
        {/* منطقة المحتوى الرئيسي */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
          <div className="text-center mb-8">
            {/* Logo */}
            {/* الشعار */}
            <div className="inline-block mb-6 w-40 h-40 sm:w-48 sm:h-48">
              <img
                src="/lovable-Uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png" // Logo source / مصدر الشعار
                alt="Logo" // Alt text / نص بديل
                className="w-full h-full object-contain animate-float" // Styling / تنسيق
                 onError={(e) => { // Fallback image in case the logo fails to load / صورة احتياطية في حال فشل تحميل الشعار
                   if (e.currentTarget instanceof HTMLImageElement) {
                       e.currentTarget.src = 'https://placehold.co/192x192/f1f5f9/94a3b8?text=Logo'; // Placeholder image URL / رابط صورة مؤقتة
                   }
                 }}
              />
            </div>
            {/* Description Text */}
            {/* نص الوصف */}
            <p className="text-lg text-white-300 max-w-2xl mx-auto mb-6">
              لحظاتك السعيدة، والنعم الجميلة في حياتك
            </p>
            {/* Main 'Add New' Button */}
            {/* زر "إضافة جديد" الرئيسي */}
            <div className="relative inline-block">
              <Button
                onClick={handleCreateNew}
                className={`relative px-5 py-3 bg-[#d94550] hover:bg-[#d94550]/90 text-white shadow-lg rounded-lg mx-auto transition-all duration-300 overflow-hidden ${
                  btnAnimation ? "scale-95 shadow-inner" : "hover:scale-105" // Conditional class for click animation / فئة شرطية لتحريك النقر
                }`}
              >
                <span className="relative z-10 flex items-center">
                  <Plus
                    className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                      btnAnimation ? "rotate-180" : "" // Conditional class for icon animation / فئة شرطية لتحريك الأيقونة
                    }`}
                  />
                  إضافة امتنان جديد
                </span>
                {/* Inner pulse animation element */}
                {/* عنصر تحريك النبض الداخلي */}
                <span
                  className="absolute inset-0 rounded-lg bg-[#b73842]/50 animate-inner-pulse z-0"
                  style={{ transformOrigin: "center" }}
                ></span>
              </Button>
            </div>
          </div>

          {/* --- Conditional Placeholder Image REMOVED --- */}
          {/* --- تم إزالة الصورة المؤقتة الشرطية --- */}
          {/* The block previously here that rendered `/EmptyCard.png` based on `isGridEmpty` has been removed as requested. */}
          {/* تم حذف الكتلة التي كانت هنا والتي تعرض `/EmptyCard.png` بناءً على `isGridEmpty` حسب الطلب. */}
          {/* {isGridEmpty && ( */}
          {/* <div className="text-center mt-10 mb-10 fade-in"> */}
          {/* <img */}
          {/* src="/EmptyCard.png" */}
          {/* alt="أضف أول امتنان لك" */}
          {/* className="mx-auto w-72 h-auto opacity-80 hover:opacity-100 transition-opacity" */}
          {/* /> */}
          {/* </div> */}
          {/* )} */}
          {/* --- End of REMOVED Placeholder Image --- */}
          {/* --- نهاية الصورة المؤقتة المحذوفة --- */}


          {/* Photo Grid Component */}
          {/* مكون شبكة الصور */}
          <PhotoGrid
            closeSidebar={() => setSidebarOpen(false)} // Prop to allow PhotoGrid to close the sidebar / خاصية للسماح لـ PhotoGrid بإغلاق الشريط الجانبي
            // Removed onStatusChange prop as it's not defined in PhotoGridProps
          />

          {/* Create New Dialog Component */}
          {/* مكون مربع حوار إنشاء جديد */}
          <CreateNewDialog
            open={dialogOpen} // Controls dialog visibility / يتحكم في ظهور مربع الحوار
            onOpenChange={setDialogOpen} // Function to update dialog visibility state / دالة لتحديث حالة ظهور مربع الحوار
            onPhotoAdded={() => { // Callback triggered after a photo is successfully added in the dialog / دالة رد نداء تُشغل بعد إضافة صورة بنجاح في مربع الحوار
              // 1. Dispatch an event that PhotoGrid might listen to, to trigger a refresh
              // 1. إرسال حدث قد يستمع إليه PhotoGrid لتشغيل تحديث
              console.log("Index: Dispatching photo-added event..."); // للمعاينة
              if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent("photo-added"));
              }
              // 2. Update the state (though it no longer controls the explicit placeholder here)
              // 2. تحديث الحالة (مع أنها لم تعد تتحكم في الصورة المؤقتة الصريحة هنا)
              console.log("Index: Setting grid to not empty."); // للمعاينة
              setIsGridEmpty(false); // Assume grid is no longer empty / افتراض أن الشبكة لم تعد فارغة
            }}
          />

          {/* Floating Action Button (Bottom Left) */}
          {/* زر الإجراء العائم (أسفل اليسار) */}
          <div className="fixed bottom-6 left-6 z-20">
            {/* Pulse animation effect */}
            {/* تأثير تحريك النبض */}
            <div className="absolute inset-[-4px] rounded-full bg-pink-500/10 animate-pulse-slow"></div>
            {/* The actual button */}
            {/* الزر الفعلي */}
            <Button
              onClick={handleCreateNew} // Opens the 'Create New' dialog / يفتح مربع حوار "إنشاء جديد"
              variant="glass" // Custom variant (assuming defined elsewhere) / متغير مخصص (نفترض أنه معرف في مكان آخر)
              size="circle" // Circular button / زر دائري
              aria-label="إضافة امتنان جديد" // Accessibility label / تسمية الوصولية
              className="w-14 h-14 shadow-lg relative rounded-full" // Styling / تنسيق
            >
              <Plus className="w-7 h-7 text-white/70" />
            </Button>
          </div>
        </main>
      </div>
    </HeartSoundProvider>
  );
};

// Export the component for use in other parts of the application
// تصدير المكون للاستخدام في أجزاء أخرى من التطبيق
export default Index;
