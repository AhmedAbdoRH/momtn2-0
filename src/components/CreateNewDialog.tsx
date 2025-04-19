import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../utils/supabaseClient';

interface PhotoData {
  user_id: string;
  image_url: string;
  hashtags: string[];
  created_at: string;
}

const PhotoUploadForm = () => {
  const user = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // جلب اقتراحات الألبومات عند تحميل المكون
  useEffect(() => {
    fetchAlbumSuggestions();
  }, [user]);

  const fetchAlbumSuggestions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("hashtags")
        .not("hashtags", "is", null);

      if (error) throw error;

      const allAlbumNames = data.flatMap((item) => item.hashtags || []).filter(Boolean);
      const uniqueAlbumNames = [...new Set(allAlbumNames)].sort();
      setSuggestions(uniqueAlbumNames);
    } catch (error) {
      console.error("Error fetching album suggestions:", error);
    }
  };

  const resetFormState = () => {
    setImage(null);
    setPreviewUrl("");
    setAlbumName("");
    setShowSuggestions(false);
    setIsSubmitting(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    } else {
      setImage(null);
      setPreviewUrl("");
    }
  };

  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAlbumName(value);
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAlbumName(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الصحة
    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }
    
    if (!image) {
      alert('يرجى اختيار صورة');
      return;
    }

    if (!albumName.trim()) {
      alert('يرجى إدخال اسم الألبوم أو الهاشتاجات');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. تحضير اسم الملف
      const fileExt = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;

      // 2. رفع الصورة إلى التخزين
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. الحصول على رابط الصورة
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // 4. تقسيم الهاشتاجات (يمكن إدخالها مفصولة بفواصل)
      const hashtags = albumName.split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      // 5. تحضير بيانات الصورة
      const photoData: PhotoData = {
        user_id: user.id,
        image_url: publicUrl,
        hashtags,
        created_at: new Date().toISOString()
      };

      // 6. حفظ البيانات في قاعدة البيانات
      const { error: insertError } = await supabase
        .from('photos')
        .insert(photoData);

      if (insertError) throw insertError;

      // 7. إعادة تعيين الحالة
      resetFormState();
      alert('تم رفع الصورة بنجاح!');
      fetchAlbumSuggestions(); // تحديث الاقتراحات

    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(`حدث خطأ أثناء رفع الصورة: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="photo-upload-container">
      <h2>رفع صورة جديدة</h2>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="image-upload" className="upload-label">
            اختر صورة
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
            className="file-input"
          />
          {previewUrl && (
            <div className="image-preview">
              <img 
                src={previewUrl} 
                alt="معاينة الصورة" 
                className="preview-image"
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="album-name">الهاشتاجات (مفصولة بفواصل)</label>
          <input
            id="album-name"
            type="text"
            value={albumName}
            onChange={handleAlbumChange}
            disabled={isSubmitting}
            placeholder="مثال: #مناسبات, #عائلة, #أصدقاء"
            className="album-input"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-container">
              {suggestions.map((suggestion) => (
                <div 
                  key={suggestion}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!image || !albumName.trim() || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              جاري الرفع...
            </>
          ) : (
            'رفع الصورة'
          )}
        </button>
      </form>

      <style jsx>{`
        .photo-upload-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
        }
        
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        label {
          font-weight: bold;
          color: #444;
        }
        
        .file-input, .album-input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        
        .image-preview {
          margin-top: 10px;
          text-align: center;
        }
        
        .preview-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 5px;
          border: 1px solid #eee;
        }
        
        .suggestions-container {
          border: 1px solid #ddd;
          border-radius: 5px;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .suggestion-item {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        
        .suggestion-item:hover {
          background-color: #f0f0f0;
        }
        
        .submit-button {
          padding: 12px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .submit-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid white;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PhotoUploadForm;