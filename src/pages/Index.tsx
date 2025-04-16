import * as React from 'react'; // Import React
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal if PhotoGrid uses it
import { Plus, Menu, LogOut, User } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid"; // Using original component import
import { Button } from "@/components/ui/button"; // Using original component import
import CreateNewDialog from "@/components/CreateNewDialog"; // Using original component import
import { useState, useEffect } from "react"; // **** Import useEffect ****
import { useAuth } from "@/components/AuthProvider"; // Using original hook import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Using original component import
import { HeartSoundProvider } from "@/components/HeartSound"; // Using original provider import

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [btnAnimation, setBtnAnimation] = useState(false);
  // **** الحالة لتتبع ما إذا كانت الشبكة فارغة ****
  // **** State to track if the grid is empty ****
  const [isGridEmpty, setIsGridEmpty] = useState(true); // Start assuming it's empty
  // Using original useAuth hook
  const { signOut, user } = useAuth();

  const handleCreateNew = () => {
    setBtnAnimation(true);
    setTimeout(() => setBtnAnimation(false), 300);
    setDialogOpen(true);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Effect to close sidebar on Escape key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    // Ensure document is defined (client-side)
    if (sidebarOpen && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
    }
    // Cleanup function
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [sidebarOpen]);

  // **** دالة Callback لتحديث حالة الشبكة من PhotoGrid ****
  // **** Callback function for PhotoGrid to update the grid status ****
  const handleGridStatusChange = (isEmpty: boolean) => {
    console.log("Grid empty status received:", isEmpty); // For debugging
    setIsGridEmpty(isEmpty);
  };

  return (
    // Using original HeartSoundProvider
    <HeartSoundProvider>
      <div className="min-h-screen bg-background text-foreground"> {/* Ensure bg-background and text-foreground are defined in your Tailwind config */}
        {/* زر فتح/إغلاق الشريط الجانبي */}
        <Button // Using original Button component
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          // Ensure glass-effect is defined in your CSS
          className="fixed top-4 right-4 z-50 glass-effect text-gray-700"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* قائمة المستخدم */}
        <div className="fixed top-4 left-4 z-50">
          {/* Using original DropdownMenu components */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Menu" className="glass-effect text-gray-700">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-effect text-gray-700 border border-border"> {/* Ensure border-border is defined */}
              <div className="px-2 py-1.5 text-sm font-medium text-white-300 truncate">{user?.email}</div>
              <DropdownMenuItem
                onClick={() => signOut?.()} // Check if signOut is defined before calling
                className="text-red-500 focus:text-red-500 cursor-pointer focus:bg-gray-100"
              >
                <LogOut className="ml-2 h-4 w-4" /> {/* Use ml-2 for Arabic */}
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* الشريط الجانبي */}
        <aside // Using aside for semantic sidebar
          className={`fixed top-0 right-0 h-full bg-black/40 backdrop-blur-md border-l border-gray-800 w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
            aria-hidden={!sidebarOpen}
            role="complementary"
        >
          {/* **** التعديل الوحيد هنا: إضافة overflow-y-auto **** */}
          <div className="flex-1 p-6 pt-20 overflow-y-auto">
            <h3 className="text-gray-300 font-semibold mb-4 text-right">الألبومات</h3>
            {/* Container for albums/hashtags */}
            <div id="hashtags-container" className="flex flex-col space-y-3 items-end">
              {/* PhotoGrid will inject buttons here via createPortal */}
              {/* Example placeholder if needed for testing */}
              {/* <button className="text-right w-full p-2 rounded hover:bg-gray-700/50 text-gray-300">#Placeholder 1</button>
              <button className="text-right w-full p-2 rounded hover:bg-gray-700/50 text-gray-300">#Placeholder 2</button>
              {[...Array(20)].map((_, i) => (
                  <button key={i} className="text-right w-full p-2 rounded hover:bg-gray-700/50 text-gray-300">#ألبوم_وهمي_{i + 1}</button>
              ))} */}
            </div>
          </div>
        </aside>

        {/* طبقة التعتيم عند فتح الشريط الجانبي */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* المحتوى الرئيسي */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20"> {/* Added top padding */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6 w-40 h-40 sm:w-48 sm:h-48">
              <img
                src="/lovable-Uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png"
                alt="Logo"
                className="w-full h-full object-contain animate-float" // Ensure animate-float is defined in CSS
                 // Simple fallback
                 onError={(e) => {
                   if (e.currentTarget instanceof HTMLImageElement) {
                       e.currentTarget.src = 'https://placehold.co/192x192/f1f5f9/94a3b8?text=Logo';
                   }
                 }}
              />
            </div>
            {/* Ensure text-white-300 is a valid class or adjust */}
            <p className="text-lg text-white-300 max-w-2xl mx-auto mb-6"> {/* Changed text color */}
              لحظاتك السعيدة، والنعم الجميلة في حياتك
            </p>

            <div className="relative inline-block">
              <Button // Using original Button
                onClick={handleCreateNew}
                // Ensure color #d94550 is defined, e.g., in tailwind.config.js or use a Tailwind color class
                className={`relative px-5 py-3 bg-[#d94550] hover:bg-[#d94550]/90 text-white shadow-lg rounded-lg mx-auto transition-all duration-300 overflow-hidden ${
                  btnAnimation ? "scale-95 shadow-inner" : "hover:scale-105"
                }`}
              >
                <span className="relative z-10 flex items-center">
                  <Plus
                    className={`w-5 h-5 ml-2 transition-transform duration-300 ${ // Use ml-2 for Arabic
                      btnAnimation ? "rotate-180" : ""
                    }`}
                  />
                  إضافة امتنان جديد
                </span>
                {/* طبقة النبض الداخلي */}
                {/* Ensure color #b73842 and animate-inner-pulse are defined */}
                <span
                  className="absolute inset-0 rounded-lg bg-[#b73842]/50 animate-inner-pulse z-0"
                  style={{ transformOrigin: "center" }}
                ></span>
              </Button>
            </div>
          </div>

          {/* **** إضافة الصورة التوجيهية هنا، يتم عرضها فقط إذا كانت الشبكة فارغة **** */}
          {/* **** Add the placeholder image here, render only if grid is empty **** */}
          {isGridEmpty && (
            <div className="text-center mt-10 mb-10 fade-in"> {/* Added fade-in animation class (define in CSS) */}
              <img
                src="/EmptyCard.png" // Path to your image in the public folder
                alt="أضف أول امتنان لك" // Descriptive alt text
                className="mx-auto w-72 h-auto opacity-100 hover:opacity-100 transition-opacity" // Center, size, add some styling

            </div>
          )}

          {/* Using original PhotoGrid component */}
          {/* Pass closeSidebar function AND the new callback to PhotoGrid */}
          {/* **** تمرير الدالة للتحقق من حالة الشبكة **** */}
          <PhotoGrid
            closeSidebar={() => setSidebarOpen(false)}
            onStatusChange={handleGridStatusChange} // **** Pass the callback here ****
          />

          {/* Using original CreateNewDialog component */}
          <CreateNewDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onPhotoAdded={() => {
              // استدعاء إعادة تحميل الصور عندما تضاف صورة جديدة
              // Ensure this update mechanism works for PhotoGrid
              console.log("Attempting to trigger photo update...");
              if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent("photo-added"));
              }
              // **** Optionally, assume grid is no longer empty immediately ****
              // **** (PhotoGrid should ideally confirm this via onStatusChange) ****
              // setIsGridEmpty(false);
            }}
          />

          {/* زر الإضافة الدائري مع تأثير النبض */}
          {/* Ensure animate-pulse-slow and variant="glass" / size="circle" are defined */}
          <div className="fixed bottom-6 left-6 z-20"> {/* Adjusted position */}
            <div className="absolute inset-[-4px] rounded-full bg-pink-500/10 animate-pulse-slow"></div> {/* Adjusted pulse style */}
            <Button // Using original Button
              onClick={handleCreateNew}
              variant="glass" // Needs custom variant definition
              size="circle"   // Needs custom size definition
              aria-label="| إضافة امتنان جديد"
              className="w-14 h-14 shadow-lg relative rounded-full" // Added rounded-full
            >
              <Plus className="w-7 h-7 text-white/70" />
            </Button>
          </div>
        </main>
      </div>
    </HeartSoundProvider>
  );
};

export default Index;
