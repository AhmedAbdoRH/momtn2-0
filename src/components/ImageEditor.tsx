import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, Crop, Check, X, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      drawImage();
      setIsLoading(false);
      // Initialize crop area to full image
      setCropData({ x: 0, y: 0, width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale to fit image in canvas
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    // Save context for rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    // Draw crop overlay if in crop mode
    if (cropMode) {
      ctx.restore();
      ctx.save();
      
      // Darken areas outside crop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear crop area
      ctx.globalCompositeOperation = 'destination-out';
      const cropX = x + (cropData.x * scale);
      const cropY = y + (cropData.y * scale);
      const cropWidth = cropData.width * scale;
      const cropHeight = cropData.height * scale;
      ctx.fillRect(cropX, cropY, cropWidth, cropHeight);
      
      // Draw crop border
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
      
      // Draw corner handles
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      // Top-left
      ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      // Top-right
      ctx.fillRect(cropX + cropWidth - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      // Bottom-left
      ctx.fillRect(cropX - handleSize/2, cropY + cropHeight - handleSize/2, handleSize, handleSize);
      // Bottom-right
      ctx.fillRect(cropX + cropWidth - handleSize/2, cropY + cropHeight - handleSize/2, handleSize, handleSize);
    }

    ctx.restore();
  };

  useEffect(() => {
    drawImage();
  }, [rotation, cropMode, cropData]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleCropMode = () => {
    setCropMode(!cropMode);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cropMode) return;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const imgX = (canvas.width - img.width * scale) / 2;
    const imgY = (canvas.height - img.height * scale) / 2;
    
    const startX = Math.max(0, Math.min((dragStart.x - imgX) / scale, img.width));
    const startY = Math.max(0, Math.min((dragStart.y - imgY) / scale, img.height));
    const endX = Math.max(0, Math.min((x - imgX) / scale, img.width));
    const endY = Math.max(0, Math.min((y - imgY) / scale, img.height));
    
    setCropData({
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let finalWidth = img.width;
    let finalHeight = img.height;
    
    // If in crop mode, use crop dimensions
    if (cropMode) {
      finalWidth = cropData.width;
      finalHeight = cropData.height;
    }

    // Handle rotation - swap dimensions if rotated 90 or 270 degrees
    if (rotation === 90 || rotation === 270) {
      canvas.width = finalHeight;
      canvas.height = finalWidth;
    } else {
      canvas.width = finalWidth;
      canvas.height = finalHeight;
    }

    // Apply rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    if (cropMode) {
      // Draw cropped image
      if (rotation === 90 || rotation === 270) {
        ctx.drawImage(
          img,
          cropData.x, cropData.y, cropData.width, cropData.height,
          -finalHeight / 2, -finalWidth / 2, finalHeight, finalWidth
        );
      } else {
        ctx.drawImage(
          img,
          cropData.x, cropData.y, cropData.width, cropData.height,
          -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight
        );
      }
    } else {
      // Draw full image with rotation
      if (rotation === 90 || rotation === 270) {
        ctx.drawImage(img, -finalHeight / 2, -finalWidth / 2, finalHeight, finalWidth);
      } else {
        ctx.drawImage(img, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);
      }
    }

    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full">
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
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-white">جاري التحميل...</div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="max-w-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          )}
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
            onClick={toggleCropMode}
            className={`flex-1 border-gray-600 text-white hover:bg-gray-600 ${
              cropMode ? 'bg-blue-600 border-blue-500' : 'bg-gray-700'
            }`}
          >
            <Crop size={16} className="mr-2" />
            قص
          </Button>
        </div>

        {cropMode && (
          <div className="text-sm text-gray-300 mb-4 text-center">
            اسحب لتحديد منطقة القص
          </div>
        )}

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