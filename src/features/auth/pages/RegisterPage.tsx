import React from 'react';
import AuthLayout from '../components/AuthLayout';
import RegisterForm from '../components/RegisterForm';

export interface RegisterPageProps {
  onNavigateLogin: () => void;
  onNavigateView: (view: 'login' | 'register' | 'forgot' | 'reset') => void;
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateLogin,
  onNavigateView,
  onRegisterSuccess,
}) => {
  return (
    <AuthLayout
      title="Register Organization Workspace"
      subtitle="Create a secure multi-tenant account for your company and compliance team."
      activeView="register"
      onNavigateView={onNavigateView}
    >
      <RegisterForm onNavigateLogin={onNavigateLogin} onSuccess={onRegisterSuccess} />
    </AuthLayout>
  );
};

export default RegisterPage;
