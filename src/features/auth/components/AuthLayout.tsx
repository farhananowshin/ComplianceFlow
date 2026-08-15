import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../../../components/layout/ThemeToggle';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  activeView: 'login' | 'register' | 'forgot' | 'reset';
  onNavigateView?: (view: 'login' | 'register' | 'forgot' | 'reset') => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  activeView,
  onNavigateView,
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="w-full max-w-4xl rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 text-slate-100" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white tracking-tight">ComplianceFlow</h1>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                  Enterprise Platform
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-xl font-semibold text-white leading-snug">
                Automated multi-tenant compliance tracking
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Streamline corporate permits, regulatory renewals, approval workflows, and tenant management in a secure, audit-ready environment.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Multi-tenant data isolation with role-based access control.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Automated 30-day expiration alerts & renewal approval workflows.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Centralized document vault & structured renewal pipelines.</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              256-bit SSL Encrypted
            </span>
            <span>v1.0.0</span>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between mb-6">
              {onNavigateView && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => onNavigateView('login')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeView === 'login'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => onNavigateView('register')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeView === 'register'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Register company
                  </button>
                </div>
              )}
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>

            <div className="mb-5 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>

            {children}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
            Need assistance? Contact your corporate compliance administrator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
