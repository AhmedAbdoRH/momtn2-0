
import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { toast } from "../hooks/use-toast";

interface GradientOption {
  id: string;
  name: string;
  gradient: string;
  textColor?: string;
}

// مجموعة خلفيات محترفة للتطبيق
const gradientOptions: GradientOption[] = [
  // الخلفية الافتراضية
  { id: "default", name: "افتراضي", gradient: "bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C]", textColor: "text-white" },
  
  // خمسة خلفيات احترافية جديدة
  { id: "cosmic", name: "فضائي", gradient: "bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]", textColor: "text-white" },
  { id: "royal", name: "ملكي", gradient: "bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5A189A]", textColor: "text-white" },
  { id: "galaxy", name: "مجرة", gradient: "bg-gradient-to-br from-[#0B0C10] via-[#1F2833] to-[#2C3531]", textColor: "text-white" },
  { id: "aurora", name: "شفق قطبي", gradient: "bg-gradient-to-br from-[#04293A] via-[#064663] to-[#041C32]", textColor: "text-white" },
  { id: "midnight", name: "منتصف الليل", gradient: "bg-gradient-to-br from-[#0F044C] via-[#141E61] to-[#282A3A]", textColor: "text-white" },
];

// مفتاح تخزين تفضيل المستخدم في التخزين المحلي
const BACKGROUND_STORAGE_KEY = "app-background-gradient";

// وظيفة مساعدة لتطبيق التدرج - يمكن استدعاؤها من أي مكان في التطبيق
export const applyGradientById = (gradientId: string) => {
  const selected = gradientOptions.find(option => option.id === gradientId);
  if (selected) {
    applyGradientToBody(selected);
  }
};

// الوظيفة الرئيسية التي تطبق التدرج على جسم المستند
export const applyGradientToBody = (selected: GradientOption) => {
  // أولاً قم بإزالة جميع فئات التدرج الموجودة من أي تحديد سابق
  document.body.classList.remove(...gradientOptions.flatMap(opt => opt.gradient.split(' ')));
  
  // تطبيق فئات التدرج الجديدة
  selected.gradient.split(' ').forEach(className => {
    document.body.classList.add(className);
  });
  
  // إزالة أي لون خلفية قد يتم تعيينه بشكل مباشر
  document.body.style.backgroundColor = "";

  // التأكد من أن الجسم يغطي العرض بالكامل مع علامات !important
  const styleId = "gradient-full-height-style";
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  // استخدام !important لتجاوز أي أنماط متعارضة
  styleElement.textContent = `
    html, body {
      height: 100% !important;
      min-height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      background-attachment: fixed !important;
    }
    #root {
      min-height: 100vh !important;
      background: transparent !important;
    }
    body {
      overflow-x: hidden !important;
    }
    .min-h-screen {
      background: transparent !important;
    }
    [class*="bg-background"] {
      background: transparent !important;
    }
  `;

  // حفظ التفضيل في localStorage
  localStorage.setItem(BACKGROUND_STORAGE_KEY, selected.id);
};

export const BackgroundSettings: React.FC = () => {
  const [selectedGradient, setSelectedGradient] = useState<string>("default");

  // تحميل التفضيل المحفوظ عند تحميل المكون
  useEffect(() => {
    const savedGradient = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (savedGradient) {
      setSelectedGradient(savedGradient);
      const selected = gradientOptions.find(option => option.id === savedGradient);
      if (selected) {
        applyGradientToBody(selected);
      }
    } else {
      // تطبيق التدرج الافتراضي إذا لم يكن هناك تفضيل محفوظ
      const defaultGradient = gradientOptions.find(option => option.id === "default");
      if (defaultGradient) {
        applyGradientToBody(defaultGradient);
      }
    }
    
    // الاستماع لأحداث apply-gradient من المكونات الأخرى
    const handleApplyGradient = (event: CustomEvent) => {
      const { gradientId } = event.detail;
      if (gradientId) {
        setSelectedGradient(gradientId);
        const selected = gradientOptions.find(option => option.id === gradientId);
        if (selected) {
          applyGradientToBody(selected);
        }
      }
    };
    
    window.addEventListener('apply-gradient', handleApplyGradient as EventListener);
    
    // تنظيف مستمع الحدث عند إلغاء تحميل المكون
    return () => {
      window.removeEventListener('apply-gradient', handleApplyGradient as EventListener);
    };
  }, []);

  const handleGradientSelect = (gradientId: string) => {
    setSelectedGradient(gradientId);
    const selected = gradientOptions.find(option => option.id === gradientId);
    if (selected) {
      applyGradientToBody(selected);
      toast({
        title: "تم تغيير الخلفية",
        description: `تم تطبيق خلفية "${selected.name}" بنجاح.`
      });
    }
  };

  return (
    <div className="bg-black/60 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
      <div className="flex items-center justify-end mb-6">
        <h2 className="text-2xl font-bold text-right ml-2 text-white">تغيير خلفية التطبيق</h2>
        <Palette className="h-6 w-6 text-gray-300" />
      </div>
      
      <p className="text-right text-gray-300 mb-6">
        اختر إحدى التدرجات اللونية المتاحة لتطبيقها على خلفية التطبيق.
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
        {gradientOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleGradientSelect(option.id)}
            className={`${option.gradient} ${option.textColor || "text-white"} h-28 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg ${
              selectedGradient === option.id ? "ring-4 ring-white ring-opacity-50 transform scale-[1.03]" : "border border-white/10"
            }`}
          >
            <span className="font-bold drop-shadow-md text-lg">{option.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
