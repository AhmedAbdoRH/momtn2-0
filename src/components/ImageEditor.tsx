import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { RotateCw, Crop, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 300,
      backgroundColor: '#1f2937',
    });

    // Load the image
    FabricImage.fromURL(imageUrl).then((img) => {
      // Scale image to fit canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = img.width!;
      const imgHeight = img.height!;
      
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setIsLoading(false);
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  const handleRotate = () => {
    if (!fabricCanvas) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.rotate(currentAngle + 90);
      fabricCanvas.renderAll();
    }
  };

  const handleCrop = () => {
    if (!fabricCanvas) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      // Simple crop implementation - you can enhance this
      const boundingRect = activeObject.getBoundingRect();
      fabricCanvas.setDimensions({
        width: boundingRect.width,
        height: boundingRect.height
      });
      
      activeObject.set({
        left: 0,
        top: 0
      });
      
      fabricCanvas.renderAll();
    }
  };

  const handleSave = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL();
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => {
        onSave(blob);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">تعديل الصورة</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-white hover:bg-gray-700"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          {isLoading && (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-white">جاري التحميل...</div>
            </div>
          )}
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            onClick={handleRotate}
            className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <RotateCw size={16} className="mr-2" />
            تدوير
          </Button>
          <Button
            variant="outline"
            onClick={handleCrop}
            className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <Crop size={16} className="mr-2" />
            قص
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Check size={16} className="mr-2" />
            حفظ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;