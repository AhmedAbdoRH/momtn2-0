import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    "id": "velvet-rose-darker", // تم تغيير المعرف قليلاً للإشارة إلى أنها نسخة أغمق
    "name": "الورد المخملي الداكن", // تم تغيير الاسم للإشارة إلى أنها نسخة أغمق
    "gradient": "bg-gradient-to-br from-[#14090e] via-[#4a1e34] to-[#9c3d1a]", 
    "textColor": "text-white"
  },
  
 
  {
  id: "crimson-ember-ultra",
  name: "جمرة قرمزية - مظلمة جداً",
  gradient: "bg-gradient-to-br from-[#100707] via-[#4A1C17] to-[#7A2E26]",
  textColor: "text-white"
},

{
  id: "olive-obsidian",
  name: "زيتون الأوبسيديان",
  gradient: "bg-gradient-to-br from-[#0A0E0A] via-[#1F2D24] to-[#3B4A36]",
  textColor: "text-white"
}


];

const BACKGROUND_STORAGE_KEY = (userId: string) => `app-bg-${userId}`;

export const applyGradientById = (gradientId: string) => {
  const selected = gradientOptions.find(option => option.id === gradientId);
  if (selected) {
    applyGradientToBody(selected);
  }
};

const applyGradientToBody = (selected: GradientOption) => {
  document.body.classList.remove(...gradientOptions.flatMap(opt => opt.gradient.split(' ')));
  selected.gradient.split(' ').forEach(className => {
    document.body.classList.add(className);
  });

  document.body.style.backgroundColor = "";

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
    .min-h-screen {
      background: transparent !important;
    }
    [class*="bg-background"] {
      background: transparent !important;
    }
  `;
};

const saveUserBackgroundPreference = async (userId: string, gradientId: string) => {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        { user_id: userId, background_id: gradientId },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
    
    // Also store in localStorage as a fallback
    localStorage.setItem(BACKGROUND_STORAGE_KEY(userId), gradientId);
    return true;
  } catch (error) {
    console.error('Error saving background preference:', error);
    return false;
  }
};

const getUserBackgroundPreference = async (userId: string): Promise<string | null> => {
  try {
    // First try to get from database
    const { data, error } = await supabase
      .from('user_preferences')
      .select('background_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
      throw error;
    }


    if (data?.background_id) {
      return data.background_id;
    }

    // Fallback to localStorage if not in database
    return localStorage.getItem(BACKGROUND_STORAGE_KEY(userId));
  } catch (error) {
    console.error('Error getting background preference:', error);
    // Fallback to localStorage on error
    return localStorage.getItem(BACKGROUND_STORAGE_KEY(userId));
  }
};

export const BackgroundSettings: React.FC = () => {
  const [selectedGradient, setSelectedGradient] = useState<string>("default");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBackgroundPreference = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const savedGradientId = await getUserBackgroundPreference(user.id);
        const gradientId = savedGradientId || 'default';
        
        setSelectedGradient(gradientId);
        const selected = gradientOptions.find(option => option.id === gradientId) || 
                         gradientOptions.find(option => option.id === 'default');
        
        if (selected) {
          applyGradientToBody(selected);
        }
      } catch (error) {
        console.error('Error loading background preference:', error);
        // Fallback to default
        const defaultGradient = gradientOptions.find(option => option.id === 'default');
        if (defaultGradient) {
          applyGradientToBody(defaultGradient);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBackgroundPreference();

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

    return () => {
      window.removeEventListener('apply-gradient', handleApplyGradient as EventListener);
    };
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

    setSelectedGradient(gradientId);
    const selected = gradientOptions.find(option => option.id === gradientId);
    
    if (selected) {
      applyGradientToBody(selected);
      
      try {
        const success = await saveUserBackgroundPreference(user.id, gradientId);
        if (success) {
          toast({
            title: "تم تغيير الخلفية",
            description: `تم تطبيق خلفية "${selected.name}" بنجاح.`
          });
        } else {
          throw new Error('Failed to save preference');
        }
      } catch (error) {
        console.error('Error saving background preference:', error);
        toast({
          title: "حدث خطأ",
          description: "تعذر حفظ تفضيلات الخلفية",
          variant: "destructive"
        });
        // Revert to previous selection
        const savedGradient = localStorage.getItem(BACKGROUND_STORAGE_KEY(user.id)) || 'default';
        setSelectedGradient(savedGradient);
        const previous = gradientOptions.find(option => option.id === savedGradient) || 
                        gradientOptions.find(option => option.id === 'default');
        if (previous) {
          applyGradientToBody(previous);
        }
      }
    }
  };

  return (
    <div className="bg-black/40 p-6 rounded-lg shadow backdrop-blur-md border border-white/10">
      <div className="flex items-center justify-end mb-6">
        <h2 className="text-2xl font-bold text-right ml-2 text-white">تغيير خلفية التطبيق</h2>
        <Palette className="h-6 w-6 text-gray-300" />
      </div>

      <p className="text-right text-gray-300 mb-6">
        اختر إحدى التدرجات اللونية المتاحة لتطبيقها على خلفية التطبيق.
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
          {gradientOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleGradientSelect(option.id)}
              className={`${option.gradient} ${option.textColor || "text-white"} h-28 rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-lg ${
                selectedGradient === option.id ? "ring-4 ring-offset-2 ring-white/50" : "border border-white/10"
              }`}
              aria-label={`تغيير الخلفية إلى ${option.name}`}
            >
              <span className="font-bold drop-shadow-md text-lg">{option.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};