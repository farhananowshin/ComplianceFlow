import React from 'react';
import ProfileView from '../features/user/ProfileView';

export const UserProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <ProfileView />
    </div>
  );
};

export default UserProfilePage;
