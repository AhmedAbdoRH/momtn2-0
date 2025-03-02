
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpaces } from './SpaceContext';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  spaceName: string;
  onInviteSuccess?: () => void; // Optional callback for success
}

const InviteMemberDialog = ({ open, onOpenChange, spaceId, spaceName, onInviteSuccess }: InviteMemberDialogProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { inviteMember } = useSpaces();
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !isValidEmail(email)) {
      toast({
        title: "بريد إلكتروني غير صالح",
        description: "الرجاء إدخال عنوان بريد إلكتروني صالح",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await inviteMember(spaceId, email);
      if (result.success) {
        setEmail('');
        onOpenChange(false);
        // Call the success callback if provided
        if (onInviteSuccess) {
          onInviteSuccess();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-white">دعوة أعضاء إلى "{spaceName}"</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="member-email" className="block text-sm font-medium mb-2 text-right">
              البريد الإلكتروني
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="أدخل البريد الإلكتروني للعضو..."
              dir="rtl"
            />
          </div>
          
          <div className="text-sm text-gray-400 text-right">
            <p>سيتم إرسال دعوة إلى هذا البريد الإلكتروني للانضمام إلى المساحة المشتركة.</p>
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
                  جاري الإرسال...
                </span>
              ) : (
                'إرسال الدعوة'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
