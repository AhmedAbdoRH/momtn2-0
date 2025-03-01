
import { useEffect } from 'react';
import { useSpaces } from './SpaceContext';
import SpaceCard from './SpaceCard';
import { useAuth } from '@/components/AuthProvider';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpacesListProps {
  onCreateNew: () => void;
}

const SpacesList = ({ onCreateNew }: SpacesListProps) => {
  const { spaces, myOwnedSpaces, myMemberSpaces, loading, fetchSpaces } = useSpaces();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-2">لا توجد مساحات مشتركة</h3>
        <p className="text-gray-400 mb-6">أنشئ مساحة مشتركة جديدة وابدأ بدعوة الأعضاء إليها</p>
        <Button 
          onClick={onCreateNew}
          className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          إنشاء مساحة مشتركة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {myOwnedSpaces.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 text-right">المساحات التي أملكها</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOwnedSpaces.map(space => (
              <SpaceCard key={space.id} space={space} isOwner={true} />
            ))}
          </div>
        </div>
      )}

      {myMemberSpaces.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 text-right">المساحات التي أنا عضو فيها</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myMemberSpaces.map(space => (
              <SpaceCard key={space.id} space={space} isOwner={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacesList;
