
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';
import Spaces from './pages/Spaces';
import SpaceView from './pages/SpaceView';
import InvitationPage from './pages/InvitationPage';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/invitation" element={<InvitationPage />} />
          <Route path="/spaces" element={
            <ProtectedRoute>
              <Spaces />
            </ProtectedRoute>
          } />
          <Route path="/spaces/:spaceId" element={
            <ProtectedRoute>
              <SpaceView />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
