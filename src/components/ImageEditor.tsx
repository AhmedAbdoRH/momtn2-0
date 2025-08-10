import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw, Crop, Check, X, Move, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'move' | 'crop'>('move');

  // تحميل الصورة
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setIsLoading(false);
      // تحديد الموضع والحجم المناسب
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40;
        const containerHeight = Math.min(400, window.innerHeight * 0.4);
        const imgScale = Math.min(containerWidth / img.width, containerHeight / img.height);
        setScale(imgScale);
        setPosition({
          x: (containerWidth - img.width * imgScale) / 2,
          y: (containerHeight - img.height * imgScale) / 2
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // رسم الصورة على الـ Canvas
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !image || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // تحديد أبعاد الـ Canvas
    const containerWidth = containerRef.current.clientWidth - 40;
    const containerHeight = Math.min(400, window.innerHeight * 0.4);
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // مسح الـ Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // حفظ حالة السياق
    ctx.save();

    // تطبيق التحويلات
    const centerX = position.x + (image.width * scale) / 2;
    const centerY = position.y + (image.height * scale) / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // رسم الصورة
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // استعادة حالة السياق
    ctx.restore();

    // رسم منطقة القص إذا كانت مفعلة
    if (isCropMode) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // رسم مقابض القص
      const handles = [
        { x: cropArea.x, y: cropArea.y },
        { x: cropArea.x + cropArea.width, y: cropArea.y },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
        { x: cropArea.x, y: cropArea.y + cropArea.height }
      ];
      
      ctx.fillStyle = '#ffffff';
      handles.forEach(handle => {
        ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
      });
    }
  }, [image, rotation, scale, position, isCropMode, cropArea]);

  // إعادة رسم الـ Canvas عند تغيير القيم
  useEffect(() => {
    if (image) {
      requestAnimationFrame(drawCanvas);
    }
  }, [drawCanvas, image]);

  // تحديث أبعاد الـ Canvas عند تغيير حجم النافذة
  useEffect(() => {
    const handleResize = () => {
      drawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  // معالجة بداية السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    
    // تحديد نوع السحب
    if (isCropMode) {
      // فحص إذا كان المؤشر داخل منطقة القص
      if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
          y >= cropArea.y && y <= cropArea.y + cropArea.height) {
        setDragType('crop');
      } else {
        setDragType('move');
      }
    } else {
      setDragType('move');
    }
  };

  // معالجة السحب
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    if (dragType === 'crop' && isCropMode) {
      // تحريك منطقة القص
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + deltaX, canvasRef.current!.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + deltaY, canvasRef.current!.height - prev.height))
      }));
    } else {
      // تحريك الصورة
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }
    
    setDragStart({ x, y });
  };

  // معالجة انتهاء السحب
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // تدوير الصورة
  const handleRotate = useCallback(() => {
    setRotation(prev => {
      const newRotation = (prev + 90) % 360;
      console.log('تدوير الصورة:', newRotation);
      return newRotation;
    });
  }, []);

  // تطبيق القص
  const applyCrop = useCallback(() => {
    if (!canvasRef.current || !image) return;

    console.log('تطبيق القص مع المنطقة:', cropArea);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // إنشاء canvas جديد للصورة المقصوصة
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropArea.width;
    croppedCanvas.height = cropArea.height;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return;

    // نسخ المنطقة المحددة
    const imageData = ctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    croppedCtx.putImageData(imageData, 0, 0);

    // تحديث الصورة
    const croppedImg = new Image();
    croppedImg.onload = () => {
      console.log('تم تحديث الصورة المقصوصة');
      setImage(croppedImg);
      setIsCropMode(false);
      setRotation(0);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    croppedImg.src = croppedCanvas.toDataURL();
  }, [cropArea, image]);

  // تفعيل/إلغاء وضع القص
  const handleCropToggle = useCallback(() => {
    if (isCropMode) {
      console.log('تطبيق القص');
      // تطبيق القص
      applyCrop();
    } else {
      console.log('تفعيل وضع القص');
      setIsCropMode(true);
      // تحديد منطقة قص افتراضية
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        setCropArea({
          x: canvas.width * 0.2,
          y: canvas.height * 0.2,
          width: canvas.width * 0.6,
          height: canvas.height * 0.6
        });
      }
    }
  }, [isCropMode, applyCrop]);

  // إلغاء وضع القص
  const handleCancelCrop = useCallback(() => {
    console.log('إلغاء وضع القص');
    setIsCropMode(false);
  }, []);


  // حفظ الصورة
  const handleSave = () => {
    if (!canvasRef.current) return;

    // إنشاء canvas نهائي بالصورة الحالية
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    // تحديد الأبعاد النهائية
    if (image) {
      finalCanvas.width = image.width;
      finalCanvas.height = image.height;
      
      // رسم الصورة النهائية
      finalCtx.save();
      finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
      finalCtx.rotate((rotation * Math.PI) / 180);
      finalCtx.drawImage(image, -image.width / 2, -image.height / 2);
      finalCtx.restore();
    }

    finalCanvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-4 w-full max-w-md mx-auto max-h-[90vh] overflow-hidden">
        {/* العنوان */}
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

        {/* منطقة الـ Canvas */}
        <div 
          ref={containerRef}
          className="bg-gray-800 rounded-lg p-2 mb-4 relative overflow-hidden"
          style={{ minHeight: '250px', maxHeight: '400px' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">جاري التحميل...</div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-auto cursor-move border border-gray-600 rounded"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          )}
          
          {isCropMode && (
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-yellow-400 text-xs text-center">
                اسحب المنطقة البيضاء لتحديد الجزء المراد قصه
              </p>
            </div>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRotate}
              disabled={isCropMode}
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              <RotateCw size={16} className="mr-1" />
              تدوير
            </Button>
            <Button
              variant={isCropMode ? "default" : "outline"}
              onClick={handleCropToggle}
              className={`flex-1 ${
                isCropMode 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              }`}
            >
              {isCropMode ? <Check size={16} className="mr-1" /> : <Crop size={16} className="mr-1" />}
              {isCropMode ? "تطبيق" : "قص"}
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
              <Check size={16} className="mr-1" />
              حفظ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;