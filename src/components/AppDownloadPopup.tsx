import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Globe, Feather, Users, HeartHandshake, Zap, CalendarHeart } from 'lucide-react';

interface AppDownloadPopupProps {
  onContinueToWeb: () => void;
  forceShow?: boolean;
}

const features = [
  {
    icon: Feather,
    title: 'دوّن امتنانك',
    description: 'مساحة خاصة وهادئة لتدوين اللحظات والأشياء التي تشعر بالامتنان لها',
  },
  {
    icon: Users,
    title: 'مساحات مشتركة للأحبة',
    description: 'أنشئ مجموعاتك الخاصة مع العائلة أو الأصدقاء لمشاركة لحظاتكم السعيدة',
  },
  {
    icon: HeartHandshake,
    title: 'تفاعل بصدق',
    description: 'شارك أحباءك لحظاتهم بتفاعلات وتعليقات تبني روابط إنسانية أعمق',
  },
  {
    icon: Zap,
    title: 'تواصل مباشر',
    description: 'محادثات فورية وسريعة للتواصل المباشر مع أعضاء مجموعاتك',
  },
  {
    icon: CalendarHeart,
    title: 'يلا سوا',
    description: 'حوّل الامتنان إلى واقع؛ خطط للقاءات حقيقية واصنعوا ذكريات تستحق التدوين',
  },
];

const AppDownloadPopup = ({ onContinueToWeb, forceShow = false }: AppDownloadPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }
    const hasChosenPlatform = localStorage.getItem('app_platform_choice');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!hasChosenPlatform && !isStandalone) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleAPKDownload = () => {
    window.open('https://drive.google.com/drive/folders/1ka58Yn9iUKkz9ax5tltTaQ2xtOUgnE3Z', '_blank');
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2D1F3D]/95 via-[#1A1F2C]/95 to-[#3D1F2C]/95 border-white/20 text-white backdrop-blur-xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <img 
              src="/lovable-uploads/99ddbd0a-3c24-4138-92e9-2ed2b73e0681.png" 
              alt="ممتن" 
              className="w-12 h-12 rounded-xl"
            />
          </div>
          <DialogTitle className="text-2xl text-white">مرحباً بك في ممتن</DialogTitle>
          <DialogDescription className="text-white/70">
            اكتشف مميزات التطبيق
          </DialogDescription>
        </DialogHeader>

        {/* Features */}
        <div className="flex flex-col gap-2.5 mt-2" dir="rtl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="shrink-0 w-9 h-9 rounded-lg bg-[#d94550]/20 flex items-center justify-center mt-0.5">
                <feature.icon className="w-4.5 h-4.5 text-[#d94550]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white leading-tight">{feature.title}</h4>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col gap-3 mt-3">
          <Button
            onClick={handleAPKDownload}
            className="w-full h-14 bg-gradient-to-r from-[#d94550] to-[#c73e48] hover:from-[#c73e48] hover:to-[#b5363f] text-white flex items-center justify-center gap-3 rounded-xl shadow-lg"
          >
            <Download className="w-6 h-6" />
            <span className="text-lg">تحميل التطبيق APK</span>
          </Button>

          <Button
            onClick={handleContinueToWeb}
            variant="outline"
            className="w-full h-14 border-white/30 bg-gray-800/50 hover:bg-gray-700/50 text-white flex items-center justify-center gap-3 rounded-xl"
          >
            <Globe className="w-6 h-6" />
            <span className="text-lg">المتابعة إلى تطبيق الويب</span>
          </Button>
        </div>

        <p className="text-center text-white/50 text-sm mt-2">
          يمكنك تغيير اختيارك لاحقاً من الإعدادات
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AppDownloadPopup;
