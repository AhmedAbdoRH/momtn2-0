
import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { toast } from "../hooks/use-toast";

interface GradientOption {
  id: string;
  name: string;
  gradient: string;
  textColor?: string;
}

// Collection of professional gradient options
const gradientOptions: GradientOption[] = [
  { id: "default", name: "افتراضي", gradient: "bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C]", textColor: "text-white" },
  { id: "sunset", name: "غروب الشمس", gradient: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600", textColor: "text-white" },
  { id: "ocean", name: "المحيط", gradient: "bg-gradient-to-br from-blue-500 via-teal-400 to-cyan-300", textColor: "text-white" },
  { id: "forest", name: "الغابة", gradient: "bg-gradient-to-br from-green-500 via-emerald-400 to-teal-500", textColor: "text-white" },
  { id: "lavender", name: "اللافندر", gradient: "bg-gradient-to-br from-purple-300 via-pink-200 to-indigo-300", textColor: "text-gray-800" },
  { id: "midnight", name: "منتصف الليل", gradient: "bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900", textColor: "text-white" },
  { id: "gold", name: "ذهبي", gradient: "bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400", textColor: "text-gray-800" },
  { id: "rose", name: "وردي", gradient: "bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500", textColor: "text-white" },
  { id: "mint", name: "نعناعي", gradient: "bg-gradient-to-br from-green-200 via-teal-200 to-emerald-300", textColor: "text-gray-800" },
  { id: "royal", name: "ملكي", gradient: "bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500", textColor: "text-white" },
  { id: "ash", name: "رمادي", gradient: "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400", textColor: "text-gray-800" },
  { id: "cosmic", name: "كوني", gradient: "bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900", textColor: "text-white" },
];

// Local Storage key for saving user preference
const BACKGROUND_STORAGE_KEY = "app-background-gradient";

export const BackgroundSettings: React.FC = () => {
  const [selectedGradient, setSelectedGradient] = useState<string>("default");

  // Load saved preference on component mount
  useEffect(() => {
    const savedGradient = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (savedGradient) {
      setSelectedGradient(savedGradient);
      applyGradientToBody(savedGradient);
    } else {
      // Apply default gradient if no saved preference
      applyGradientToBody("default");
    }
  }, []);

  // Apply the gradient to the body element and ensure it covers the entire viewport
  const applyGradientToBody = (gradientId: string) => {
    const selected = gradientOptions.find(option => option.id === gradientId);
    
    if (selected) {
      // Remove all existing gradient classes
      document.body.classList.remove(...gradientOptions.map(opt => opt.gradient.split(' ')[0]));
      document.body.classList.remove(...gradientOptions.flatMap(opt => opt.gradient.split(' ')));
      
      // Apply new gradient classes
      selected.gradient.split(' ').forEach(className => {
        document.body.classList.add(className);
      });

      // Ensure body covers the entire viewport
      document.body.style.minHeight = "100vh";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.documentElement.style.height = "100%";
      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";

      // Add CSS to ensure the gradient covers the entire viewport
      // This is needed because sometimes other elements might override the body styles
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
        }
        #root {
          min-height: 100vh !important;
        }
      `;

      // Save the preference to localStorage
      localStorage.setItem(BACKGROUND_STORAGE_KEY, gradientId);
      
      toast({
        title: "تم تغيير الخلفية",
        description: `تم تطبيق خلفية "${selected.name}" بنجاح.`
      });
    }
  };

  const handleGradientSelect = (gradientId: string) => {
    setSelectedGradient(gradientId);
    applyGradientToBody(gradientId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-end mb-6">
        <h2 className="text-2xl font-bold text-right ml-2">تغيير خلفية التطبيق</h2>
        <Palette className="h-6 w-6 text-gray-600" />
      </div>
      
      <p className="text-right text-gray-600 mb-6">
        اختر إحدى التدرجات اللونية المتاحة لتطبيقها على خلفية التطبيق.
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {gradientOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleGradientSelect(option.id)}
            className={`${option.gradient} ${option.textColor || "text-white"} h-24 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
              selectedGradient === option.id ? "ring-4 ring-offset-2 ring-blue-500" : ""
            }`}
          >
            <span className="font-medium drop-shadow-md">{option.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
