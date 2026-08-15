import React from 'react';
import { ShieldCheck, ArrowLeft, FileCheck, CalendarClock, Building2, Lock } from 'lucide-react';
import LoginForm from '../../features/auth/components/LoginForm';

export interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onBackHome: () => void;
  onSuccess?: () => void;
}

export default function LoginPage({
  onNavigateRegister,
  onNavigateForgotPassword,
  onBackHome,
  onSuccess,
}: LoginPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 text-white p-2 rounded-lg border border-slate-800 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-slate-100" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Compliance<span className="text-slate-600 dark:text-slate-400">Flow</span>
          </span>
        </div>
        <button
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to homepage</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full my-auto py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side - Brand & Features (Desktop) */}
          <div className="lg:col-span-6 hidden lg:block space-y-8 pr-4">
            <div className="space-y-3">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Enterprise Compliance Platform
              </span>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                Centralized permit & license management for modern organizations.
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Streamline corporate permits, regulatory renewals, approval workflows, and tenant management in a secure, audit-ready environment.
              </p>
            </div>

            {/* Structured Feature Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Structured Document Vault</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Centralize corporate permits, trade licenses, and tax certificates with validity tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Guided Renewal Lifecycle</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track renewal pipelines, cost estimates, vendor assignments, and historic cycles effortlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Role-Based Access Control</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Clear permissions for Organization Admins and Employees.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Multi-tenant data isolation · 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-xs">
              <div className="mb-6 space-y-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight font-display">
                  Sign In to ComplianceFlow
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your credentials to access your workspace.
                </p>
              </div>

              <LoginForm
                onNavigateRegister={onNavigateRegister}
                onNavigateForgotPassword={onNavigateForgotPassword}
                onSuccess={onSuccess}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-2 text-center text-xs text-slate-400 dark:text-slate-600">
        © 2026 ComplianceFlow Enterprise Platform. All rights reserved.
      </footer>
    </div>
  );
}
