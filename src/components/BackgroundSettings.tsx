
import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { useAuth } from "./AuthProvider";

interface GradientOption {
  id: string;
  name: string;
  gradient: string;
  textColor?: string;
}

const gradientOptions: GradientOption[] = [
  {
    id: "default",
    name: "افتراضي",
    gradient: "bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C]",
    textColor: "text-white"
  },
  {
    id: "spectrum-red",
    name: "الأحمر الهادئ",
    gradient: "bg-gradient-to-br from-[#3B0A0A] via-[#5C1A1A] to-[#3D1F2C]",
    textColor: "text-white"
  },
  {
    id: "spectrum-indigo",
    name: "النيلي الغامق",
    gradient: "bg-gradient-to-br from-[#1C1C3C] via-[#2E2E5E] to-[#3D1F2C]",
    textColor: "text-white"
  }
];

const applyGradientToBody = (selected: GradientOption) => {
  // إزالة جميع الكلاسات السابقة
  gradientOptions.forEach(option => {
    option.gradient.split(' ').forEach(className => {
      document.body.classList.remove(className);
    });
  });

  // تطبيق الكلاسات الجديدة
  selected.gradient.split(' ').forEach(className => {
    document.body.classList.add(className);
  });

  // تطبيق الستايلات الإضافية
  const styleId = "gradient-full-height-style";
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

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
  `;
};

export const applyGradientById = (gradientId: string) => {
  const selected = gradientOptions.find(option => option.id === gradientId);
  if (selected) {
    applyGradientToBody(selected);
  }
};

// استخدام localStorage بدلاً من Supabase مؤقتاً
const saveUserBackgroundPreference = async (userId: string, gradientId: string) => {
  try {
    localStorage.setItem(`background-${userId}`, gradientId);
    localStorage.setItem("app-background-gradient", gradientId);
    return true;
  } catch (error) {
    console.error('Error saving background preference:', error);
    return false;
  }
};

const getUserBackgroundPreference = async (userId: string): Promise<string | null> => {
  try {
    const saved = localStorage.getItem(`background-${userId}`);
    return saved || localStorage.getItem("app-background-gradient");
  } catch (error) {
    console.error('Error getting background preference:', error);
    return null;
  }
};

export const BackgroundSettings: React.FC = () => {
  const [selectedGradient, setSelectedGradient] = useState<string>("default");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBackgroundPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const savedGradientId = await getUserBackgroundPreference(user.id);
        const gradientId = savedGradientId || 'default';
        
        setSelectedGradient(gradientId);
        applyGradientById(gradientId);
      } catch (error) {
        console.error('Error loading background preference:', error);
        applyGradientById('default');
      } finally {
        setIsLoading(false);
      }
    };

    loadBackgroundPreference();
  }, [user]);

  const handleGradientSelect = async (gradientId: string) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لتغيير الخلفية",
        variant: "destructive"
      });
      return;
    }

    // تطبيق الخلفية فوراً
    setSelectedGradient(gradientId);
    applyGradientById(gradientId);
    
    try {
      const success = await saveUserBackgroundPreference(user.id, gradientId);
      if (success) {
        const selected = gradientOptions.find(option => option.id === gradientId);
        toast({
          title: "تم تغيير الخلفية",
          description: `تم تطبيق خلفية "${selected?.name}" بنجاح.`
        });
        
        // إرسال حدث لتطبيق الخلفية على الصفحة الرئيسية
        window.dispatchEvent(new CustomEvent('apply-gradient', { 
          detail: { gradientId } 
        }));
      } else {
        throw new Error('Failed to save preference');
      }
    } catch (error) {
      console.error('Error saving background preference:', error);
      toast({
        title: "تحذير",
        description: "تم تطبيق الخلفية ولكن لم يتم حفظها",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-black/60 p-6 rounded-lg shadow backdrop-blur-md border border-white/20">
      <div className="flex items-center justify-end mb-6">
        <h2 className="text-2xl font-bold text-right ml-2 text-white">تغيير خلفية التطبيق</h2>
        <Palette className="h-6 w-6 text-gray-300" />
      </div>

      <p className="text-right text-gray-300 mb-6">
        اختر إحدى الخلفيات المتاحة لتطبيقها على التطبيق.
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {gradientOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleGradientSelect(option.id)}
              className={`${option.gradient} ${option.textColor || "text-white"} h-24 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg ${
                selectedGradient === option.id ? "ring-4 ring-white/50 ring-offset-2 ring-offset-transparent" : "border border-white/20"
              }`}
              aria-label={`تغيير الخلفية إلى ${option.name}`}
            >
              <span className="font-bold drop-shadow-md text-sm text-center px-2">{option.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
