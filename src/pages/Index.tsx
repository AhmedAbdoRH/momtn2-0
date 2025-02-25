
import { Plus } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import { Button } from "@/components/ui/button";
import CreateNewDialog from "@/components/CreateNewDialog";
import { useState } from "react";

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateNew = () => {
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] animate-gradient">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-block mb-8 w-40 h-40 sm:w-48 sm:h-48">
            <img 
              src="/lovable-uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png" 
              alt="Logo"
              className="w-full h-full object-contain animate-float"
            />
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
             ﴾ يَا أَيُّهَا النَّاسُ اذْكُرُوا نِعْمَتَ اللَّهِ عَلَيْكُمْ ﴿ 
          </p>
        </div>

        <PhotoGrid />
        <CreateNewDialog open={dialogOpen} onOpenChange={setDialogOpen} />

        {/* Floating Action Button */}
        <Button
          onClick={handleCreateNew}
          className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-[#ff535f] hover:bg-[#e04a56] text-white shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </main>
    </div>
  );
};

export default Index;
