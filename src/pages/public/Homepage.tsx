import React from 'react';
import {
  ShieldCheck,
  CalendarClock,
  QrCode,
  FileText,
  CheckCircle2,
  ArrowRight,
  Building2,
  Lock,
} from 'lucide-react';

export interface HomepageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
}

export default function Homepage({
  onNavigateLogin,
  onNavigateRegister,
  onSignOut,
  isAuthenticated = false,
}: HomepageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-2 rounded-lg border border-slate-800 dark:border-slate-200 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-slate-100 dark:text-slate-900" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Compliance<span className="text-slate-600 dark:text-slate-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
            <>
              <button
                onClick={onNavigateLogin}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onNavigateRegister}
                className="text-xs font-semibold bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-2xs cursor-pointer"
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={onSignOut}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg transition shadow-2xs cursor-pointer"
            >
              Sign Out
            </button>
          )}
          </div>
        </div>
      </nav>

      <section className="py-20 px-6 max-w-7xl mx-auto text-center md:text-left grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Enterprise Compliance Management
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
            Automate renewals & streamline corporate compliance.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
            Eliminate compliance risks with automated expiry tracking, multi-tenant RBAC, instant QR verification, and smart renewal workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={onNavigateRegister}
              className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-2xs transition cursor-pointer"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium px-6 py-3 rounded-lg transition cursor-pointer"
            >
              Explore Features
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-2xs border border-slate-200/90 dark:border-slate-800">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Compliance Health Index</span>
            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs px-2.5 py-1 rounded-lg font-semibold">98.4% Compliant</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-700 dark:text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Corporate License Renewal</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Expires in 28 days</p>
                </div>
              </div>
              <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium px-2 py-0.5 rounded-lg">Expiring Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">ISO 27001 Audit</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verified & Active</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium px-2 py-0.5 rounded-lg">Active</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Built for Audit-Ready Organizations</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to secure compliance documents and maintain regulatory standards.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <CalendarClock className="w-8 h-8 text-slate-800 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Automated Expiry Alerts</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Receive email and in-app notifications before documents expire.</p>
            </div>
            <div className="p-6 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <QrCode className="w-8 h-8 text-slate-800 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Instant QR Verification</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Public-facing verification endpoints to instantly validate authentic documents.</p>
            </div>
            <div className="p-6 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <Lock className="w-8 h-8 text-slate-800 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Multi-Tenant RBAC</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Role-based controls for Super Admins, Officers, Auditors, and Employees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-950 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Trusted by enterprise teams</p>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Secure compliance operations for complex corporations.</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              ComplianceFlow helps enterprise teams reduce risk, stay audit-ready, and keep every renewal on track across multiple business units.
            </p>
          </div>
          <div className="rounded-lg bg-slate-900 p-6 border border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-5 h-5 text-slate-100" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Compliance score</p>
                <p className="text-2xl font-black text-white">98.4%</p>
              </div>
            </div>
            <div className="grid gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>99.2% uptime for dashboard access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enterprise-grade security controls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time renewal tracking</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-8 shadow-2xs">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold mb-4">Ready to get started?</p>
            <button
              onClick={onNavigateRegister}
              className="w-full bg-white text-slate-900 font-bold text-xs py-3 rounded-lg shadow-2xs hover:bg-slate-100 transition cursor-pointer"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
