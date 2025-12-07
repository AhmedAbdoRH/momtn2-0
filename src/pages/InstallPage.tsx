import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Check, Share, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
            <img 
              src="/lovable-uploads/99ddbd0a-3c24-4138-92e9-2ed2b73e0681.png" 
              alt="ممتن" 
              className="w-16 h-16 rounded-xl"
            />
          </div>
          <CardTitle className="text-2xl">تثبيت تطبيق ممتن</CardTitle>
          <CardDescription className="text-white/70">
            قم بتثبيت التطبيق على جهازك للوصول السريع
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-lg">التطبيق مثبت بالفعل!</p>
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-white/20 hover:bg-white/30"
              >
                العودة للتطبيق
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <p className="text-center text-white/80 mb-4">
                لتثبيت التطبيق على جهاز iPhone أو iPad:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <Share className="w-4 h-4" />
                  </div>
                  <span>اضغط على زر المشاركة</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>اختر "إضافة إلى الشاشة الرئيسية"</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>اضغط على "إضافة"</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                العودة للتطبيق
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <Smartphone className="w-5 h-5" />
                <span>يمكنك تثبيت التطبيق والوصول إليه بدون إنترنت</span>
              </div>
              <Button 
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Download className="w-5 h-5 ml-2" />
                تثبيت التطبيق
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-white/70">
                افتح هذه الصفحة في متصفح Chrome أو Safari لتثبيت التطبيق
              </p>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                العودة للتطبيق
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPage;
