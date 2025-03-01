
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpaces } from './SpaceContext';
import { useToast } from '@/hooks/use-toast';

interface CreateSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateSpaceDialog = ({ open, onOpenChange }: CreateSpaceDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { createSpace } = useSpaces();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "يجب إدخال اسم المساحة",
        description: "الرجاء إدخال اسم للمساحة المشتركة",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await createSpace(name, description);
      if (result) {
        setName('');
        setDescription('');
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-white">إنشاء مساحة مشتركة جديدة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="space-name" className="block text-sm font-medium mb-2 text-right">
              اسم المساحة
            </label>
            <input
              id="space-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="مثال: عائلتنا، مجموعة العمل، إلخ..."
              dir="rtl"
            />
          </div>
          
          <div>
            <label htmlFor="space-description" className="block text-sm font-medium mb-2 text-right">
              الوصف (اختياري)
            </label>
            <textarea
              id="space-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="وصف مختصر للمساحة المشتركة..."
              dir="rtl"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800"
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الإنشاء...
                </span>
              ) : (
                'إنشاء المساحة'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSpaceDialog;
