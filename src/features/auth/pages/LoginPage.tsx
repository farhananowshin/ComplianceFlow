import React from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

export interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onNavigateView: (view: 'login' | 'register' | 'forgot' | 'reset') => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateForgotPassword,
  onNavigateView,
  onLoginSuccess,
}) => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your enterprise compliance dashboard and records."
      activeView="login"
      onNavigateView={onNavigateView}
    >
      <LoginForm
        onNavigateRegister={onNavigateRegister}
        onNavigateForgotPassword={onNavigateForgotPassword}
        onSuccess={onLoginSuccess}
      />
    </AuthLayout>
  );
};

export default LoginPage;
