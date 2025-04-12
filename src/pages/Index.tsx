import {:

```tsx
import { Plus, Menu Plus, Menu, Log, LogOut, User } from "lucide-react";
import PhotoOut, User } from "lucide-react";
import PhotoGrid from "@/Grid from "@/components/components/PhotoGrid";
import { ButtonPhotoGrid";
import { Button } from "@/components/ui/button } from "@/components/ui/button";
import CreateNewDialog";
import CreateNewDialog from "@/components/Create from "@/components/CreateNewDialog";
import { useNewDialog";
import { useState } from "reactState } from "react";
import { use";
import { useAuth } from "@/components/AuthAuth } from "@/components/AuthProvider";
import {
Provider";
import {
  DropdownMenu,
  Dropdown  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuMenuContent,
  DropdownMenuItem,
  DropdownItem,
  DropdownMenuTrigger,
}MenuTrigger,
} from "@/components/ui from "@/components/ui/dropdown-menu/dropdown-menu";
import {";
import { Heart HeartSoundProvider } from "@/componentsSoundProvider } from "@/components/Heart/HeartSound";

Sound";

constconst Index = () => {
 Index = () => {
  const [dialog  const [dialogOpen, setDialogOpen, setDialogOpen] = useState(falseOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [btn);
  const [btnAnimation, setBtnAnimation, setBtnAnimation] = useState(falseAnimation] = useState(false);
  const {);
  const { signOut signOut, user, user } = useAuth();
 } = useAuth();


  const handleCreateNew = ()  const handleCreateNew = () => {
    setBtn => {
    setBtnAnimation(true);
    setTimeoutAnimation(true);
    setTimeout(() => setBtn(() => setBtnAnimation(false), 300);
    setDialogOpen(true);
  };

  const toggleSidebar = () => setAnimation(false), 300);
    setDialogOpen(true);
  };

  const toggleSidebar = () => setSidebarOpenSidebarOpen((prev) => !((prev) => !prev);

  returnprev);

  return (
    <Heart (
    <HeartSoundProvider>
      <divSoundProvider>
      <div className="min-h-screen className="min-h-screen bg-background text bg-background text-foreground-foreground">
        {/* زر فتح">
        {/* زر فتح/إغلاق الشريط الجانبي */}
        <Button
          variant="ghost"/إغلاق الشري
          size="icon"ط الجانبي */}
        <
          onButton
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="Click={toggleSidebar}
          className="fixed top-4 right-4fixed top-4 right-4 z-50 glass z-50 glass-effect text-gray-700"
        >
         -effect text-gray-700"
        >
          <Menu className="h-5 w-5 <Menu className="h-5 w-5" />
        </Button" />
        </Button>

        {/* قائمة المستخدم */}
        <div className>

        {/* قائمة المستخدم */}
        <div className="fixed="fixed top-4 left-4 top-4 left-4 z-50">
          <Dropdown z-50">
          <DropdownMenu>
            <DropdownMenu>
            <DropdownMenuTrigger asMenuTrigger asChild>
              <ButtonChild>
              <Button variant="ghost variant="ghost" size="icon" size="icon" class" className="glassName="glass-effect text-gray-effect text-gray-700">
               -700">
                <User class <User className="hName="h-5 w--5 w-5" />
              </Button5" />
              </Button>
            </DropdownMenuTrigger>
            <Dropdown>
            </DropdownMenuTrigger>
            <DropdownMenuContent alignMenuContent align="start"="start" className="w className="w-56 glass-56 glass-effect-effect text-gray text-gray-700 border border-700 border border-border">
-border">
              <div class              <div className="px-2Name="px-2 py-1.5 text-sm font-medium text-gray py-1.5 text-sm font-medium text-gray-600 truncate-600 truncate">{user">{user?.email?.email}</div>
              <Dropdown}</div>
              <DropdownMenuItem
MenuItem
                onClick={sign                onClick={signOut}
                className="Out}
text-red-500 focus                className="text-red-500 focus:text-red-500 cursor-pointer focus:text-red-500 cursor-pointer focus:bg:bg-gray-100-gray-100"
              >
                <Log"
              >
                <LogOut classNameOut className="mr-2 h="mr-2 h-4 w-4 w-4"-4" />
 />
                <span>تس                <span>تسجيل الجيل الخروخروج</ج</span>
              </DropdownMenuItemspan>
              </DropdownMenuItem>
>
            </DropdownMenu            </DropdownMenuContent>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* الشر>
        </div>

        {/* الشريط اليط الجانبجانبي */}
        <div
ي */}
        <div
          className={`fixed top-0 right-0 h-full bg-black          className={`fixed top-0 right-0 h-full bg-black/30 backdrop-blur-md border/30 backdrop-blur-md border-l border-gray-800-l border-gray-800 w-72 w-72 transform transition-transform duration-300 transform transition-transform duration-300 ease-in-out z-40 ease-in-out z-40 flex flex-col ${
            sidebar flex flex-col ${
            sidebarOpen ? "translateOpen ? "translate-x-0"-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex-1 p- : "translate-x-full"
          }`}
        >
          <div className="flex-1 p-6 pt-20">
            <h3 className="text-gray-300 font6 pt-20">
            <h3 className="text-gray-300 font-semibold mb-4 text-right-semibold mb-4 text-right">الألب">الألبومات</hومات</h3>
            <div id="hashtags3>
            <div id="hashtags-container" className="flex flex-col space-container" className="flex flex-col space-y-3 items-end">
             -y-3 items-end">
              {/* هنا سيق {/* هنا سيقوم Photoوم PhotoGrid بGrid بإدإدخال الأزرارخال الأزرار ع عبر createPortal */}
            </بر createPortal */}
            </div>
          </div>
