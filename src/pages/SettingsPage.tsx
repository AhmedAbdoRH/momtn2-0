
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ContributorsList } from "../components/ContributorsList";
import { BackgroundSettings } from "../components/BackgroundSettings";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const navigate = useNavigate();
  
  // Apply saved background on component mount to ensure it persists
  useEffect(() => {
    const savedGradient = localStorage.getItem("app-background-gradient");
    if (savedGradient) {
      console.log("SettingsPage: Applying saved gradient:", savedGradient);
      // Dispatch custom event to apply the saved gradient
      const event = new CustomEvent('apply-gradient', { detail: { gradientId: savedGradient } });
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 min-h-screen" style={{ background: 'transparent' }}>
      <div className="flex justify-between items-center mb-8">
        <Button 
          onClick={() => navigate("/")}
          variant="ghost" 
          className="flex items-center gap-2 hover:bg-white/10"
        >
          <Home className="h-5 w-5" />
          <span>الرئيسية</span>
        </Button>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
      </div>
      
      <div className="glass-effect p-8 rounded-2xl shadow-xl backdrop-blur-md">
        <Tabs defaultValue="general" dir="rtl" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-white/10 p-1.5">
            <TabsTrigger value="general" className="text-lg py-2.5">عام</TabsTrigger>
            <TabsTrigger value="background" className="text-lg py-2.5">خلفية التطبيق</TabsTrigger>
            <TabsTrigger value="contributors" className="text-lg py-2.5">لائحة الشكر</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="bg-black/40 p-6 rounded-lg shadow backdrop-blur-md border border-white/10">
              <h2 className="text-2xl font-bold text-right mb-4 text-white">الإعدادات العامة</h2>
              <p className="text-right text-gray-300">
                سيتم إضافة الإعدادات هنا في المستقبل. حالياً لا توجد إعدادات متاحة.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="background">
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
