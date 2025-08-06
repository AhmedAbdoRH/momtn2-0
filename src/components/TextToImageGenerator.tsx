import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TextToImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const backgroundStyles = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
];

export const TextToImageGenerator = ({ onImageGenerated, isGenerating, setIsGenerating }: TextToImageGeneratorProps) => {
  const [gratitudeText, setGratitudeText] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(0);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!gratitudeText.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة نص الامتنان أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Create a canvas to generate the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      // Set canvas dimensions
      canvas.width = 800;
      canvas.height = 600;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const backgroundStyle = backgroundStyles[selectedBackground];
      
      // Parse gradient colors from CSS gradient
      const gradientMatch = backgroundStyle.match(/#[a-fA-F0-9]{6}/g);
      if (gradientMatch && gradientMatch.length >= 2) {
        gradient.addColorStop(0, gradientMatch[0]);
        gradient.addColorStop(1, gradientMatch[1]);
      } else {
        // Fallback colors
        gradient.addColorStop(0, "#667eea");
        gradient.addColorStop(1, "#764ba2");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some texture/pattern
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Setup text styling
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Use Arabic-friendly font
      ctx.font = "bold 48px Arial, 'Noto Sans Arabic', sans-serif";
      
      // Word wrap function for Arabic text
      const words = gratitudeText.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      const maxWidth = canvas.width - 100; // 50px padding on each side

      for (const word of words) {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw text lines
      const lineHeight = 60;
      const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
      
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        
        // Add text shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillText(line, canvas.width / 2 + 2, y + 2);
        
        // Add main text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, canvas.width / 2, y);
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          onImageGenerated(imageUrl);
        }
      }, "image/jpeg", 0.9);

    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الصورة",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="gratitudeText" className="block text-sm font-medium text-gray-300 text-right">
          اكتب امتنانك هنا
        </label>
        <Textarea
          id="gratitudeText"
          value={gratitudeText}
          onChange={(e) => setGratitudeText(e.target.value)}
          placeholder="اكتب ما تشعر بالامتنان له اليوم..."
          className="w-full h-32 p-3 rounded-lg bg-gray-800/90 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 text-right resize-none"
          dir="rtl"
          maxLength={200}
        />
        <p className="text-xs text-gray-400 text-right">
          {gratitudeText.length}/200 حرف
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 text-right">
          اختر خلفية
        </label>
        <div className="grid grid-cols-4 gap-2">
          {backgroundStyles.map((style, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedBackground(index)}
              className={`h-12 rounded-lg border-2 transition-all ${
                selectedBackground === index 
                  ? "border-white shadow-lg scale-105" 
                  : "border-gray-600 hover:border-gray-400"
              }`}
              style={{ background: style }}
            />
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={generateImage}
        disabled={!gratitudeText.trim() || isGenerating}
        className="w-full"
      >
        {isGenerating ? "جاري إنشاء الصورة..." : "إنشاء صورة الامتنان"}
      </Button>
    </div>
  );
};