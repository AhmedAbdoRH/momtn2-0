import * as React from 'react'; // Import React
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal
import { Plus, Menu, LogOut, User } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid"; // افترض وجود هذا المكون
import { Button } from "@/components/ui/button"; // افترض وجود هذا المكون
import CreateNewDialog from "@/components/CreateNewDialog"; // افترض وجود هذا المكون
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider"; // افترض وجود هذا المزود
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // افترض وجود هذا المكون
import { HeartSoundProvider } from "@/components/HeartSound"; // افترض وجود هذا المزود

// --- مكونات وهمية للاعتمادات المفترضة ---
// قم بإزالة هذه إذا كانت لديك المكونات الفعلية

// Mock Button component if not imported
const MockButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }>(
    ({ className, variant, size, children, ...props }, ref) => (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
          variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
        } ${className || ''}`}
        {...props}
      >
        {children}
      </button>
    )
  );
MockButton.displayName = "MockButton";
const ActualButton = Button || MockButton; // Use real Button if available, else mock

const MockPhotoGrid = ({ closeSidebar }: { closeSidebar: () => void }) => {
    const container = typeof document !== 'undefined' ? document.getElementById('hashtags-container') : null;

    return (
      <div data-testid="photo-grid" className="bg-gray-200 p-4 rounded min-h-[300px] text-gray-700">
        <p>Photo Grid Placeholder</p>
        <p>الألبومات/الهاشتاجات ستظهر هنا.</p>
        <p>سيتم حقن أزرار الألبومات في الشريط الجانبي.</p>
        {/* محاكاة زر في الشريط الجانبي */}
        {container && (
            <React.Fragment>
                {ReactDOM.createPortal(
                    <button onClick={closeSidebar} className="text-right w-full p-2 rounded hover:bg-gray-700 text-gray-300 transition-colors duration-150 ease-in-out">#الكل</button>,
                    container
                )}
                {ReactDOM.createPortal(
                    <button onClick={closeSidebar} className="text-right w-full p-2 rounded hover:bg-gray-700 text-gray-300 transition-colors duration-150 ease-in-out">#ذكريات</button>,
                    container
                )}
                {ReactDOM.createPortal(
                    <button onClick={closeSidebar} className="text-right w-full p-2 rounded hover:bg-gray-700 text-gray-300 transition-colors duration-150 ease-in-out">#نعم_الله</button>,
                    container
                )}
                 {/* إضافة المزيد لمحاكاة التمرير */}
                 {[...Array(15)].map((_, i) => ReactDOM.createPortal(
                    <button key={i} onClick={closeSidebar} className="text-right w-full p-2 rounded hover:bg-gray-700 text-gray-300 transition-colors duration-150 ease-in-out">#ألبوم_{i + 1}</button>,
                    container
                ))}
            </React.Fragment>
        )}
      </div>
    );
};


const MockCreateNewDialog = ({ open, onOpenChange, onPhotoAdded }: { open: boolean; onOpenChange: (open: boolean) => void; onPhotoAdded: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-gray-800" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">إضافة امتنان جديد (وهمي)</h2>
        <p className="mb-6 text-gray-600">هذا مربع حوار وهمي لتمثيل وظيفة الإضافة.</p>
        <div className="flex justify-end gap-3">
          <ActualButton variant="outline" onClick={() => onOpenChange(false)}>إلغاء</ActualButton>
          <ActualButton onClick={() => { onPhotoAdded(); onOpenChange(false); }}>إضافة صورة (وهمي)</ActualButton>
        </div>
      </div>
    </div>
  );
};

// Mock AuthProvider if not available globally
const AuthContext = React.createContext<{ signOut: () => void; user: { email: string } | null } | null>(null);
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const mockSignOut = () => alert("تم تسجيل الخروج (وهمي)");
    const mockUser = { email: "user@example.com" };
    // Ensure context provides a default value or check before use
    return <AuthContext.Provider value={{ signOut: mockSignOut, user: mockUser }}>{children}</AuthContext.Provider>;
};
// Custom hook for auth context
const useAuthContext = () => {
    const context = React.useContext(AuthContext);
    // Provide a default mock implementation if context is null
    if (!context) {
        console.warn("AuthProvider context not found, using mock auth.");
        return { signOut: () => alert("تم تسجيل الخروج (وهمي)"), user: { email: "mock@example.com" } };
    }
    return context;
};
// Use the hook provided by the actual AuthProvider if available, otherwise use the local mock hook
const ActualUseAuth = useAuth || useAuthContext;


const MockHeartSoundProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>; // مزود وهمي بسيط

// --- نهاية المكونات الوهمية ---


const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [btnAnimation, setBtnAnimation] = useState(false);
  const { signOut, user } = ActualUseAuth(); // استخدام المزود الوهمي أو الحقيقي

  // استبدال المكونات الحقيقية بالوهمية إذا لزم الأمر
  const ActualPhotoGrid = PhotoGrid || MockPhotoGrid;
  const ActualCreateNewDialog = CreateNewDialog || MockCreateNewDialog;
  const ActualHeartSoundProvider = HeartSoundProvider || MockHeartSoundProvider;
  const ActualDropdownMenu = DropdownMenu || React.Fragment; // Use Fragment if not available
  const ActualDropdownMenuTrigger = DropdownMenuTrigger || React.Fragment;
  const ActualDropdownMenuContent = DropdownMenuContent || React.Fragment;
  const ActualDropdownMenuItem = DropdownMenuItem || React.Fragment;


  const handleCreateNew = () => {
    setBtnAnimation(true);
    setTimeout(() => setBtnAnimation(false), 300); // مدة قصيرة للأنيميشن
    setDialogOpen(true);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // تأثير لإغلاق الشريط الجانبي عند الضغط على مفتاح الهروب (Esc)
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [sidebarOpen]);


  return (
    // استخدام مزود وهمي أو حقيقي
    <ActualHeartSoundProvider>
      {/* تأكد من وجود AuthProvider في مكان أعلى (مثل App.tsx) أو استخدم الوهمي هنا */}
      {/* <MockAuthProvider> */}
      <div className="min-h-screen bg-gray-50 text-gray-800"> {/* Updated background and text color */}
        {/* زر فتح/إغلاق الشريط الجانبي */}
        <ActualButton
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar" // Accessibility
          // استخدام glass-effect يتطلب تعريف CSS مخصص
          className="fixed top-4 right-4 z-50 text-gray-600 bg-white/50 backdrop-blur-md border border-gray-200/50 rounded-full hover:bg-white/70 focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all"
        >
          <Menu className="h-5 w-5" />
        </ActualButton>

        {/* قائمة المستخدم */}
        <div className="fixed top-4 left-4 z-50">
          <ActualDropdownMenu>
            <ActualDropdownMenuTrigger asChild>
              <ActualButton variant="ghost" size="icon" aria-label="User Menu" className="text-gray-600 bg-white/50 backdrop-blur-md border border-gray-200/50 rounded-full hover:bg-white/70 focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all">
                <User className="h-5 w-5" />
              </ActualButton>
            </ActualDropdownMenuTrigger>
            <ActualDropdownMenuContent
                align="start"
                // استخدام glass-effect يتطلب تعريف CSS مخصص
                className="w-56 bg-white/90 backdrop-blur-lg text-gray-700 border border-gray-200/60 rounded-lg shadow-lg mt-1"
            >
              <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-200/60 truncate">{user?.email ?? 'Loading...'}</div>
              <ActualDropdownMenuItem
                onClick={signOut}
                className="text-red-600 focus:text-red-700 cursor-pointer focus:bg-red-500/10 m-1 rounded hover:bg-red-500/5 focus:outline-none focus:ring-1 focus:ring-red-500" // تعديل الألوان والتركيز
              >
                <LogOut className="ml-2 h-4 w-4" /> {/* تبديل mr إلى ml للعربية */}
                <span>تسجيل الخروج</span>
              </ActualDropdownMenuItem>
            </ActualDropdownMenuContent>
          </ActualDropdownMenu>
        </div>

        {/* الشريط الجانبي المخصص */}
        <aside // Use aside for semantic sidebar
          // تحسين الأنماط والتأثيرات
          className={`fixed top-0 right-0 h-full bg-gray-800/90 backdrop-blur-lg border-l border-gray-700/50 w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col shadow-2xl ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!sidebarOpen} // لإمكانية الوصول
          role="complementary" // Accessibility role
        >
          {/* **** التعديل هنا: إضافة overflow-y-auto للسماح بالتمرير **** */}
          {/* Content Area of the Sidebar */}
          <div className="flex-1 pt-20 overflow-y-auto"> {/* Removed p-6, added padding to inner elements */}
            <h3 className="text-gray-200 font-semibold mb-4 text-right text-lg border-b border-gray-700 pb-2 px-6">الألبومات</h3>
            {/* حاوية الألبومات/الهاشتاجات */}
            {/* Added padding here */}
            <div id="hashtags-container" className="flex flex-col space-y-1 items-end mt-4 px-4 pb-6">
              {/* هنا سيقوم PhotoGrid بإدخال الأزرار عبر createPortal */}
              {/* مثال لعناصر إذا لم يتم استخدام createPortal */}
              {/* <button className="text-right w-full p-2 rounded hover:bg-gray-700 text-gray-300">#الكل</button> */}
              {/* <button className="text-right w-full p-2 rounded hover:bg-gray-700 text-gray-300">#ذكريات</button> */}
              {/* <button className="text-right w-full p-2 rounded hover:bg-gray-700 text-gray-300">#نعم_الله</button> */}
            </div>
          </div>
        </aside>

        {/* طبقة التعتيم عند فتح الشريط الجانبي */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out" // Slightly darker overlay
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true" // لإمكانية الوصول
          />
        )}

        {/* المحتوى الرئيسي */}
        {/* تأكد من أن المحتوى لا يتداخل مع الشريط الجانبي الثابت */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24"> {/* زيادة الـ padding العلوي أكثر */}
          <div className="text-center mb-16"> {/* زيادة الهامش السفلي */}
            <div className="inline-block mb-8 w-40 h-40 sm:w-48 sm:h-48"> {/* Increased margin */}
              <img
                src="/lovable-Uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png"
                alt="Logo"
                className="w-full h-full object-contain animate-float" // تأكد من تعريف انيميشن float
                // إضافة fallback بسيط في حالة عدم تحميل الصورة
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/192x192/f1f5f9/94a3b8?text=Logo')} // Updated placeholder colors
              />
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10"> {/* تعديل لون النص والهامش والحجم */}
              .. لحظاتك السعيدة، والنعم الجميلة في حياتك ..
            </p>

            <div className="relative inline-block">
              <ActualButton
                onClick={handleCreateNew}
                // تحسين أنماط الزر
                className={`relative px-8 py-3 bg-gradient-to-r from-[#e84a5f] to-[#d94550] hover:from-[#d94550] hover:to-[#c13c46] text-white text-base font-semibold shadow-lg rounded-full mx-auto transition-all duration-200 ease-in-out overflow-hidden transform active:scale-95 ${ // Rounded-full and gradient
                  btnAnimation ? "scale-95 shadow-inner brightness-90" : "hover:scale-105 hover:shadow-xl"
                }`}
              >
                <span className="relative z-10 flex items-center">
                  <Plus
                    className={`w-5 h-5 ml-2 transition-transform duration-300 ${ // تبديل mr إلى ml للعربية
                      btnAnimation ? "rotate-90 scale-110" : "" // Changed animation
                    }`}
                  />
                  إضافة امتنان جديد
                </span>
                {/* طبقة النبض الداخلي (اختياري) */}
                {/* <span
                  className="absolute inset-0 rounded-full bg-white/20 animate-ping z-0" // Changed pulse effect
                  style={{ animationDuration: '1.5s' }}
                ></span> */}
              </ActualButton>
            </div>
          </div>

          {/* استخدام المكون الحقيقي أو الوهمي */}
          <ActualPhotoGrid closeSidebar={() => setSidebarOpen(false)} />

          {/* استخدام المكون الحقيقي أو الوهمي */}
          <ActualCreateNewDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onPhotoAdded={() => {
              // طريقة أفضل لتحديث PhotoGrid قد تكون عبر رفع الحالة أو استخدام مكتبة إدارة حالة
              console.log("Photo added, triggering update...");
              // Consider using a state management library or context for robust updates
              window.dispatchEvent(new CustomEvent("photo-added"));
            }}
          />

          {/* زر الإضافة الدائري (Floating Action Button) */}
          <div className="fixed bottom-8 left-8 z-20 group"> {/* تعديل الموضع */}
            {/* تأثير النبض الخارجي */}
            <div className="absolute inset-[-6px] rounded-full bg-pink-500/20 animate-pulse-slow group-hover:scale-110 transition-transform duration-300"></div>
            <ActualButton
              onClick={handleCreateNew}
              aria-label="إضافة امتنان جديد" // Accessibility
              // استخدام variant مخصص أو تعديل الأنماط مباشرة
              size="icon" // استخدام حجم icon
              className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-xl relative transition-transform duration-200 transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-4 focus:ring-pink-500/50"
            >
              <Plus className="w-8 h-8" />
            </ActualButton>
          </div>
        </main>
      </div>
      {/* </MockAuthProvider> */}
    </ActualHeartSoundProvider>
  );
};

export default Index;

/* أضف هذا الـ CSS إلى ملف CSS العام الخاص بك إذا لم يكن موجودًا */
/*
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); } /* Increased float height */
/* 100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite; /* Slower animation */
/*}

@keyframes pulse-slow {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.2; } /* Adjusted scale and opacity */
/* 100% { transform: scale(1); opacity: 0.5; }
}
.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; /* Slower pulse */
/*}

/* Ensure Tailwind base styles are included for CSS variables like --background, --foreground etc. */
/* Add this if you don't have a global CSS setup */
/*
body {
  background-color: var(--background, #f9fafb); /* Default background */
/* color: var(--foreground, #1f2937); /* Default text color */
/*}

/* Define CSS variables if not using Tailwind config */
/*
:root {
    --background: #f9fafb; /* gray-50 */
/* --foreground: #1f2937; /* gray-800 */
/* --border: #e5e7eb; /* gray-200 */
/* --input: #d1d5db; /* gray-300 */
/* --ring: #fb7185; /* pink-500 */
/* --primary: #f43f5e; /* rose-500 */
/* --primary-foreground: #ffffff;
    --secondary: #e5e7eb; /* gray-200 */
/* --secondary-foreground: #111827; /* gray-900 */
/* --accent: #fce7f3; /* pink-100 */
/* --accent-foreground: #be185d; /* pink-700 */
/* --muted: #f3f4f6; /* gray-100 */
/* --muted-foreground: #6b7280; /* gray-500 */
/* --popover: #ffffff;
    --popover-foreground: #1f2937; /* gray-800 */
/*}

*/
```

هذا هو الكود الكامل للملف كما هو موجود في المستند الحالي، بما في ذلك التعديل اللازم لتمكين التمرير في الشريط الجانبي المخصص لد
