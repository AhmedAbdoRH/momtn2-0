import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RotateCw, Crop, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const rotateImage = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const saveImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // Set canvas size based on rotation
    if (rotation % 180 === 0) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    } else {
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
    }

    // Clear and draw rotated image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Convert to blob and save
    canvas.toBlob(blob => {
      if (blob) onSave(blob);
    }, 'image/jpeg', 0.9);
  }, [rotation, onSave]);

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
      onClick={onCancel}
    >
      <div 
        className="bg-card rounded-lg p-6 w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">تعديل الصورة</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="mb-6 flex justify-center">
          <div className="relative bg-muted rounded-lg p-4 max-w-full max-h-64 overflow-hidden">
            <img 
              ref={imageRef}
              src={imageUrl}
              alt="Image to edit"
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            onClick={rotateImage}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-2 h-12"
          >
            <RotateCw size={16} />
            تدوير
          </Button>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 h-12"
            >
              إلغاء
            </Button>
            <Button 
              onClick={saveImage}
              disabled={!isLoaded}
              className="flex-1 h-12 flex items-center justify-center gap-2"
            >
              <Check size={16} />
              حفظ
            </Button>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>,
    document.body
  );
};

export default ImageEditor;