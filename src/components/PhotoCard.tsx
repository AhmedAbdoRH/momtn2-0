import { useState, useEffect } from "react"; // Added useEffect
import { GripVertical, Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "./ui/dialog";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
  caption?: string;
  album?: string; // تغيير من مصفوفة هاشتاجات إلى سلسلة ألبوم واحدة
  onDelete?: () => void;
  dragHandleProps?: any;
  onUpdateCaption?: (caption: string, album: string) => Promise<void>; // تحديث الواجهة لقبول ألبوم بدلاً من هاشتاجات
}

const PhotoCard = ({
  imageUrl,
  likes: initialLikes,
  caption: initialCaption = '',
  album: initialAlbum = '', // قيمة افتراضية فارغة للألبوم
  onDelete,
  dragHandleProps,
  onUpdateCaption
}: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [album, setAlbum] = useState(initialAlbum); // حالة للألبوم بدلاً من الهاشتاجات
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // --- Start: State and Logic for Album Suggestions ---
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchAlbumSuggestions = async () => {
    // Fetches unique values from 'hashtags' column assuming it might contain album names
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("hashtags") // Still using 'hashtags' column as per original code
        .not("hashtags", "is", null);

      if (error) throw error;

      // Assuming hashtags is an array in the DB, flatten and get unique, non-empty strings
      const allAlbumNames = data.flatMap((item) => item.hashtags || []).filter(Boolean);
      const uniqueAlbumNames = [...new Set(allAlbumNames)].sort();
      setSuggestions(uniqueAlbumNames);
    } catch (error) {
      console.error("Error fetching album suggestions:", error);
      setSuggestions([]); // Reset on error
    }
  };

  // Fetch suggestions when the editing dialog opens
  useEffect(() => {
    if (isEditing) {
      fetchAlbumSuggestions();
      // Pre-populate state when opening edit dialog
      setCaption(initialCaption);
      setAlbum(initialAlbum);
    } else {
      // Reset suggestions state when dialog closes
      setShowSuggestions(false);
      // Optionally clear suggestions if they might change frequently: setSuggestions([])
    }
  }, [isEditing, initialCaption, initialAlbum]); // Added initialCaption and initialAlbum dependencies


  // Handle changes in the album input field
  const handleAlbumInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAlbum(value); // Update the album state
    // Show suggestions if there are any and the input is not empty
    setShowSuggestions(suggestions.length > 0);
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setAlbum(suggestion);
    setShowSuggestions(false);
  };

  // Filter suggestions based on current input
  const filteredSuggestions = album
    ? suggestions.filter((suggestion) =>
        typeof suggestion === "string" &&
        suggestion.toLowerCase().includes(album.toLowerCase())
      )
    : suggestions; // Show all suggestions if input is empty or handle as needed

  // --- End: State and Logic for Album Suggestions ---


  const handleLike = async () => {
    setIsHeartAnimating(true);
    const newLikeCount = likes + 1;
    setLikes(newLikeCount);
    setIsLoved(true);

    const { error } = await supabase
      .from('photos')
      .update({ likes: newLikeCount })
      .eq('image_url', imageUrl);

    if (error) {
      console.error('Error updating likes:', error);
      // Revert optimistic update on error
      setLikes(likes);
      setIsLoved(false); // Revert loved state too
    }

    setTimeout(() => {
      setIsHeartAnimating(false);
      // Note: isLoved state might be better tied to actual like status from DB
      // For this UI effect, we reset it after animation.
      setIsLoved(false);
    }, 1000);
  };

  const handleCaptionSubmit = async () => {
    if (onUpdateCaption) {
      // Pass the current caption and album state
      await onUpdateCaption(caption, album);
    }
    setIsEditing(false); // Close dialog after submit
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  // Reset local state if editing is cancelled
  const handleCancelEdit = () => {
      setIsEditing(false);
      // Reset caption and album to initial values when cancelling
      setCaption(initialCaption);
      setAlbum(initialAlbum);
  };


  return (
    <>
      <div
        className="relative group overflow-hidden rounded-xl shadow-xl transition-all duration-300"
        onClick={toggleControls}
      >
        {/* Image and Gradient Overlay */}
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt={caption || "Gallery image"} // Added alt text
            className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none' // Control visibility and interaction
          }`} />
        </div>

        {/* Controls visible on hover/click */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none' // Controls container visibility
          }`}>

            {/* Drag Handle */}
            <div
              {...dragHandleProps}
              className={`absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm cursor-move opacity-50 hover:opacity-100 transition-opacity`}
            >
              <GripVertical className="w-4 h-4 text-white" />
            </div>

            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent toggleControls
                setIsEditing(true);
              }}
              className={`absolute top-2 left-2 p-2 rounded-full bg-black/20 backdrop-blur-sm opacity-50 hover:opacity-100 transition-opacity`}
              aria-label="Edit caption and album" // Accessibility
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </button>

            {/* Delete Button */}
             {onDelete && ( // Conditionally render delete button
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent toggleControls
                  onDelete?.();
                }}
                className={`absolute bottom-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm opacity-50 hover:bg-red-500/50 hover:opacity-100 transition-opacity`}
                aria-label="Delete photo" // Accessibility
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
             )}


            {/* Like Button and Count */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent toggleControls
                  handleLike();
                }}
                className="relative group flex items-center gap-2 text-white/90 hover:text-white transition-colors p-1 rounded-full bg-black/20 backdrop-blur-sm" // Added background for visibility
                aria-label="Like photo" // Accessibility
              >
                <div className="relative">
                  <Heart
                    className={`w-5 h-5 transition-all duration-300 transform ${ // Adjusted size slightly
                      isLoved ? "fill-[#ea384c] text-[#ea384c] scale-125" : "hover:scale-110"
                    }`}
                  />
                  {isHeartAnimating && (
                    <div className="absolute inset-0 animate-ping">
                      <Heart className="w-5 h-5 text-[#ea384c]/30" />
                    </div>
                  )}
                </div>
              </button>
              <span className="text-xs font-medium bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-md text-white/90"> {/* Adjusted padding/size */}
                {likes}
              </span>
            </div>

             {/* Caption and Album Display */}
            {(caption || album) && (
              <div className={`absolute left-2 right-2 bottom-14 p-2 bg-black/50 backdrop-blur-md rounded-lg text-sm text-white`}>
                {caption && <p className="mb-1">{caption}</p>}
                {album && (
                  <div className="flex flex-wrap gap-1 mt-1">
                     <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded"> {/* Styled album tag */}
                       #{album} {/* Display album name */}
                     </span>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* --- Edit Dialog --- */}
      <Dialog open={isEditing} onOpenChange={(open) => {
          if (!open) {
             handleCancelEdit(); // Use cancel handler to reset state
          }
          setIsEditing(open);
      }}>
        <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-0 sm:max-w-[425px]"> {/* Added max-width */}
          <div className="space-y-4 p-2"> {/* Added padding */}
             <h3 className="text-lg font-medium leading-6 text-white mb-4">تعديل الصورة</h3> {/* Added Title */}
            <div>
              <label htmlFor={`caption-${imageUrl}`} className="block text-sm font-medium mb-1">التعليق</label> {/* Unique htmlFor */}
              <textarea
                id={`caption-${imageUrl}`} // Unique ID
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white focus:ring-1 focus:ring-white/50 outline-none" // Added focus style
                rows={3}
                placeholder="أضف تعليقاً..."
              />
            </div>

            {/* --- Start: Album Input with Suggestions --- */}
            <div className="relative"> {/* Added relative positioning for suggestions */}
              <label htmlFor={`album-${imageUrl}`} className="block text-sm font-medium mb-1">الألبوم</label> {/* Unique htmlFor */}
              <input
                id={`album-${imageUrl}`} // Unique ID
                type="text"
                value={album}
                onChange={handleAlbumInputChange} // Use the new handler
                onFocus={() => setShowSuggestions(suggestions.length > 0)} // Show suggestions on focus
                 // Hide suggestions on blur with a delay to allow click on suggestion
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white focus:ring-1 focus:ring-white/50 outline-none" // Added focus style
                placeholder="اسم الألبوم (اختياري)"
                autoComplete="off" // Disable browser autocomplete
                aria-haspopup="listbox"
                aria-expanded={showSuggestions && filteredSuggestions.length > 0}
              />
              {/* Suggestions List */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  role="listbox"
                  aria-label="Album suggestions"
                  className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-md shadow-lg text-right suggestions-list" // Adjusted style for dialog
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      role="option"
                      aria-selected="false"
                      className="px-3 py-2 cursor-pointer hover:bg-white/20 suggestion-item text-sm" // Adjusted style
                      // Use onMouseDown to prevent blur event from firing before click
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleSuggestionClick(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* --- End: Album Input with Suggestions --- */}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4"> {/* Adjusted gap and padding */}
              <button
                type="button" // Ensure it's not submitting a form
                onClick={handleCancelEdit} // Use the cancel handler
                className="px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button" // Ensure it's not submitting a form
                onClick={handleCaptionSubmit}
                className="px-4 py-2 rounded-md bg-[#ea384c]/80 backdrop-blur-sm text-white hover:bg-[#ea384c] transition-colors" // Changed color for primary action
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCard;
