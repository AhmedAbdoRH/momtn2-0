
import { useEffect, useState } from "react";

const HeartSound = () => {
  const [audio] = useState(() => new Audio("/heart-sound.mp3"));

  const playSound = () => {
    audio.currentTime = 0;
    audio.play().catch(err => console.error("Error playing sound:", err));
  };

  useEffect(() => {
    // تسجيل وظيفة تشغيل الصوت على نافذة المتصفح
    window.playHeartSound = playSound;
    
    // تنظيف عند تفكيك المكون
    return () => {
      // @ts-ignore - إزالة الوظيفة من نافذة المتصفح
      delete window.playHeartSound;
    };
  }, []);

  return null;
};

export default HeartSound;
