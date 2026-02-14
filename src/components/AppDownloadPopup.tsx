import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Feather, 
  Users, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Camera, 
  LineChart, 
  Download, 
  Globe 
} from 'lucide-react';

// قائمة المميزات السبعة مع توحيد اللون للهوية البصرية (اللون الأحمر الخاص بممتن)
const features = [
  {
    icon: Feather,
    title: 'سجل نعمك وتذكرها',
    description: 'مساحة خاصة وهادئة لتدوين اللحظات التي تشعر بالامتنان لها يومياً.',
    color: 'bg-[#d94550]/15 text-[#d94550]'
  },
  {
    icon: Users,
    title: ' انشئ مساحات مشتركة',
    description: 'أنشئ مجموعاتك الخاصة مع العائلة أو الأصدقاء لمشاركة مشاعر الامتنان معاً.',
    color: 'bg-[#d94550]/15 text-[#d94550]'
  },
  {
    icon: Heart,
    title: 'تفاعل مع الذكريات',
    description: 'شارك أحباءك لحظاتهم بتفاعلات وتعليقات تبني روابط إنسانية أعمق وأصدق.',
    color: 'bg-[#d94550]/15 text-[#d94550]'
  },
  {
    icon: MessageCircle,
    title: 'تواصل مع احبائك',
    description: 'محادثات فورية وسريعة للتواصل المباشر مع أعضاء مجموعاتك في أي وقت.',
    color: 'bg-[#d94550]/15 text-[#d94550]'
  },
  {
    icon: Calendar,
    title: 'تواصل اجتماعي حقيقي',
    description: 'خطط للقاءات حقيقية واصنعوا ذكريات تستحق التدوين بعيداً عن الشاشات.',
    color: 'bg-[#d94550]/15 text-[#d94550]'
  },
  {
    icon: Camera,
    title: ' وثق ذكرياتك واحفظها ',
    description: 'أضف الصور التي تعبر عن نعمك ليكون سجل امتنانك مرجعاً بصرياً ملهماً.',
    color: 'bg-[#d94550]/15 text-[#d94550]'
  },
];

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const nextFeature = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextFeature, 4000);
    return () => clearInterval(timer);
  }, [nextFeature]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" dir="rtl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md overflow-hidden bg-gradient-to-br from-[#1a1625] via-[#2d1b2d] to-[#1a1625] border border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem]"
      >
        <div className="p-8 pb-2 text-center">
          {/* الشعار */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-auto w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center p-3 shadow-inner mb-8"
          >
            <img 
              src="/lovable-uploads/99ddbd0a-3c24-4138-92e9-2ed2b73e0681.png" 
              alt="ممتن" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => e.target.src = 'https://placehold.co/100x100?text=M'}
            />
          </motion.div>

          {/* الكروت المتحركة - الآن بلون موحد */}
          <div className="relative min-h-[180px] flex items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full flex flex-col items-center px-4"
              >
                <div className={`w-16 h-16 rounded-full ${features[currentIndex].color} flex items-center justify-center mb-5 shadow-lg border border-[#d94550]/10`}>
                  {React.createElement(features[currentIndex].icon, { size: 30 })}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white tracking-tight">
                  {features[currentIndex].title}
                </h3>
                <p className="text-white/50 leading-relaxed text-sm max-w-[90%]">
                  {features[currentIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="p-8 pt-2 space-y-4">
          <button
            onClick={() => console.log('Downloading...')}
            className="w-full h-14 bg-gradient-to-r from-[#d94550] to-[#c73e48] hover:shadow-[0_0_30px_rgba(217,69,80,0.3)] text-white flex items-center justify-center gap-3 rounded-2xl shadow-lg font-bold transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span className="text-lg">تحميل التطبيق APK</span>
          </button>

          <button
            onClick={() => setIsOpen(false)} 
            className="w-full text-white/30 hover:text-white/60 flex items-center justify-center gap-2 text-xs transition-colors py-2"
          >
            <Globe size={14} />
            الاستمرار عبر نسخة الويب
          </button>

          <div className="flex justify-center pt-2 opacity-10">
             <p className="text-[9px] uppercase tracking-[0.4em] font-light">
               Momtan Digital Experience
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
