import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleCategory } from '../../lib/permissions';

export const TenantSelector: React.FC = () => {
  const { user, currentUser, tenantCompany, setTenantCompany, companies } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const activeUser = user || currentUser;
  const isAdmin = getRoleCategory(activeUser?.role) === 'admin';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const companyDisplayName = tenantCompany
    ? tenantCompany.name
    : activeUser?.companyName || 'Apex Global Industries';

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
        <span className="max-w-[140px] sm:max-w-[180px] truncate">
          {companyDisplayName}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Switch company context"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all shadow-2xs group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
      >
        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
        <span className="max-w-[120px] sm:max-w-[160px] truncate">
          {tenantCompany ? tenantCompany.name : 'All Companies'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              role="menu"
              aria-orientation="vertical"
              aria-label="Company switcher menu"
              className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-xl py-1.5 z-50 origin-top-left overflow-hidden"
            >
              <div className="px-3.5 py-2 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span>Select Company Scope</span>
                <ShieldCheck className="w-3 h-3 text-blue-500" aria-hidden="true" />
              </div>

              <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setTenantCompany(null);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                    !tenantCompany
                      ? 'font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span>All Companies Scope</span>
                  {!tenantCompany && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
                </button>

                {companies.map((c) => {
                  const isSelected =
                    tenantCompany &&
                    (tenantCompany.id === c.id || (tenantCompany as any)._id === (c as any)._id);

                  return (
                    <button
                      key={c.id || (c as any)._id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setTenantCompany(c);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                        isSelected
                          ? 'font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">
                        {c.code || (c as any).registrationNumber || 'ORG'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantSelector;
