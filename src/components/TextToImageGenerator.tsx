import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TextToImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const TextToImageGenerator = ({ onImageGenerated, isGenerating, setIsGenerating }: TextToImageGeneratorProps) => {
  const [gratitudeText, setGratitudeText] = useState("");
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

      // Create dark glass effect background
      // Base dark gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, "rgba(30, 30, 40, 0.85)");
      gradient.addColorStop(1, "rgba(15, 15, 25, 0.95)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add glass-like subtle patterns
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 2 + 1,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Add subtle blur-like lines for glass effect
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
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