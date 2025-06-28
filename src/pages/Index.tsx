
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import PhotoGrid from '@/components/PhotoGrid';
import CreateNewDialog from '@/components/CreateNewDialog';
import { SettingsDropdown } from '@/components/SettingsDropdown';
import GroupsDropdown from '@/components/GroupsDropdown';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Menu, X, Users } from 'lucide-react';
import { BackgroundSettings } from '@/components/BackgroundSettings';
import { HeartSoundProvider } from '@/components/HeartSound';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleGroupChange = (groupId: string | null) => {
    setSelectedGroupId(groupId);
  };

  return (
    <HeartSoundProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <BackgroundSettings />
          
          {/* Header */}
          <div className="relative z-30 flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger asChild>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-white hover:bg-white/20"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SidebarTrigger>
              
              {selectedGroupId ? (
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  <span className="text-lg font-medium">مجموعة</span>
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-white">صوري</h1>
              )}
            </div>

            <div className="flex items-center gap-2">
              <CreateNewDialog 
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onPhotoAdded={() => {
                  window.dispatchEvent(new CustomEvent('photo-added'));
                }}
              />
              <SettingsDropdown />
            </div>
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <Sidebar 
              side="right" 
              className="border-l border-white/20 bg-black/40 backdrop-blur-xl"
            >
              <SidebarContent className="p-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white text-right mb-6">المجموعات</h2>
                  
                  <GroupsDropdown 
                    selectedGroupId={selectedGroupId}
                    onGroupChange={handleGroupChange}
                  />
                  
                  <div className="border-t border-white/20 pt-6">
                    <h3 className="text-lg font-semibold text-white text-right mb-4">الألبومات</h3>
                    <div id="hashtags-container"></div>
                  </div>
                </div>
              </SidebarContent>
            </Sidebar>
          )}

          {/* Main Content */}
          <div className="relative z-10">
            <PhotoGrid 
              closeSidebar={closeSidebar} 
              selectedGroupId={selectedGroupId}
            />
          </div>

          <Toaster />
        </div>
      </SidebarProvider>
    </HeartSoundProvider>
  );
};

export default Index;
