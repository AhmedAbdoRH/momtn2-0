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
    <div className="min-h-screen animate-gradient">
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
          <Button 
            onClick={handleCreateNew}
            className="bg-[#ff535f] hover:bg-[#e04a56] text-white"
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

/* إضافة تأثير تدرج متحرك دائم وقوي داخل Tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: linear-gradient(45deg, #1A1F2C, #2D1F3D, #3D1F2C, #ff535f);
    --background-size: 400% 400%;
  }

  body {
    @apply bg-background text-foreground antialiased;
  }

  img {
    @apply select-none;
  }
}

@layer utilities {
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-gradient {
    background: var(--background);
    background-size: var(--background-size);
    animation: gradientAnimation 6s linear infinite;
  }
}
