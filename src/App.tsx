
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { SettingsDropdown } from "./components/SettingsDropdown";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Index from "./pages/Index";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
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
