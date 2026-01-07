import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ContributorsList } from "../components/ContributorsList";
import { BackgroundSettings } from "../components/BackgroundSettings";
import { Button } from "../components/ui/button";
import { ArrowLeft, MessageSquare, User, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load saved greeting message, display name, and avatar
  useEffect(() => {
    if (user) {
      const savedGreeting = localStorage.getItem(`userGreeting_${user.id}`) || 
                         'لحظاتك السعيدة، والنعم الجميلة في حياتك';
      setGreetingMessage(savedGreeting);
      
      // Load display name from database
      loadDisplayName();
      
      // Load avatar URL from user_metadata
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
    }
  }, [user]);

  const loadDisplayName = async () => {
    if (!user) return;
    
    try {
      // First try to get from user_metadata (from auth.users)
      if (user.user_metadata?.full_name) {
        setDisplayName(user.user_metadata.full_name);
        return;
      }
      
      // Fall back to public.users table
      const { data, error } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error || !data?.full_name) {
        // If no record exists, use email prefix as default
        const emailPrefix = user.email?.split('@')[0] || '';
        setDisplayName(emailPrefix);
        // Save this as the display name
        await updateDisplayNameInDatabase(emailPrefix);
        return;
      }

      setDisplayName(data.full_name);
      // Also update auth.users to keep in sync
      await updateUserMetadata(data.full_name);
    } catch (err) {
      console.error('Exception loading display name:', err);
      const emailPrefix = user.email?.split('@')[0] || '';
      setDisplayName(emailPrefix);
    }
  };
  
  const updateUserMetadata = async (fullName: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) {
        console.error('Error updating user metadata:', error);
      }
    } catch (err) {
      console.error('Exception updating user metadata:', err);
    }
  };
  
  const updateDisplayNameInDatabase = async (fullName: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: fullName.trim()
        });
    } catch (err) {
      console.error('Error updating display name in database:', err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { avatarUrl: publicUrl } 
      }));

      toast({
        title: "تم التحديث",
        description: "تم تغيير صورة الملف الشخصي بنجاح"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفع الصورة",
        variant: "destructive"
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleGreetingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGreetingMessage(e.target.value);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const saveGreeting = () => {
    if (user?.id) {
      localStorage.setItem(`userGreeting_${user.id}`, greetingMessage);
      // Notify other components about the greeting update
      window.dispatchEvent(new Event('greetingUpdated'));
      
      toast({
        title: "تم الحفظ",
        description: "تم تحديث رسالة الترحيب بنجاح"
      });
    }
  };

  const saveDisplayName = async () => {
    if (!user?.id) return;
    
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast({
        title: "خطأ",
        description: "يجب كتابة الاسم",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingName(true);
    try {
      // Update in auth.users metadata
      await updateUserMetadata(trimmedName);
      
      // Update in public.users table
      await updateDisplayNameInDatabase(trimmedName);

      // Update the user object in the current session
      const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
        data: { full_name: trimmedName }
      });

      if (updateError) throw updateError;

      // Update local state
      setDisplayName(trimmedName);
      
      // Notify other components about the name update
      window.dispatchEvent(new CustomEvent('displayNameUpdated', { 
        detail: { displayName: trimmedName } 
      }));
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث اسمك الشخصي بنجاح"
      });
    } catch (err) {
      console.error('Exception updating display name:', err);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تحديث الاسم",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  useEffect(() => {
    const savedGradient = localStorage.getItem("app-background-gradient");
    if (savedGradient) {
      const event = new CustomEvent('apply-gradient', { detail: { gradientId: savedGradient } });
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 min-h-screen" style={{ background: 'transparent' }}>
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={() => navigate("/")}
          variant="glass"
          className="flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
          size="lg"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>العودة للرئيسية</span>
        </Button>
        <h1 className="text-3xl font-bold text-gradient">الإعدادات</h1>
      </div>

      <div className="glass-effect p-8 rounded-2xl shadow-xl backdrop-blur-md bg-black/60 border border-white/10">
        <Tabs defaultValue="general" dir="rtl" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-black/30 backdrop-blur-md p-1.5 rounded-lg">
            <TabsTrigger
              value="general"
              className="text-lg py-3 rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-300"
            >
              الإعدادات العامة
            </TabsTrigger>
            <TabsTrigger
              value="contributors"
              className="text-lg py-3 rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-300"
            >
              لائحة الشكر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8">
            {/* Profile Picture Section */}
            <section className="bg-gradient-to-br from-black/60 to-black/40 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
              <h2 className="text-2xl font-semibold mb-6 text-white text-right flex items-center gap-2 justify-end">
                <Camera className="w-6 h-6" />
                صورة الملف الشخصي
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-2 border-white/20">
                    <AvatarImage src={avatarUrl || undefined} alt="صورة الملف الشخصي" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  {isUploadingAvatar ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الرفع...
                    </div>
                  ) : (
                    'تغيير الصورة'
                  )}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  الحد الأقصى للحجم: 5 ميجابايت
                </p>
              </div>
            </section>

            {/* Display Name Section */}
            <section className="bg-gradient-to-br from-black/60 to-black/40 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
              <h2 className="text-2xl font-semibold mb-6 text-white text-right flex items-center gap-2 justify-end">
                <User className="w-6 h-6" />
                اسمك الشخصي
              </h2>
              <div className="space-y-4">
                <div className="text-right">
                  <Label htmlFor="displayName" className="text-white text-sm mb-2 block">
                    الاسم الذي سيظهر في التعليقات والمجموعات
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    className="w-full bg-white/5 border-2 border-white/10 text-white text-lg p-4 hover:border-blue-400/50 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/30 transition-all duration-200 rounded-lg h-auto text-right"
                    placeholder="أدخل اسمك الشخصي..."
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-400 text-right mt-2">
                    إذا تركت هذا الحقل فارغاً، سيتم استخدام "{user?.email?.split('@')[0]}" كاسم افتراضي
                  </p>
                </div>
                <Button 
                  onClick={saveDisplayName}
                  disabled={isUpdatingName}
                  className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 rounded-lg"
                >
                  {isUpdatingName ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري التحديث...
                    </div>
                  ) : (
                    'حفظ الاسم'
                  )}
                </Button>
              </div>
            </section>

            {/* Greeting Message Section */}
            <section className="bg-gradient-to-br from-black/60 to-black/40 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
              <h2 className="text-2xl font-semibold mb-6 text-white text-right flex items-center gap-2 justify-end">
                <MessageSquare className="w-6 h-6" />
                رسالة الترحيب
              </h2>
              <div className="space-y-4">
                <div className="text-right">
                  <Label htmlFor="greeting" className="text-white text-sm mb-2 block">
                    الرسالة التي تظهر في الصفحة الرئيسية
                  </Label>
                  <Input
                    id="greeting"
                    value={greetingMessage}
                    onChange={handleGreetingChange}
                    className="w-full bg-white/5 border-2 border-white/10 text-white text-lg p-4 hover:border-blue-400/50 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/30 transition-all duration-200 rounded-lg h-auto text-right"
                    placeholder="اكتب رسالتك الترحيبية هنا..."
                    dir="rtl"
                  />
                </div>
                <Button 
                  onClick={saveGreeting}
                  className="w-full py-3 text-lg font-bold bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 rounded-lg"
                >
                  حفظ رسالة الترحيب
                </Button>
              </div>
            </section>

            <BackgroundSettings />
          </TabsContent>

          <TabsContent value="contributors">
            <ContributorsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
