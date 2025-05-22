
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute"; // Changed from named import to default import
import { Toaster } from "./components/ui/toaster";
import { SettingsDropdown } from "./components/SettingsDropdown";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Index from "./pages/Index";
import SettingsPage from "./pages/SettingsPage";
import { useEffect } from "react";
import "./App.css";

const queryClient = new QueryClient();

// Function to apply the saved gradient on app initialization
const applyBackgroundGradient = () => {
  // Get the saved gradient ID from localStorage
  const savedGradientId = localStorage.getItem("app-background-gradient");
  
  if (savedGradientId) {
    // Find the saved gradient in our options
    // Note: This is a simplified version - in a real app, you'd import your gradientOptions array
    const gradientClasses = document.body.classList;
    
    // Apply appropriate styles based on the saved ID
    // Since we can't import the actual options here, we'll rely on the BackgroundSettings component
    // to apply the proper classes when it mounts
    console.log("App: Found saved gradient, will be applied by BackgroundSettings component");
  }
};

function App() {
  // Apply saved gradient when app initializes
  useEffect(() => {
    applyBackgroundGradient();
    
    // Ensure the body takes up the full viewport height
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.height = "100%";
  }, []);

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="absolute left-4 top-4 z-10">
            <SettingsDropdown />
          </div>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
