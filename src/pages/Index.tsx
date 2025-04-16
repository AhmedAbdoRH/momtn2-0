import * as React from 'react'; // Import React
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal if PhotoGrid uses it
import { Plus, Menu, LogOut, User } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid"; // Using original component import
import { Button } from "@/components/ui/button"; // Using original component import
import CreateNewDialog from "@/components/CreateNewDialog"; // Using original component import
import { useState, useEffect } from "react"; // Import useEffect
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
  const [isGridEmpty, setIsGridEmpty] = useState(true); // Start assuming it's empty
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
    if (sidebarOpen && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [sidebarOpen]);

  // Callback function for PhotoGrid to update the grid status
  const handleGridStatusChange = (isEmpty: boolean) => {
    console.log("Grid empty status received:", isEmpty); // For debugging
    setIsGridEmpty(isEmpty);
  };

  return (
    <HeartSoundProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="fixed top-4 right-4 z-50 glass-effect text-gray-700"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <div className="fixed top-4 left-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Menu" className="glass-effect text-gray-700">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-effect text-gray-700 border border-border">
              <div className="px-2 py-1.5 text-sm font-medium text-white-300 truncate">{user?.email}</div>
              <DropdownMenuItem
                onClick={() => signOut?.()}
                className="text-red-500 focus:text-red-500 cursor-pointer focus:bg-gray-100"
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sidebar */}
        <aside
          className={`fixed top-0 right-0 h-full bg-black/40 backdrop-blur-md border-l border-gray-800 w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
            aria-hidden={!sidebarOpen}
            role="complementary"
        >
          <div className="flex-1 p-6 pt-20 overflow-y-auto">
            <h3 className="text-gray-300 font-semibold mb-4 text-right">الألبومات</h3>
            <div id="hashtags-container" className="flex flex-col space-y-3 items-end">
              {/* PhotoGrid injects buttons here */}
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="inline-block mb-6 w-40 h-40 sm:w-48 sm:h-48">
              <img
                src="/lovable-Uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png"
                alt="Logo"
                className="w-full h-full object-contain animate-float"
                 onError={(e) => {
                   if (e.currentTarget instanceof HTMLImageElement) {
                       e.currentTarget.src = 'https://placehold.co/192x192/f1f5f9/94a3b8?text=Logo';
                   }
                 }}
              />
            </div>
            {/* Description Text */}
            <p className="text-lg text-white-300 max-w-2xl mx-auto mb-6">
              لحظاتك السعيدة، والنعم الجميلة في حياتك
            </p>
            {/* Main Add Button */}
            <div className="relative inline-block">
              <Button
                onClick={handleCreateNew}
                className={`relative px-5 py-3 bg-[#d94550] hover:bg-[#d94550]/90 text-white shadow-lg rounded-lg mx-auto transition-all duration-300 overflow-hidden ${
                  btnAnimation ? "scale-95 shadow-inner" : "hover:scale-105"
                }`}
              >
                <span className="relative z-10 flex items-center">
                  <Plus
                    className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                      btnAnimation ? "rotate-180" : ""
                    }`}
                  />
                  إضافة امتنان جديد
                </span>
                <span
                  className="absolute inset-0 rounded-lg bg-[#b73842]/50 animate-inner-pulse z-0"
                  style={{ transformOrigin: "center" }}
                ></span>
              </Button>
            </div>
          </div>

          {/* **** تم حذف النص التوضيحي من هنا **** */}
          {/* Placeholder Image - Render only if grid is empty */}
          {isGridEmpty && (
            <div className="text-center mt-10 mb-10 fade-in">
              <img
                src="/EmptyCard.png"
                alt="أضف أول امتنان لك"
                className="mx-auto w-72 h-auto opacity-80 hover:opacity-100 transition-opacity"
              />
              {/* **** <p> tag removed **** */}
            </div>
          )}

          {/* Photo Grid */}
          <PhotoGrid
            closeSidebar={() => setSidebarOpen(false)}
            onStatusChange={handleGridStatusChange} // Pass the callback
          />

          {/* Create New Dialog */}
          <CreateNewDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onPhotoAdded={() => {
              // Trigger photo grid update
              console.log("Attempting to trigger photo update...");
              if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent("photo-added"));
              }
              // **** تعديل: إخفاء الصورة التوجيهية فوراً (تحديث تفاؤلي) ****
              // **** Modification: Hide placeholder immediately (optimistic update) ****
              console.log("Optimistically setting grid to not empty.");
              setIsGridEmpty(false);
            }}
          />

          {/* Floating Action Button */}
          <div className="fixed bottom-6 left-6 z-20">
            <div className="absolute inset-[-4px] rounded-full bg-pink-500/10 animate-pulse-slow"></div>
            <Button
              onClick={handleCreateNew}
              variant="glass"
              size="circle"
              aria-label="| إضافة امتنان جديد"
              className="w-14 h-14 shadow-lg relative rounded-full"
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
