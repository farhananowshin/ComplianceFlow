import React from 'react';
import AuthLayout from '../components/AuthLayout';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

export interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateResetPassword: (prefilledToken?: string) => void;
  onNavigateView: (view: 'login' | 'register' | 'forgot' | 'reset') => void;
  onBackHome?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateResetPassword,
  onNavigateView,
}) => {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your registered work email to receive password reset instructions"
      activeView="forgot"
      onNavigateView={onNavigateView}
    >
      <ForgotPasswordForm
        onNavigateLogin={onNavigateLogin}
        onNavigateResetPassword={onNavigateResetPassword}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
