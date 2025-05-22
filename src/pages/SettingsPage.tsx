
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ContributorsList } from "../components/ContributorsList";
import { BackgroundSettings } from "../components/BackgroundSettings";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

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
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold text-right mb-6">الإعدادات</h1>
      
      <Tabs defaultValue="general" dir="rtl" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="background">خلفية التطبيق</TabsTrigger>
          <TabsTrigger value="contributors">لائحة الشكر</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-right mb-4">الإعدادات العامة</h2>
            <p className="text-right text-gray-600">
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
  );
};

export default SettingsPage;

