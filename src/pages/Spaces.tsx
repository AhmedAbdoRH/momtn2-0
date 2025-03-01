
import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpacesList from '@/components/spaces/SpacesList';
import CreateSpaceDialog from '@/components/spaces/CreateSpaceDialog';
import { SpaceProvider } from '@/components/spaces/SpaceContext';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';

const Spaces = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <SpaceProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] animate-gradient">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header with Create Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Link to="/" className="text-gray-400 hover:text-white">
                  <span className="sr-only">الرئيسية</span>
                  <ChevronRight className="w-5 h-5 transform rotate-180" />
                </Link>
                <h1 className="text-2xl font-bold text-white mr-2">المساحات المشتركة</h1>
              </div>
              <p className="text-gray-400">أنشئ وشارك المساحات مع العائلة والأصدقاء</p>
            </div>
            
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4 md:mt-0 bg-[#ea384c] hover:bg-[#ea384c]/90 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              إنشاء مساحة جديدة
            </Button>
          </div>
          
          {/* Spaces List */}
          <SpacesList onCreateNew={() => setCreateDialogOpen(true)} />
          
          {/* Create Space Dialog */}
          <CreateSpaceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </main>
      </div>
    </SpaceProvider>
  );
};

export default Spaces;