div>
          </div>
        </div>

        {/*        </div>

        {/* طبقة التعت طبقة التعتيم عيم عند فند فتح الشريطتح الشريط الجانبي */}
        { الجانبي */}
        {sidebarOpen && (
         sidebarOpen && (
          <div
            className <div
            className="fixed inset-0 bg="fixed inset-0 bg-black-black/10 backdrop/10 backdrop-blur-sm z-30-blur-sm z-30"
            on"
            onClick={() => setSidebarClick={() => setSidebarOpen(false)}
          />
Open(false)}
          />
        )}

        {/* المحتوى ال        )}

        {/* المحتوى الرئرئيسييسي */}
        */}
        <main <main className className="max-w-="max-w7xl mx-7xl mx-auto px-4 sm:px-6-auto px-4 sm:px-6 lg:px- lg:px-8 py-128 py-12">
          <div className">
          <div className="text-center mb-8">
            <div className="text-center mb-8">
            <div className="inline-block mb-6="inline-block mb-6 w w-40 h-40 h-40 sm:w-48 sm:h-40 sm:w-48 sm:h-48-48">
             ">
              <img <img
               
                src="/lovable-Uploads/f src="/lovable-Uploads39108e3-/f39108e3-15cc-45815cc-458c-bb92c-bb92-7e-76b18e100e6bcc.png"
                alt="Logo18e100cc.png"
                alt="Logo"
                className="w"
                className="w-full h-full-full h-full object-contain animate object-contain animate-float-float"
              />
"
              />
            </div>
            <            </div>
            <p className="text-lgp className="text-lg text-white-300 max-w-2 text-white-300 max-w-2xl mx-auto mbxl mx-auto mb-6">
              ..-6">
              .. لحظ لحظاتك السعيداتك السعيدة، والنعمة، والنعم الجم الجميلة في حيلة في حياتكياتك
            </
            </p>

p>

            <div className="            <div className="relative inlinerelative inline-block">
              <Button
                onClick={-block">
              <Button
                onClick={handleCreateNew}
                className={`handleCreateNew}
                className={`relative pxrelative px-5-5 py-3 py-3 bg-[# bg-[#d94550]d94550] hover:bg-[#d hover:bg-[#d94550]/9094550]/90 text-white shadow text-white shadow-lg rounded-lg mx-lg rounded-lg mx-auto-auto transition-all duration-300 ${
                  transition-all duration-300 ${
                  btnAnimation ? "scale-95 shadow btnAnimation ? "scale-inner" : "hover:scale-105"
                }`}
              >
                <span className="relative-95 shadow-inner" : "hover:scale-105"
                }`}
              >
                <span className="relative z-10 flex items-center">
                  <Plus z-10 flex items-center">
                  <Plus
                    className={`w
                    className={`w-5 h-5 h-5 mr-2-5 mr-2 transition-transform duration-300 transition-transform duration-300 ${
                      btnAnimation ? "rotate-180" : ""
 ${
                      btnAnimation ? "rotate-180" : ""
                    }`}                    }`}
                  />
                  إ
                  />
                  إضافةضافة امتنان جديد
                </span>
 امتنان جديد
                </span>
                {/* طبقة الن                {/* طبقة النبض الدبض الاخلي */}
داخلي */}
                <span
                <span
                  className="absolute                  className="absolute inset-2 rounded-md bg inset-2-[#b rounded-md bg-[#b73842]/40 animate-inner-pulse"
                 73842]/40 animate-inner-pulse"
                  style={{ transformOrigin: "center style={{ transformOrigin: "center" }}
                ></span>
              </Button>
           " }}
                ></span </div>
          </div>
              </Button>
            </div>
          </div>

         >

          {/* هنا نمرّر د {/* هنا نمرّر دالة الالة الإغإغلاق إلاق إلى PhotoGrid */}
          <PhotoGrid closeSidebar={() => setSidebarOpen(false)} />

لى PhotoGrid */}
          <PhotoGrid closeSidebar={() => setSidebarOpen(false)} />

          <Create          <CreateNewDialog
NewDialog
            open={            open={dialogOpen}
            onOpendialogOpen}
            onOpenChange={setDialogOpen}
            onPhotoAdded={() =>Change={setDialogOpen}
            onPhotoAdded={() => {
 {
              const photoGridElement = document.querySelector              const photo("[data-testid='photo-gridGridElement = document.querySelector("[data-testid='photo-grid']");
              if (photo']");
              if (photoGridElement) {GridElement) {
                window.dispatchEvent(new CustomEvent("photo-added"));
              }
            }}
          />

          {/* زر الإ
                window.dispatchEvent(new CustomEvent("photo-added"));
              }
            }}
          />

          {/* زر الإضافةضافة ال الدائريدائري مع تأثير الن مع تأثير النبضبض */} */}
          <div className="fixed bottom-6 left
          <div className="fixed bottom-6 left-6-6">
            <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-pink bg-pink-500/10 animate-pulse-s-500/10 animate-pulse-slow"></div>
            <low"></div>
            <Button
             Button
              onClick={handleCreateNew}
              variant onClick={handleCreateNew}
              variant="glass"
              size="="glass"
              size="circle"
              className="w-circle"
              className="w-14 h-14 shadow-lg relative"
            >
              <14 h-14 shadow-lg relative"
            >
              <Plus className="w-7Plus className="w-7 h-7 text-white/70 h-7 text-white/70" />
" />
            </Button            </Button>
          </div>
       >
          </div>
        </main>
      </div>
    </main>
      </div>
    </HeartSound </HeartSoundProvider>
  );
Provider>
  );
};

export default Index;
};

export default Index;