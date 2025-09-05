import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RotateCw, Crop, Check, X } from 'lucide-react';
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
  const [dragType, setDragType] = useState<'move' | 'crop' | 'resize'>('move');
  const [activeHandle, setActiveHandle] = useState<'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setIsLoading(false);
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

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !image || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = containerRef.current.clientWidth - 40;
    const containerHeight = Math.min(400, window.innerHeight * 0.4);
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    const centerX = position.x + (image.width * scale) / 2;
    const centerY = position.y + (image.height * scale) / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();

    if (isCropMode) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      const handles = [
        { x: cropArea.x, y: cropArea.y, type: 'nw' },
        { x: cropArea.x + cropArea.width, y: cropArea.y, type: 'ne' },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, type: 'se' },
        { x: cropArea.x, y: cropArea.y + cropArea.height, type: 'sw' },
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y, type: 'n' },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2, type: 'e' },
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height, type: 's' },
        { x: cropArea.x, y: cropArea.y + cropArea.height / 2, type: 'w' }
      ];

      ctx.fillStyle = '#ffffff';
      const handleSize = 20;
      handles.forEach(handle => {
        ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      });
    }
  }, [image, rotation, scale, position, isCropMode, cropArea]);

  useEffect(() => {
    if (image) requestAnimationFrame(drawCanvas);
  }, [drawCanvas, image]);

  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  const getHandleUnderCursor = (x: number, y: number): ('nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | null) => {
    const handles = {
      nw: { x: cropArea.x, y: cropArea.y },
      ne: { x: cropArea.x + cropArea.width, y: cropArea.y },
      se: { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      sw: { x: cropArea.x, y: cropArea.y + cropArea.height },
      n: { x: cropArea.x + cropArea.width / 2, y: cropArea.y },
      e: { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2 },
      s: { x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height },
      w: { x: cropArea.x, y: cropArea.y + cropArea.height / 2 },
    } as const;

    const touchSize = 40;
    for (const key of Object.keys(handles) as Array<'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'>) {
      const hx = handles[key].x;
      const hy = handles[key].y;
      if (x >= hx - touchSize / 2 && x <= hx + touchSize / 2 && y >= hy - touchSize / 2 && y <= hy + touchSize / 2) {
        return key;
      }
    }
    return null;
  };

  const handleCanvasInteraction = (e: React.TouchEvent | React.MouseEvent, type: 'start' | 'move' | 'end') => {
    if (!canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0 && type !== 'end') return;
      if (type === 'end' || e.touches.length === 0) {
        clientX = 0;
        clientY = 0;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (type === 'start') {
      let nextDragType: 'move' | 'crop' | 'resize' = 'move';
      let shouldStartDrag = false;

      if (isCropMode) {
        const handle = getHandleUnderCursor(x, y);
        if (handle) {
          setActiveHandle(handle);
          nextDragType = 'resize';
          shouldStartDrag = true;
        } else if (
          x >= cropArea.x && x <= cropArea.x + cropArea.width &&
          y >= cropArea.y && y <= cropArea.y + cropArea.height
        ) {
          nextDragType = 'crop';
          shouldStartDrag = true;
        }
      } else {
        nextDragType = 'move';
        shouldStartDrag = true;
      }

      if (shouldStartDrag) {
        setIsDragging(true);
        setDragType(nextDragType);
        setDragStart({ x, y });
      }
    } else if (type === 'move' && isDragging) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      if (dragType === 'resize' && isCropMode) {
        const MIN = 32;
        setCropArea(prev => {
          let nx = prev.x, ny = prev.y, nw = prev.width, nh = prev.height;
          switch (activeHandle) {
            case 'nw': nx += deltaX; ny += deltaY; nw -= deltaX; nh -= deltaY; break;
            case 'ne': ny += deltaY; nw += deltaX; nh -= deltaY; break;
            case 'se': nw += deltaX; nh += deltaY; break;
            case 'sw': nx += deltaX; nw -= deltaX; nh += deltaY; break;
            case 'n': ny += deltaY; nh -= deltaY; break;
            case 'e': nw += deltaX; break;
            case 's': nh += deltaY; break;
            case 'w': nx += deltaX; nw -= deltaX; break;
          }
          nw = Math.max(MIN, nw);
          nh = Math.max(MIN, nh);
          const maxW = canvasRef.current!.width;
          const maxH = canvasRef.current!.height;
          if (nx < 0) { nw += nx; nx = 0; }
          if (ny < 0) { nh += ny; ny = 0; }
          if (nx + nw > maxW) nw = maxW - nx;
          if (ny + nh > maxH) nh = maxH - ny;
          return { x: nx, y: ny, width: nw, height: nh };
        });
      } else if (dragType === 'crop' && isCropMode) {
        setCropArea(prev => ({
          ...prev,
          x: Math.max(0, Math.min(prev.x + deltaX, canvasRef.current!.width - prev.width)),
          y: Math.max(0, Math.min(prev.y + deltaY, canvasRef.current!.height - prev.height))
        }));
      } else if (!isCropMode && dragType === 'move') {
        setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      }
      setDragStart({ x, y });
    } else if (type === 'end') {
      setIsDragging(false);
      setActiveHandle(null);
    }
  };

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleCropToggle = useCallback(() => {
    if (isCropMode) {
      setIsCropMode(false);
    } else {
      setIsCropMode(true);
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
  }, [isCropMode]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx || !image) return;

    if (isCropMode) {
      // Apply crop
      const scaleX = image.width / canvasRef.current.width;
      const scaleY = image.height / canvasRef.current.height;
      
      finalCanvas.width = cropArea.width * scaleX;
      finalCanvas.height = cropArea.height * scaleY;
      
      finalCtx.save();
      finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
      finalCtx.rotate((rotation * Math.PI) / 180);
      finalCtx.drawImage(
        image,
        (cropArea.x - position.x) * scaleX / scale,
        (cropArea.y - position.y) * scaleY / scale,
        cropArea.width * scaleX / scale,
        cropArea.height * scaleY / scale,
        -finalCanvas.width / 2,
        -finalCanvas.height / 2,
        finalCanvas.width,
        finalCanvas.height
      );
      finalCtx.restore();
    } else {
      // Just apply rotation
      finalCanvas.width = image.width;
      finalCanvas.height = image.height;
      finalCtx.save();
      finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
      finalCtx.rotate((rotation * Math.PI) / 180);
      finalCtx.drawImage(image, -image.width / 2, -image.height / 2);
      finalCtx.restore();
    }

    finalCanvas.toBlob(blob => { if (blob) onSave(blob); }, 'image/jpeg', 0.9);
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-gray-900 rounded-lg p-4 w-full max-w-md mx-auto max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
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
        
        <div 
          ref={containerRef} 
          className="bg-gray-800 rounded-lg p-2 mb-4 relative overflow-hidden" 
          style={{ minHeight: '250px', maxHeight: '400px' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-white">جاري التحميل...</div>
          ) : (
            <canvas 
              ref={canvasRef} 
              className="w-full h-auto border border-gray-600 rounded cursor-pointer"
              style={{ touchAction: 'none' }}
              onMouseDown={(e) => handleCanvasInteraction(e, 'start')}
              onMouseMove={(e) => handleCanvasInteraction(e, 'move')}
              onMouseUp={(e) => handleCanvasInteraction(e, 'end')}
              onMouseLeave={(e) => handleCanvasInteraction(e, 'end')}
              onTouchStart={(e) => handleCanvasInteraction(e, 'start')}
              onTouchMove={(e) => handleCanvasInteraction(e, 'move')}
              onTouchEnd={(e) => handleCanvasInteraction(e, 'end')}
              onTouchCancel={(e) => handleCanvasInteraction(e, 'end')}
            />
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRotate} 
              disabled={isCropMode} 
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              <RotateCw size={16} className="ml-1" /> تدوير
            </Button>
            <Button 
              variant={isCropMode ? 'default' : 'outline'} 
              onClick={handleCropToggle} 
              className={`flex-1 touch-manipulation ${
                isCropMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
              }`}
              style={{ minHeight: '44px' }}
            >
              {isCropMode ? <Check size={16} className="ml-1" /> : <Crop size={16} className="ml-1" />}
              {isCropMode ? 'تطبيق' : 'قص'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              <Check size={16} className="ml-1" /> حفظ
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageEditor;