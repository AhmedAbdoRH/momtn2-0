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
    // Replace with your actual APK download link
    window.open('https://your-apk-download-link.com/app.apk', '_blank');
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-indigo-950/95 via-purple-900/95 to-violet-900/95 border-white/20 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
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
            className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white flex items-center justify-center gap-3 rounded-xl"
          >
            <Smartphone className="w-6 h-6" />
            <span className="text-lg">تحميل من Google Play</span>
          </Button>

          {/* APK Download */}
          <Button
            onClick={handleAPKDownload}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white flex items-center justify-center gap-3 rounded-xl"
          >
            <Download className="w-6 h-6" />
            <span className="text-lg">تحميل ملف APK</span>
          </Button>

          {/* Continue to Web */}
          <Button
            onClick={handleContinueToWeb}
            variant="outline"
            className="w-full h-14 border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-3 rounded-xl"
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
