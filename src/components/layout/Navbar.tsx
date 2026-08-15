import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, Menu, Building2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import SearchTriggerModal from './SearchTriggerModal';
import { useAuth } from '../../context/AuthContext';

export interface NavbarProps {
  onToggleSidebarMobile?: () => void;
  onNavigateTo: (route: string) => void;
  unreadNotifCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebarMobile,
  onNavigateTo,
  unreadNotifCount = 0,
}) => {
  const { user, currentUser, tenantCompany } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeUser = user || currentUser;
  const companyDisplayName = tenantCompany?.name || activeUser?.companyName || 'Corporate Workspace';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors shadow-2xs">
        {/* Left: Mobile Menu Toggle & Company Info */}
        <div className="flex items-center gap-3">
          {onToggleSidebarMobile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebarMobile}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          )}

          {/* Company Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate max-w-[160px] sm:max-w-[240px]">{companyDisplayName}</span>
          </div>
        </div>

        {/* Center: Global Search Command Palette Bar */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsSearchOpen(true)}
          aria-label="Open search command palette (Control plus K)"
          className="hidden sm:flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all w-64 md:w-80 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" aria-hidden="true" />
            <span className="truncate">Search compliance records...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs">
              Ctrl + K
            </kbd>
          </div>
        </motion.button>

        {/* Right: Actions, Notifications, Theme & User Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Search"
            aria-label="Search records"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          {/* Notifications Bell */}
          <motion.button
            whileHover={{ scale: 1.08, rotate: [0, -10, 10, -5, 0] }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={() => onNavigateTo('notifications')}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            title="Notifications"
            aria-label={`In-App Notifications (${unreadNotifCount} unread)`}
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              </span>
            )}
            <span className="sr-only">{unreadNotifCount} unread notifications</span>
          </motion.button>

          {/* Theme Toggle Switch */}
          <ThemeToggle />

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* User Profile Menu */}
          <UserMenu onNavigateTo={onNavigateTo} />
        </div>
      </header>

      {/* Global Search Palette Modal */}
      <SearchTriggerModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTo={onNavigateTo}
      />
    </>
  );
};

export default Navbar;
