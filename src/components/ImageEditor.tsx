```tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Square } from 'lucide-react';
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
  const isTouchRef = useRef(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'move' | 'crop' | 'resize'>('move');
  const [activeHandle, setActiveHandle] = useState<'nw' | 'ne' | 'se' | 'sw' | null>(null);

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
        const posX = (containerWidth - img.width * imgScale) / 2;
        const posY = (containerHeight - img.height * imgScale) / 2;
        setPosition({ x: posX, y: posY });
        // تحديد منطقة القص الافتراضية لتغطية الصورة بأكملها
        setCropArea({
          x: posX,
          y: posY,
          width: img.width * imgScale,
          height: img.height * imgScale
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
    ctx.scale(scale, scale);
    
    // رسم الصورة
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // استعادة حالة السياق
    ctx.restore();

    // رسم منطقة القص
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
  }, [image, scale, position, cropArea]);

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

  // دوال مساعدة للمقابض
  const getHandleUnderCursor = (x: number, y: number) : ('nw'|'ne'|'se'|'sw'|null) => {
    const handles = {
      nw: { x: cropArea.x, y: cropArea.y },
      ne: { x: cropArea.x + cropArea.width, y: cropArea.y },
      se: { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      sw: { x: cropArea.x, y: cropArea.y + cropArea.height },
    } as const;
    const size = isTouchRef.current ? 24 : 12; // تكبير منطقة الالتقاط للمس
    for (const key of Object.keys(handles) as Array<'nw'|'ne'|'se'|'sw'>) {
      const hx = handles[key].x;
      const hy = handles[key].y;
      if (x >= hx - size/2 && x <= hx + size/2 && y >= hy - size/2 && y <= hy + size/2) {
        return key;
      }
    }
    return null;
  };

  // معالجة بداية السحب
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;

    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    isTouchRef.current = e.pointerType !== 'mouse';
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });

    // تحديد نوع السحب
    // أولوية للمقابض البيضاء
    const handle = getHandleUnderCursor(x, y);
    if (handle) {
      setActiveHandle(handle);
      setDragType('resize');
      return;
    }
    // داخل المستطيل -> تحريك المستطيل
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setDragType('crop');
    } else {
      setDragType('move');
    }
  };

  // معالجة السحب
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;

    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDragging) {
      const canvas = canvasRef.current;
      const handle = getHandleUnderCursor(x, y);
      if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
      else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
      else if (x >= cropArea.x && x <= cropArea.x + cropArea.width && y >= cropArea.y && y <= cropArea.y + cropArea.height) canvas.style.cursor = 'move';
      else canvas.style.cursor = 'default';
    }
    if (!isDragging) return;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (dragType === 'resize') {
      const MIN = 32;
      setCropArea(prev => {
        let nx = prev.x, ny = prev.y, nw = prev.width, nh = prev.height;
        switch (activeHandle) {
          case 'nw':
            nx = prev.x + deltaX;
            ny = prev.y + deltaY;
            nw = prev.width - deltaX;
            nh = prev.height - deltaY;
            break;
          case 'ne':
            ny = prev.y + deltaY;
            nw = prev.width + deltaX;
            nh = prev.height - deltaY;
            break;
          case 'se':
            nw = prev.width + deltaX;
            nh = prev.height + deltaY;
            break;
          case 'sw':
            nx = prev.x + deltaX;
            nw = prev.width - deltaX;
            nh = prev.height + deltaY;
            break;
        }
        // حد أدنى
        nw = Math.max(MIN, nw);
        nh = Math.max(MIN, nh);
        // إبقاء داخل الكانفس
        const maxW = canvasRef.current!.width;
        const maxH = canvasRef.current!.height;
        if (nx < 0) { nw += nx; nx = 0; }
        if (ny < 0) { nh += ny; ny = 0; }
        if (nx + nw > maxW) nw = maxW - nx;
        if (ny + nh > maxH) nh = maxH - ny;
        return { x: nx, y: ny, width: nw, height: nh };
      });
    } else if (dragType === 'crop') {
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
  const handlePointerUp = (e?: React.PointerEvent) => {
    setIsDragging(false);
    setActiveHandle(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
      try { if (e) e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  // تعيين نسبة الأبعاد
  const handleSetAspect = useCallback((ratio: number) => {
    if (!canvasRef.current) return;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;
    let w = cw;
    let h = w / ratio;
    if (h > ch) {
      h = ch;
      w = h * ratio;
    }
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    setCropArea({ x, y, width: w, height: h });
  }, []);

  // حفظ الصورة
  const handleSave = () => {
    if (!image || !canvasRef.current) return;

    const toImage = (px: number, py: number) => {
      const centerX = position.x + (image.width * scale) / 2;
      const centerY = position.y + (image.height * scale) / 2;
      const dx = px - centerX;
      const dy = py - centerY;
      const ix = dx / scale + image.width / 2;
      const iy = dy / scale + image.height / 2;
      return { x: ix, y: iy };
    };

    const x1 = cropArea.x;
    const y1 = cropArea.y;
    const x2 = cropArea.x + cropArea.width;
    const y2 = cropArea.y + cropArea.height;

    const pts = [toImage(x1, y1), toImage(x2, y1), toImage(x2, y2), toImage(x1, y2)];

    let minX = Math.min(...pts.map((p) => p.x));
    let maxX = Math.max(...pts.map((p) => p.x));
    let minY = Math.min(...pts.map((p) => p.y));
    let maxY = Math.max(...pts.map((p) => p.y));

    // Clamp to image bounds
    minX = Math.max(0, Math.min(minX, image.width));
    minY = Math.max(0, Math.min(minY, image.height));
    maxX = Math.max(0, Math.min(maxX, image.width));
    maxY = Math.max(0, Math.min(maxY, image.height));

    const cropW = Math.max(1, Math.round(maxX - minX));
    const cropH = Math.max(1, Math.round(maxY - minY));

    // Create high-quality crop at source resolution
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = cropW;
    finalCanvas.height = cropH;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    if ((ctx as any).imageSmoothingQuality !== undefined) {
      (ctx as any).imageSmoothingQuality = 'high';
    }
    ctx.drawImage(
      image,
      Math.floor(minX),
      Math.floor(minY),
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH
    );

    finalCanvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 pointer-events-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-900 rounded-lg p-4 w-full max-w-md mx-auto max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* العنوان */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">اقتصاص الصورة</h3>
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
              className="w-full h-auto cursor-move border border-gray-600 rounded touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          )}
          
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-yellow-400 text-xs text-center">
              اسحب المقابض لتعديل الاقتصاص أو حرك الصورة لضبط الموقع
            </p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="space-y-3">
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleSetAspect(image ? image.width / image.height : 1)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              أصلي
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSetAspect(1)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <Square size={16} className="mr-1" />
              1:1
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSetAspect(4 / 3)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              4:3
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSetAspect(3 / 4)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              3:4
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSetAspect(16 / 9)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              16:9
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSetAspect(9 / 16)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              9:16
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
              <Check size={16} className="mr-1" />
              حفظ
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageEditor;
```
