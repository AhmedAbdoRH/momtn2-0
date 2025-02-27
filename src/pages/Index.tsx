
import { Plus, Menu } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import { Button } from "@/components/ui/button";
import CreateNewDialog from "@/components/CreateNewDialog";
import { useState } from "react";

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCreateNew = () => {
    setDialogOpen(true);
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

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-800/90 backdrop-blur-md w-72 transform transition-transform duration-300 ease-in-out z-40 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex-1 p-6 pt-20">
          <h3 className="text-white font-semibold mb-4 text-right">الهاشتاجات</h3>
          <div className="flex flex-col space-y-3 items-end" id="hashtags-container">
            {/* Hashtags will be rendered here by PhotoGrid component */}
          </div>
        </div>
        <div className="p-4 text-center text-white/50 text-sm border-t border-white/10 backdrop-blur-sm">
          الإصدار 0.9
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
        </div>

        <PhotoGrid />
        <CreateNewDialog open={dialogOpen} onOpenChange={setDialogOpen} />

        {/* Floating Action Button - Fixed position */}
        <Button
          onClick={handleCreateNew}
          className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white shadow-lg"
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
