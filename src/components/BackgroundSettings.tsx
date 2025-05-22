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
    id: "spectrum-blue",
    name: "الأزرق السماوي",
    gradient: "bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#3D1F2C]",
    textColor: "text-white"
  },
  {
    id: "spectrum-indigo",
    name: "النيلي الغامق",
    gradient: "bg-gradient-to-br from-[#1C1C3C] via-[#2E2E5E] to-[#3D1F2C]",
    textColor: "text-white"
  },
  {
    id: "spectrum-green",
    name: "الأخضر الغامق",
    gradient: "bg-gradient-to-br from-[#0F3D3E] via-[#1E5F5B] to-[#3D1F2C]",
    textColor: "text-white"
  },
  {
    id: "spectrum-yellow",
    name: "الذهبي الدافئ",
    gradient: "bg-gradient-to-br from-[#665C00] via-[#B79300] to-[#3D1F2C]",
    textColor: "text-white"
  },
  {
    id: "spectrum-orange",
    name: "البرتقالي الغني",
    gradient: "bg-gradient-to-br from-[#7B341E] via-[#C75B28] to-[#3D1F2C]",
    textColor: "text-white"
  }
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
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