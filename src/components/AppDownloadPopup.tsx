import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
'@/components/ui/dialog';
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
  description: 'مساحة خاصة وهادئة لتدوين اللحظات والأشياء التي تشعر بالامتنان لها'
},
{
  icon: Users,
  title: 'مساحات مشتركة للأحبة',
  description: 'أنشئ مجموعاتك الخاصة مع العائلة أو الأصدقاء لمشاركة لحظاتكم السعيدة'
},
{
  icon: HeartHandshake,
  title: 'تفاعل بصدق',
  description: 'شارك أحباءك لحظاتهم بتفاعلات وتعليقات تبني روابط إنسانية أعمق'
},
{
  icon: Zap,
  title: 'تواصل مباشر',
  description: 'محادثات فورية وسريعة للتواصل المباشر مع أعضاء مجموعاتك'
},
{
  icon: CalendarHeart,
  title: 'يلا سوا',
  description: 'حوّل الامتنان إلى واقع؛ خطط للقاءات حقيقية واصنعوا ذكريات تستحق التدوين'
}];


const AppDownloadPopup = ({ onContinueToWeb, forceShow = false }: AppDownloadPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextFeature = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(nextFeature, 3500);
    return () => clearInterval(timer);
  }, [isOpen, nextFeature]);

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
    window.open('https://www.dropbox.com/scl/fi/yso4narpecot1rtk5vs2b/Momtn-App-v1.0.5.apk?rlkey=xc90lqpt8qvyevrn2bdhjo182&dl=1', '_blank');
    localStorage.setItem('app_platform_choice', 'apk');
    setIsOpen(false);
  };

  const handleContinueToWeb = () => {
    localStorage.setItem('app_platform_choice', 'web');
    setIsOpen(false);
    onContinueToWeb();
  };

  const currentFeature = features[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#2D1F3D]/95 via-[#1A1F2C]/95 to-[#3D1F2C]/95 border-white/20 text-white backdrop-blur-xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <img
              src="/lovable-uploads/99ddbd0a-3c24-4138-92e9-2ed2b73e0681.png"
              alt="ممتن"
              className="w-20 h-20 rounded-2xl" />
          </div>
        </DialogHeader>

        {/* Animated Feature Carousel */}
        <div className="relative min-h-[140px] flex items-center justify-center my-2" dir="rtl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

              <div className="w-14 h-14 rounded-2xl bg-[#d94550]/15 border border-[#d94550]/20 flex items-center justify-center mb-4">
                <currentFeature.icon className="w-7 h-7 text-[#d94550]" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1.5">{currentFeature.title}</h4>
              <p className="text-sm text-white/55 leading-relaxed max-w-[85%]">{currentFeature.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-1.5 mb-1">
          {features.map((_, i) =>
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
            i === currentIndex ?
            'w-6 bg-[#d94550]' :
            'w-1.5 bg-white/20 hover:bg-white/40'}`
            } />

          )}
        </div>
        
        <div className="flex flex-col gap-3 mt-2">
          <Button
            onClick={handleAPKDownload}
            className="w-full h-14 bg-gradient-to-r from-[#d94550] to-[#c73e48] hover:from-[#c73e48] hover:to-[#b5363f] text-white flex items-center justify-center gap-3 rounded-xl shadow-lg">

            <Download className="w-6 h-6" />
            <span className="text-lg">تحميل تطبيق الأندرويد (ِAPK)</span>
          </Button>

          <Button
            onClick={handleContinueToWeb}
            variant="outline"
            className="w-full h-14 border-white/30 bg-gray-800/50 hover:bg-gray-700/50 text-white flex items-center justify-center gap-3 rounded-xl">

            <Globe className="w-6 h-6" />
            <span className="text-lg">المتابعة إلى تطبيق الويب</span>
          </Button>
        </div>

        <p className="text-center text-white/50 text-sm mt-1">

        </p>
      </DialogContent>
    </Dialog>);

};

export default AppDownloadPopup;