import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Globe, Smartphone } from 'lucide-react';

interface AppDownloadPopupProps {
  onContinueToWeb: () => void;
}

const AppDownloadPopup = ({ onContinueToWeb }: AppDownloadPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasChosenPlatform = localStorage.getItem('app_platform_choice');
    
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!hasChosenPlatform && !isStandalone) {
      setIsOpen(true);
    }
  }, []);

  const handleGooglePlay = () => {
    // Replace with your actual Google Play Store link
    window.open('https://play.google.com/store/apps/details?id=app.lovable.fbe0f561815444a49b10d5d0ee84e4da', '_blank');
    localStorage.setItem('app_platform_choice', 'google_play');
    setIsOpen(false);
  };

  const handleAPKDownload = () => {
    window.open('https://drive.google.com/drive/folders/1-0k0k0k0k0k0k0k0k0k0k0k0k0k0k0k0', '_blank');
    localStorage.setItem('app_platform_choice', 'apk');
    setIsOpen(false);
  };

  const handleContinueToWeb = () => {
    localStorage.setItem('app_platform_choice', 'web');
    setIsOpen(false);
    onContinueToWeb();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#2D1F3D]/95 via-[#1A1F2C]/95 to-[#3D1F2C]/95 border-white/20 text-white backdrop-blur-xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <img 
              src="/lovable-uploads/99ddbd0a-3c24-4138-92e9-2ed2b73e0681.png" 
              alt="ممتن" 
              className="w-16 h-16 rounded-xl"
            />
          </div>
          <DialogTitle className="text-2xl text-white">مرحباً بك في ممتن</DialogTitle>
          <DialogDescription className="text-white/70">
            اختر طريقة استخدام التطبيق
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          {/* Google Play Store */}
          <Button
            onClick={handleGooglePlay}
            className="w-full h-14 bg-gradient-to-r from-[#d94550] to-[#c73e48] hover:from-[#c73e48] hover:to-[#b5363f] text-white flex items-center justify-center gap-3 rounded-xl shadow-lg"
          >
            <Smartphone className="w-6 h-6" />
            <span className="text-lg">تحميل من Google Play</span>
          </Button>

          {/* APK Download */}
          <Button
            onClick={handleAPKDownload}
            className="w-full h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center gap-3 rounded-xl border border-white/20"
          >
            <Download className="w-6 h-6" />
            <span className="text-lg">تحميل ملف APK</span>
          </Button>

          {/* Continue to Web */}
          <Button
            onClick={handleContinueToWeb}
            variant="outline"
            className="w-full h-14 border-white/30 bg-gray-800/50 hover:bg-gray-700/50 text-white flex items-center justify-center gap-3 rounded-xl"
          >
            <Globe className="w-6 h-6" />
            <span className="text-lg">المتابعة إلى تطبيق الويب</span>
          </Button>
        </div>

        <p className="text-center text-white/50 text-sm mt-4">
          يمكنك تغيير اختيارك لاحقاً من الإعدادات
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AppDownloadPopup;
