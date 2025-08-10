import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage, Rect } from 'fabric';
import { RotateCw, Crop, Check, X, Square } from 'lucide-react';
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
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 500,
      height: 400,
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
        selectable: false,
        evented: false,
      });

      canvas.add(img);
      setOriginalImage(img);
      canvas.renderAll();
      setIsLoading(false);
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  const handleRotate = () => {
    if (!fabricCanvas || !originalImage || isCropMode) return;
    
    const currentAngle = originalImage.angle || 0;
    originalImage.rotate(currentAngle + 90);
    fabricCanvas.renderAll();
  };

  const handleCrop = () => {
    if (!fabricCanvas || !originalImage) return;
    
    if (!isCropMode) {
      // Enter crop mode
      setIsCropMode(true);
      
      // Create crop selection rectangle
      const rect = new Rect({
        left: 50,
        top: 50,
        width: 200,
        height: 150,
        fill: 'transparent',
        stroke: '#ffffff',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        cornerColor: '#ffffff',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'rect',
      });
      
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
      setCropRect(rect);
      fabricCanvas.renderAll();
    } else {
      // Apply crop
      if (cropRect) {
        const cropArea = {
          left: cropRect.left!,
          top: cropRect.top!,
          width: cropRect.width! * cropRect.scaleX!,
          height: cropRect.height! * cropRect.scaleY!,
        };
        
        // Create a new canvas with cropped dimensions
        const croppedCanvas = new FabricCanvas(null, {
          width: cropArea.width,
          height: cropArea.height,
        });
        
        // Clone and position the original image
        originalImage.clone().then((clonedImg) => {
          clonedImg.set({
            left: -cropArea.left + originalImage.left!,
            top: -cropArea.top + originalImage.top!,
          });
          
          croppedCanvas.add(clonedImg);
          croppedCanvas.renderAll();
          
          // Replace current canvas content
          fabricCanvas.clear();
          fabricCanvas.setDimensions({
            width: cropArea.width,
            height: cropArea.height,
          });
          
          FabricImage.fromURL(croppedCanvas.toDataURL()).then((newImg) => {
            newImg.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
            });
            fabricCanvas.add(newImg);
            setOriginalImage(newImg);
            fabricCanvas.renderAll();
          });
          
          croppedCanvas.dispose();
        });
      }
      
      setIsCropMode(false);
      setCropRect(null);
    }
  };

  const handleCancelCrop = () => {
    if (fabricCanvas && cropRect) {
      fabricCanvas.remove(cropRect);
      setCropRect(null);
      setIsCropMode(false);
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
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
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-white">جاري التحميل...</div>
            </div>
          )}
          <canvas ref={canvasRef} className="max-w-full border border-gray-600 rounded" />
          {isCropMode && (
            <div className="mt-2 text-center">
              <p className="text-yellow-400 text-sm">اسحب المنطقة المحددة لتحديد الجزء المراد قصه</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            onClick={handleRotate}
            disabled={isCropMode}
            className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            <RotateCw size={16} className="mr-2" />
            تدوير
          </Button>
          <Button
            variant={isCropMode ? "default" : "outline"}
            onClick={handleCrop}
            className={`flex-1 ${
              isCropMode 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            }`}
          >
            {isCropMode ? <Check size={16} className="mr-2" /> : <Crop size={16} className="mr-2" />}
            {isCropMode ? "تطبيق القص" : "قص"}
          </Button>
          {isCropMode && (
            <Button
              variant="outline"
              onClick={handleCancelCrop}
              className="bg-red-600 border-red-600 text-white hover:bg-red-700"
            >
              <X size={16} />
            </Button>
          )}
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