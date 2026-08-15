import React, { useState } from 'react';
import AppProviders from './providers/AppProviders';
import { useAuth } from './context/AuthContext';
import Homepage from './pages/public/Homepage';
import LoginPage from './pages/public/Login';
import RegisterPage from './pages/public/Register';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import Workspace from './pages/Workspace';

function MainAppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'homepage' | 'login' | 'register' | 'forgot' | 'reset'>('homepage');
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);

  const handleNavigateHome = () => setAuthView('homepage');
  const handleNavigateLogin = () => setAuthView('login');
  const handleNavigateRegister = () => setAuthView('register');
  const handleNavigateForgot = () => setAuthView('forgot');
  const handleNavigateReset = (token?: string) => {
    setResetToken(token);
    setAuthView('reset');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-200 font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Loading ComplianceFlow...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'homepage') {
      return (
        <Homepage onNavigateLogin={handleNavigateLogin} onNavigateRegister={handleNavigateRegister} />
      );
    }

    if (authView === 'login') {
      return (
        <LoginPage
          onNavigateRegister={handleNavigateRegister}
          onNavigateForgotPassword={handleNavigateForgot}
          onBackHome={handleNavigateHome}
          onSuccess={() => setAuthView('homepage')}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegisterPage
          onNavigateLogin={handleNavigateLogin}
          onBackHome={handleNavigateHome}
          onSuccess={() => setAuthView('homepage')}
        />
      );
    }

    if (authView === 'forgot') {
      return (
        <ForgotPasswordPage
          onNavigateLogin={handleNavigateLogin}
          onNavigateResetPassword={(token) => handleNavigateReset(token)}
          onNavigateView={(view) => {
            if (view === 'login') handleNavigateLogin();
            else if (view === 'register') handleNavigateRegister();
            else if (view === 'forgot') handleNavigateForgot();
            else if (view === 'reset') handleNavigateReset();
          }}
        />
      );
    }

    if (authView === 'reset') {
      return (
        <ResetPasswordPage
          prefilledToken={resetToken}
          onNavigateLogin={handleNavigateLogin}
          onBackHome={handleNavigateHome}
        />
      );
    }

    return null;
  }

  return <Workspace />;
}

export default function App() {
  return (
    <AppProviders>
      <MainAppContent />
    </AppProviders>
  );
}

