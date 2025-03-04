
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpaces } from './SpaceContext';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  spaceName: string;
  onInviteSuccess?: () => void;
}

const InviteMemberDialog = ({ open, onOpenChange, spaceId, spaceName, onInviteSuccess }: InviteMemberDialogProps) => {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generateInviteLink } = useSpaces();
  const { toast } = useToast();

  useEffect(() => {
    if (open && spaceId) {
      generateLinkForSpace();
    }
  }, [open, spaceId]);

  const generateLinkForSpace = async () => {
    setLoading(true);
    try {
      const result = await generateInviteLink(spaceId);
      if (result.success && result.inviteUrl) {
        setInviteLink(result.inviteUrl);
      } else {
        throw new Error(result.message || "فشل في إنشاء رابط الدعوة");
      }
    } catch (error: any) {
      console.error("Error generating invite link:", error);
      toast({
        title: "خطأ في إنشاء رابط الدعوة",
        description: error.message || "حدث خطأ أثناء محاولة إنشاء رابط الدعوة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الدعوة إلى الحافظة",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "فشل النسخ",
        description: "لم نتمكن من نسخ الرابط. يرجى نسخه يدويًا.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-white">دعوة أعضاء إلى "{spaceName}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 mb-2 text-right">يمكن لأي شخص لديه هذا الرابط الانضمام مباشرة إلى هذه المساحة المشتركة:</p>
            <div className="flex items-center gap-2 bg-white/10 p-3 rounded-md">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="w-full bg-transparent border-none focus:outline-none text-white text-sm font-mono"
                dir="ltr"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="flex-shrink-0 hover:bg-white/10"
                onClick={copyLinkToClipboard}
                disabled={!inviteLink || loading}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-300" />}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-400 text-right">
            <p>سيتمكن أي شخص لديه هذا الرابط من الانضمام إلى المساحة المشتركة.</p>
            <p className="mt-1">تأكد من مشاركته فقط مع الأشخاص الذين تريدهم في المساحة المشتركة.</p>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800"
            >
              إغلاق
            </Button>
            <Button
              type="button"
              className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
              onClick={copyLinkToClipboard}
              disabled={!inviteLink || loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التحميل...
                </span>
              ) : (
                'نسخ رابط الدعوة'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
