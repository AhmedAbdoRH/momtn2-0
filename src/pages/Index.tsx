
import { Camera, Plus } from "lucide-react";
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
    <div className="min-h-screen bg-[#1A1F2C]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-pink-500/20 rounded-full mb-6 animate-float">
            <Camera className="w-6 h-6 text-pink-200" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Photo Gallery
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Share your favorite moments with the world
          </p>
          <Button 
            onClick={handleCreateNew}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            إضافة صورة جديدة
          </Button>
        </div>

        <PhotoGrid />
        <CreateNewDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </main>
    </div>
  );
};

export default Index;

