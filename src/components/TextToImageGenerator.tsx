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

      // خلفية غامقة مموهة شفافة
      ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // إضافة تمويه بسيط باستخدام مربعات شفافة
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
        const size = Math.random() * 100;
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          size,
          size
        );
      }

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
      }, "image/png"); // استخدم PNG لدعم الشفافية

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
