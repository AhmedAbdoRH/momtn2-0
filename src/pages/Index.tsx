
import { Camera, Plus } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import { Button } from "@/components/ui/button";

const Index = () => {
  const handleCreateNew = () => {
    // TODO: Implement create new functionality
    console.log("Create new clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-soft-gray">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-soft-pink rounded-full mb-6 animate-float">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Photo Gratitude
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Capture and celebrate moments of gratitude through beautiful photographs. Share what makes your heart full.
          </p>
          <Button 
            onClick={handleCreateNew}
            className="bg-soft-pink hover:bg-soft-pink/90 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            إنشاء جديد
          </Button>
        </div>

        <PhotoGrid />
      </main>
    </div>
  );
};

export default Index;
