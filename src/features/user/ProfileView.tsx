import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Briefcase, Shield, KeyRound, Save, CheckCircle2, Building2 } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ChangePasswordView from './ChangePasswordView';
import apiClient from '../../lib/api-client';
import { getRoleLabel } from '../../lib/permissions';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid work email required'),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileView: React.FC = () => {
  const { user, currentUser, refreshProfile } = useAuth();
  const activeUser = user || currentUser;
  const [activeTab, setActiveTab] = useState<'details' | 'edit' | 'security'>('details');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: activeUser?.name || '',
      email: activeUser?.email || '',
      phoneNumber: (activeUser as any)?.phoneNumber || '',
      department: (activeUser as any)?.department || '',
    },
  });

  const onSaveProfile = async (data: ProfileFormData) => {
    try {
      if (activeUser?.id) {
        await apiClient.patch(`/users/${activeUser.id}`, data);
      }
      toast.success('Profile updated successfully!');
      if (refreshProfile) await refreshProfile();
      setActiveTab('details');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  if (!activeUser) return null;

  const roleLabel = getRoleLabel(activeUser.role);
  const isAdmin = roleLabel === 'Admin';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card: Simple Human User Icon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {activeUser.name}
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {roleLabel}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{activeUser.email}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Company: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeUser.companyName || 'Corporate Workspace'}</span></p>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-2xs font-bold border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-2xs font-bold border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-2xs font-bold border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'details' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-4 h-4 text-blue-500" /> Account Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeUser.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{activeUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Assigned Role</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{roleLabel}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {(activeUser as any)?.department || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{activeUser.companyName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Shield className="w-4 h-4 text-blue-500" /> Role & Permissions
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-slate-100">Role: {roleLabel}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isAdmin
                    ? 'Administrative privileges: Manage company documents, register records, approve renewals, manage users, view compliance reports and audit logs.'
                    : 'Standard employee privileges: View assigned compliance records, renew documents, view company calendar and alerts.'}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setActiveTab('security')}
                  leftIcon={<KeyRound className="w-4 h-4 text-amber-500" />}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Edit Profile Form */}
      {activeTab === 'edit' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Update Profile Information
          </h3>

          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Work Email"
                type="email"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+1 (555) 019-2834"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                {...register('phoneNumber')}
              />
              <Input
                label="Department"
                placeholder="Operations"
                leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
                {...register('department')}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveTab('details')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                rightIcon={!isSubmitting ? <Save className="w-4 h-4" /> : undefined}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content 3: Change Password */}
      {activeTab === 'security' && <ChangePasswordView />}
    </div>
  );
};

export default ProfileView;
