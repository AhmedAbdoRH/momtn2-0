import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { toast } from "../hooks/use-toast";

interface GradientOption {
  id: string;
  name: string;
  gradient: string;
  textColor?: string;
}

const gradientOptions: GradientOption[] = [
  { id: "default", name: "افتراضي", gradient: "bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C]", textColor: "text-white" },
  { id: "cosmic", name: "فضائي", gradient: "bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]", textColor: "text-white" },
  { id: "midnight", name: "منتصف الليل", gradient: "bg-gradient-to-br from-[#1A1A40] via-[#270082] to-[#7A0BC0]", textColor: "text-white" },
  { id: "aurora", name: "شفق قطبي", gradient: "bg-gradient-to-br from-[#082032] via-[#2C394B] to-[#334756]", textColor: "text-white" },
  { id: "royal", name: "ملكي", gradient: "bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5A189A]", textColor: "text-white" },
  { id: "galaxy", name: "مجرة", gradient: "bg-gradient-to-br from-[#0B0C10] via-[#1F2833] to-[#2C3531]", textColor: "text-white" },

  // الخلفيات الجديدة الاحترافية
  { id: "sunrise-bliss", name: "شروق دافئ", gradient: "bg-gradient-to-br from-[#FFDEE9] via-[#B5FFFC] to-[#86E3CE]", textColor: "text-gray-900" },
  { id: "serene-sky", name: "سماء صافية", gradient: "bg-gradient-to-br from-[#a1c4fd] via-[#c2e9fb] to-[#ffffff]", textColor: "text-gray-900" },
  { id: "golden-glow", name: "وهج ذهبي", gradient: "bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#fbc2eb]", textColor: "text-gray-900" },
  { id: "forest-breeze", name: "نسيم الغابة", gradient: "bg-gradient-to-br from-[#a8e6cf] via-[#dcedc1] to-[#ffd3b6]", textColor: "text-gray-900" },
  { id: "calm-lavender", name: "لافندر هادئ", gradient: "bg-gradient-to-br from-[#c1c8e4] via-[#dcd6f7] to-[#f3e1f7]", textColor: "text-gray-900" },
  { id: "hope-light", name: "نور الأمل", gradient: "bg-gradient-to-br from-[#fef9d7] via-[#d299c2] to-[#f6f0c4]", textColor: "text-gray-900" },
];

const BACKGROUND_STORAGE_KEY = "app-background-gradient";

export const applyGradientById = (gradientId: string) => {
  const selected = gradientOptions.find(option => option.id === gradientId);
  if (selected) {
    applyGradientToBody(selected);
  }
};

export const applyGradientToBody = (selected: GradientOption) => {
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

  localStorage.setItem(BACKGROUND_STORAGE_KEY, selected.id);
};

export const BackgroundSettings: React.FC = () => {
  const [selectedGradient, setSelectedGradient] = useState<string>("default");

  useEffect(() => {
    const savedGradient = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (savedGradient) {
      setSelectedGradient(savedGradient);
      const selected = gradientOptions.find(option => option.id === savedGradient);
      if (selected) {
        applyGradientToBody(selected);
      }
    } else {
      const defaultGradient = gradientOptions.find(option => option.id === "default");
      if (defaultGradient) {
        applyGradientToBody(defaultGradient);
      }
    }

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
    <div className="bg-black/40 p-6 rounded-lg shadow backdrop-blur-md border border-white/10">
      <div className="flex items-center justify-end mb-6">
        <h2 className="text-2xl font-bold text-right ml-2 text-white">تغيير خلفية التطبيق</h2>
        <Palette className="h-6 w-6 text-gray-300" />
      </div>

      <p className="text-right text-gray-300 mb-6">
        اختر إحدى التدرجات اللونية المتاحة لتطبيقها على خلفية التطبيق.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6 mt-8">
        {gradientOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleGradientSelect(option.id)}
            className={`${option.gradient} ${option.textColor || "text-white"} h-28 rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-lg ${
              selectedGradient === option.id ? "ring-4 ring-offset-2 ring-white/50" : "border border-white/10"
            }`}
          >
            <span className="font-bold drop-shadow-md text-lg">{option.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};