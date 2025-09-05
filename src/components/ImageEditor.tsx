import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RotateCw, Check, X } from 'lucide-react';
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

  useEffect(() => {
    // Prevent scrolling on background
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleSave = () => {
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
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 touch-manipulation"
      style={{ 
        zIndex: 2147483647,
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      onClick={handleBackdropClick}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-sm mx-auto shadow-2xl border border-gray-200"
        onClick={handleModalClick}
        style={{ 
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">تعديل الصورة</h3>
          <button 
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Image Preview */}
        <div className="mb-6 flex justify-center">
          <div className="relative bg-gray-100 rounded-xl p-4 max-w-full max-h-64 overflow-hidden border">
            <img 
              ref={imageRef}
              src={imageUrl}
              alt="معاينة الصورة"
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={handleRotate}
            disabled={!isLoaded}
            className="w-full h-12 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ touchAction: 'manipulation' }}
          >
            <RotateCw size={18} />
            تدوير
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleCancel}
              className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              إلغاء
            </button>
            <button 
              onClick={handleSave}
              disabled={!isLoaded}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: 'manipulation' }}
            >
              <Check size={18} />
              حفظ
            </button>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>,
    document.body
  );
};

export default ImageEditor;