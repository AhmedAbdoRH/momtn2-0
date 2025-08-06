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
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      canvas.width = 800;
      canvas.height = 600;

      // احترافية الزجاج: خلفية شفافة بلون أزرق داكن وطمس متدرج
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(20, 30, 60, 0.6)");
      gradient.addColorStop(1, "rgba(10, 20, 40, 0.85)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // تأثير الزجاج المموه (تكرار دوائر ضبابية شفافة)
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
        const radius = Math.random() * 40 + 10;
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          radius,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // خطوط ناعمة لإضافة العمق
      ctx.globalAlpha = 0.03;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // إعداد النص
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 48px Arial, 'Noto Sans Arabic', sans-serif";

      // لف النص العربي
      const words = gratitudeText.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      const maxWidth = canvas.width - 100;

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
      if (currentLine) lines.push(currentLine);

      const lineHeight = 60;
      const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillText(line, canvas.width / 2 + 2, y + 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, canvas.width / 2, y);
      });

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
