
import { Plus, Menu, LogOut, User, Users } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import { Button } from "@/components/ui/button";
import CreateNewDialog from "@/components/CreateNewDialog";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [btnAnimation, setBtnAnimation] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleCreateNew = () => {
    setBtnAnimation(true);
    setTimeout(() => setBtnAnimation(false), 300);
    setDialogOpen(true);
  };

  const goToSharedSpaces = () => {
    navigate('/spaces');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] animate-gradient">
      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* User dropdown */}
      <div className="fixed top-4 left-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-gray-900/60 backdrop-blur-xl text-white border-gray-800">
            <div className="px-2 py-1.5 text-sm font-medium text-gray-200 truncate">
              {user?.email}
            </div>
            <DropdownMenuItem 
              onClick={goToSharedSpaces}
              className="cursor-pointer focus:bg-gray-800/80"
            >
              <Users className="mr-2 h-4 w-4" />
              <span>المساحات المشتركة</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={signOut}
              className="text-red-400 focus:text-red-400 cursor-pointer focus:bg-gray-800/80"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-800/70 backdrop-blur-md w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex-1 p-6 pt-20">
          <h3 className="text-white font-semibold mb-4 text-right">الهاشتاجات</h3>
          <div className="flex flex-col space-y-3 items-end" id="hashtags-container">
            {/* Hashtags will be rendered here by PhotoGrid component */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-block mb-6 w-40 h-40 sm:w-48 sm:h-48">
            <img 
              src="/lovable-uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png" 
              alt="Logo"
              className="w-full h-full object-contain animate-float"
            />
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
            ﴾ يَا أَيُّهَا النَّاسُ اذْكُرُوا نِعْمَتَ اللَّهِ عَلَيْكُمْ ﴿ 
          </p>
          
          {/* Add New Gratitude Button in the center */}
          <Button
            onClick={handleCreateNew}
            className={`px-5 py-3 bg-[#ea384c] hover:bg-[#ea384c]/90 text-white shadow-lg rounded-lg mx-auto transition-transform duration-300 ${
              btnAnimation ? 'scale-95' : ''
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            إضافة امتنان جديد
          </Button>
          
          <div className="mt-4">
            <Button
              onClick={goToSharedSpaces}
              variant="outline"
              className="bg-transparent border-gray-700 text-white hover:bg-white/10"
            >
              <Users className="w-5 h-5 mr-2" />
              المساحات المشتركة
            </Button>
          </div>
        </div>

        <PhotoGrid />
        <CreateNewDialog open={dialogOpen} onOpenChange={setDialogOpen} />

        {/* Floating Action Button - Fixed position */}
        <Button
          onClick={handleCreateNew}
          className={`fixed bottom-6 left-6 w-14 h-14 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white shadow-lg transition-transform duration-300 ${
            btnAnimation ? 'scale-95' : ''
          }`}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </main>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;
