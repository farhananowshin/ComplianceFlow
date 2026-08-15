import React from 'react';
import AuthLayout from '../components/AuthLayout';
import ResetPasswordForm from '../components/ResetPasswordForm';

export interface ResetPasswordPageProps {
  prefilledToken?: string;
  onNavigateLogin: () => void;
  onBackHome?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  prefilledToken,
  onNavigateLogin,
}) => {
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter your authorization token and choose a secure new password"
      activeView="reset"
      onNavigateView={() => onNavigateLogin()}
    >
      <ResetPasswordForm
        prefilledToken={prefilledToken}
        onNavigateLogin={onNavigateLogin}
        onSuccess={() => {
          setTimeout(() => {
            onNavigateLogin();
          }, 1500);
        }}
      />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
