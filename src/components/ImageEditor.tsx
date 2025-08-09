import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { RotateCw, Crop, Check, X, Loader2 } from 'lucide-react';

// Helper component for a more polished button
const ActionButton = ({ icon: Icon, label, onClick, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ease-in-out w-20 h-20
                bg-gray-700/50 hover:bg-gray-700/80 text-gray-300 hover:text-white
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50 ${className}`}
  >
    <Icon size={24} />
    <span className="mt-1 text-xs font-medium">{label}</span>
  </button>
);

// Main Image Editor Component
const ImageEditor = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const imageRef = useRef(null);
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const cropRectRef = useRef(null);

  // --- Canvas Initialization ---
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize the Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#111827', // Dark background
      selection: false, // Disable group selection
    });
    fabricCanvasRef.current = canvas;

    // Load the image from the URL
    fabric.Image.fromURL(imageUrl, (img) => {
      imageRef.current = img;
      // Center and scale the image to fit the canvas view
      const container = canvasRef.current.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      canvas.setWidth(containerWidth);
      canvas.setHeight(containerHeight);
      
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height) * 0.9;
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (containerWidth - img.width * scale) / 2,
        top: (containerHeight - img.height * scale) / 2,
        selectable: !isCropping, // Make image selectable only when not cropping
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hasControls: false,
        hasBorders: false,
      });

      canvas.add(img);
      canvas.renderAll();
      setIsLoading(false);
    }, { crossOrigin: 'anonymous' }); // CORS setting for cross-domain images

    // Handle window resizing
    const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.renderAll();
    });
    resizeObserver.observe(canvasRef.current.parentElement);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
    };
  }, [imageUrl]); // Rerun effect if imageUrl changes

  // --- Cropping Mode Logic ---
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !imageRef.current) return;

    // Toggle image selectability based on cropping state
    imageRef.current.set('selectable', !isCropping);
    canvas.discardActiveObject();

    if (isCropping) {
      // Enter cropping mode
      let startPoint = null;
      canvas.defaultCursor = 'crosshair';

      const onMouseDown = (o) => {
        startPoint = canvas.getPointer(o.e);
        // Remove previous crop rectangle if it exists
        if (cropRectRef.current) {
            canvas.remove(cropRectRef.current);
        }
        // Create a new crop rectangle
        const rect = new fabric.Rect({
          left: startPoint.x,
          top: startPoint.y,
          width: 0,
          height: 0,
          fill: 'rgba(107, 114, 128, 0.5)', // Semi-transparent fill
          stroke: '#f9fafb', // White border
          strokeWidth: 2,
          strokeDashArray: [5, 5], // Dashed line
          selectable: false,
        });
        cropRectRef.current = rect;
        canvas.add(rect);
      };

      const onMouseMove = (o) => {
        if (!startPoint) return;
        const currentPoint = canvas.getPointer(o.e);
        
        // Calculate dimensions ensuring positive width/height
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);
        const left = Math.min(startPoint.x, currentPoint.x);
        const top = Math.min(startPoint.y, currentPoint.y);

        cropRectRef.current.set({ left, top, width, height });
        canvas.renderAll();
      };

      const onMouseUp = () => {
        startPoint = null;
      };

      // Add event listeners for drawing
      canvas.on('mouse:down', onMouseDown);
      canvas.on('mouse:move', onMouseMove);
      canvas.on('mouse:up', onMouseUp);

      // Cleanup listeners when exiting cropping mode
      return () => {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', onMouseUp);
        canvas.defaultCursor = 'default';
        if (cropRectRef.current) {
          canvas.remove(cropRectRef.current);
          cropRectRef.current = null;
        }
      };
    }
  }, [isCropping]);


  // --- Action Handlers ---

  const handleRotate = () => {
    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Rotate the image by 90 degrees around its center
    const currentAngle = image.angle || 0;
    image.rotate(currentAngle + 90);
    canvas.centerObject(image); // Recenter after rotation
    canvas.renderAll();
  };

  const handleApplyCrop = () => {
    const canvas = fabricCanvasRef.current;
    const cropRect = cropRectRef.current;
    if (!canvas || !cropRect || cropRect.width === 0 || cropRect.height === 0) {
        setIsCropping(false); // Exit if crop area is invalid
        return;
    }

    // Create a data URL of the cropped area
    const dataURL = canvas.toDataURL({
      left: cropRect.left,
      top: cropRect.top,
      width: cropRect.width,
      height: cropRect.height,
      format: 'png',
    });
    
    // Replace the old image with the new cropped one
    fabric.Image.fromURL(dataURL, (newImg) => {
        canvas.remove(imageRef.current);
        canvas.remove(cropRect);
        
        imageRef.current = newImg;
        
        // Center the new cropped image
        canvas.centerObject(newImg);
        
        // Scale it to fit if it's too large
        const scale = Math.min(canvas.width / newImg.width, canvas.height / newImg.height) * 0.9;
        newImg.scale(scale);

        canvas.add(newImg);
        canvas.renderAll();
    });

    setIsCropping(false);
  };

  const handleSave = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Generate a high-quality data URL of the entire canvas
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
    });
    
    // Convert to Blob and call the onSave callback
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => {
        onSave(blob);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 font-sans">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-2">
        <h3 className="text-white text-xl font-bold">تعديل الصورة</h3>
        <button
          onClick={onCancel}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl h-[65vh] bg-gray-900 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
            <Loader2 size={48} className="text-indigo-400 animate-spin" />
            <p className="text-white mt-4">...جاري تحميل الصورة</p>
          </div>
        )}
        <div className="w-full h-full">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="w-full max-w-4xl mt-4 p-3 bg-gray-800/50 backdrop-blur-md rounded-xl flex items-center justify-between">
        {/* Main Actions */}
        <div className="flex gap-3">
          <ActionButton label="تدوير" icon={RotateCw} onClick={handleRotate} disabled={isCropping} />
          <ActionButton label="قص" icon={Crop} onClick={() => setIsCropping(true)} disabled={isCropping} />
        </div>

        {/* Crop-specific Actions */}
        {isCropping && (
          <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-lg">
            <p className="text-white text-sm mr-2">حدد منطقة القص</p>
            <button
              onClick={() => setIsCropping(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
            >
              <X size={18}/> إلغاء
            </button>
            <button
              onClick={handleApplyCrop}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              <Check size={18}/> تطبيق القص
            </button>
          </div>
        )}

        {/* Save/Cancel Actions */}
        {!isCropping && (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-2"
            >
              <Check size={20} />
              حفظ التعديلات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Example Usage ---
// This is a placeholder App to demonstrate the ImageEditor.
// In a real application, you would import and use ImageEditor where needed.
const App = () => {
  const [editorVisible, setEditorVisible] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState(null);

  // A sample image URL. Replace with your actual image source.
  const originalImageUrl = 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=1887&auto=format&fit=crop';
  
  const handleSave = (imageBlob) => {
    // Create a URL from the blob to display the edited image
    const url = URL.createObjectURL(imageBlob);
    setEditedImageUrl(url);
    console.log('Image saved!', imageBlob);
    setEditorVisible(false); // Close the editor on save
  };

  const handleCancel = () => {
    setEditorVisible(false);
    console.log('Editing cancelled.');
  };

  return (
    <div className="bg-gray-800 text-white min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Image Editor Demo</h1>
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-center">
        <p className="mb-4">Click the button to open the image editor.</p>
        <button
          onClick={() => setEditorVisible(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Open Editor
        </button>

        {editedImageUrl && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h2 className="text-xl font-semibold mb-4">Last Saved Image:</h2>
            <img 
              src={editedImageUrl} 
              alt="Edited result" 
              className="max-w-sm mx-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {editorVisible && (
        <ImageEditor
          imageUrl={originalImageUrl}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default App;


