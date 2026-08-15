import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, ChevronDown, KeyRound, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../lib/permissions';

export interface UserMenuProps {
  onNavigateTo?: (route: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigateTo }) => {
  const { user, currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const activeUser = user || currentUser;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!activeUser) return null;

  const formattedRoleLabel = getRoleLabel(activeUser.role);

  const handleSelectRoute = (route: string) => {
    setIsOpen(false);
    if (onNavigateTo) {
      onNavigateTo(route);
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative">
      {/* Trigger Button: [User Icon] User Name & Role */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`User account menu for ${activeUser.name}`}
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer shadow-2xs"
      >
        {/* Simple Professional Human / User Icon */}
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>

        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {activeUser.name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {formattedRoleLabel}
          </p>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              role="menu"
              aria-orientation="vertical"
              aria-label="User account options"
              className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1.5 z-50 origin-top-right overflow-hidden"
            >
              {/* User Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {activeUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {activeUser.email}
                    </p>
                    <span className="mt-1 inline-block text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      {formattedRoleLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items: Profile, Change Password, Logout */}
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectRoute('profile')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectRoute('change_password')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="border-t border-slate-100 dark:border-slate-800 p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
