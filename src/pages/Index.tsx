// --->>> استخدم هذا الكود المحدث لملف المكون الرئيسي (Index.jsx) <<<---

import { Plus, Menu, LogOut, User } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import { Button } from "@/components/ui/button";
import CreateNewDialog from "@/components/CreateNewDialog";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeartSoundProvider } from "@/components/HeartSound";
import Logo from "@/components/ui/logo"; // ---<<< تم إعادة استيراد مكون اللوجو

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [btnAnimation, setBtnAnimation] = useState(false);
  const { signOut, user } = useAuth();
  const [photoGridKey, setPhotoGridKey] = useState(0);

  const handleCreateNew = () => {
    setBtnAnimation(true);
    setTimeout(() => setBtnAnimation(false), 300);
    setDialogOpen(true);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handlePhotoAdded = () => {
    setPhotoGridKey(prevKey => prevKey + 1);
  };

  return (
    <HeartSoundProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* زر فتح/إغلاق الشريط الجانبي */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 right-4 z-50 glass-effect text-gray-700" // [تحتاج مراجعة CSS ⚠️] تأكد من تعريف glass-effect
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* قائمة المستخدم */}
        <div className="fixed top-4 left-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="glass-effect text-gray-700"> {/* [تحتاج مراجعة CSS ⚠️] تأكد من تعريف glass-effect */}
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-effect text-gray-700 border border-border"> {/* [تحتاج مراجعة CSS ⚠️] تأكد من تعريف glass-effect */}
              <div className="px-2 py-1.5 text-sm font-medium text-gray-600 truncate">{user?.email}</div>
              <DropdownMenuItem
                onClick={signOut}
                className="text-red-500 focus:text-red-500 cursor-pointer focus:bg-gray-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* الشريط الجانبي */}
        <div
          className={`fixed top-0 right-0 h-full bg-black/30 backdrop-blur-md border-l border-gray-800 w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex-1 p-6 pt-20">
            <h3 className="text-gray-300 font-semibold mb-4 text-right">الألبومات</h3>
            <div id="hashtags-container" className="flex flex-col space-y-3 items-end">
              {/* [يتطلب مراجعة PhotoGrid 🔎] PhotoGrid يجب أن يستخدم createPortal هنا */}
            </div>
          </div>
        </div>

        {/* طبقة التعتيم عند فتح الشريط الجانبي */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* المحتوى الرئيسي */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
             {/* ---<<< تم العودة لاستخدام مكون Logo المستورد */}
            <div className="inline-block mb-6 w-40 h-40 sm:w-48 sm:h-48">
              <Logo className="w-full h-full object-contain animate-float" /> {/* [تحتاج مراجعة CSS ⚠️] تأكد من تعريف animate-float */}
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
              .. لحظاتك السعيدة، والنعم الجميلة في حياتك
            </p>

            <div className="relative inline-block">
              <Button
                onClick={handleCreateNew}
                className={`relative px-5 py-3 bg-[#d94550] hover:bg-[#d94550]/90 text-white shadow-lg rounded-lg mx-auto transition-all duration-300 overflow-hidden ${
                  btnAnimation ? "scale-95 shadow-inner" : "hover:scale-105"
                }`}
              >
                <span className="relative z-10 flex items-center">
                  <Plus
                    className={`w-5 h-5 mr-2 transition-transform duration-300 ${
                      btnAnimation ? "rotate-180" : ""
                    }`}
                  />
                  إضافة امتنان جديد
                </span>
                <span
                  className="absolute inset-0 rounded-lg bg-[#b73842]/50 animate-inner-pulse z-0" // [تحتاج مراجعة CSS ⚠️] تأكد من تعريف animate-inner-pulse
                  style={{ transformOrigin: "center" }}
                ></span>
              </Button>
            </div>
          </div>

          <PhotoGrid key={photoGridKey} closeSidebar={() => setSidebarOpen(false)} />

          <CreateNewDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onPhotoAdded={handlePhotoAdded}
          />

          {/* زر الإضافة الدائري مع تأثير النبض */}
          <div className="fixed bottom-6 left-6">
            <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-pulse-slow"></div> {/* [تحتاج مراجعة CSS ⚠️] تأكد من تعريف animate-pulse-slow */}
            <Button
              onClick={handleCreateNew}
              variant="glass" // [تحتاج مراجعة Button ⚠️] تأكد من تعريف variant="glass"
              size="circle" // [تحتاج مراجعة Button ⚠️] تأكد من تعريف size="circle"
              className="w-14 h-14 shadow-lg relative"
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

