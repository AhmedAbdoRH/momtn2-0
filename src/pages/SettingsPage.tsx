import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ContributorsList } from "../components/ContributorsList";
import { BackgroundSettings } from "../components/BackgroundSettings";
import { Button } from "../components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../hooks/use-toast";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [greetingMessage, setGreetingMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load saved greeting message
  useEffect(() => {
    if (user) {
      const savedGreeting = localStorage.getItem(`userGreeting_${user.id}`) || 
                         'لحظاتك السعيدة، والنعم الجميلة في حياتك';
      setGreetingMessage(savedGreeting);
    }
  }, [user]);

  const handleGreetingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGreetingMessage(e.target.value);
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
            <section className="bg-gradient-to-br from-black/60 to-black/40 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
              <h2 className="text-2xl font-semibold mb-6 text-white text-right">تخصيص رسالة الترحيب</h2>
              <div className="space-y-4">
                <Input
                  id="greeting"
                  value={greetingMessage}
                  onChange={handleGreetingChange}
                  className="w-full bg-white/5 border-2 border-white/10 text-white text-lg p-4 hover:border-blue-400/50 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/30 transition-all duration-200 rounded-lg h-auto"
                  placeholder="اكتب رسالتك الترحيبية هنا..."
                />
                <Button 
                  onClick={saveGreeting}
                  className="w-full py-3 text-lg font-bold bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 rounded-lg"
                >
                  حفظ التغييرات
                </Button>
              </div>
            </section>

            <section className="bg-black/50 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 text-white text-right">خلفية التطبيق</h2>
              <BackgroundSettings />
            </section>
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