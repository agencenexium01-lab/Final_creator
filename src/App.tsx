
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ToolsPage from './pages/ToolsPage';
import GuidePage from './pages/GuidePage';
import RechargeCreditsPage from './pages/RechargeCreditsPage';
import { useAppStore } from './stores/appStore';
import { authService } from './services/authService';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAppStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user && !user.onboarding_completed && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

export default function App() {
  const { setUser, clearUser } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      if (user) {
        setUser(user);
      } else {
        clearUser();
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0A0A14] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A14] text-[#F1F5F9] font-sans selection:bg-[#7C3AED]/30">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/recharge-credits" element={
            <ProtectedRoute>
              <RechargeCreditsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/tools/:toolId" element={
            <ProtectedRoute>
              <ToolsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/guide" element={<GuidePage />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#12121F',
            color: '#F1F5F9',
            border: '1px solid #1E1E3A',
          },
        }} />
      </div>
    </Router>
  );
}
