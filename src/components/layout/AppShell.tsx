import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './Navbar';
import Sidebar, { NavRoute } from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

export interface AppShellProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  children: React.ReactNode;
  warningCount?: number;
  unreadNotifCount?: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  onNavigate,
  children,
  warningCount = 0,
  unreadNotifCount = 0,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={(route) => {
            onNavigate(route);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          warningCount={warningCount}
          unreadCount={unreadNotifCount}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative z-10 w-64 h-full bg-white dark:bg-slate-900 shadow-2xl"
            >
              <Sidebar
                currentRoute={currentRoute}
                onNavigate={(route) => {
                  onNavigate(route);
                  setIsMobileSidebarOpen(false);
                }}
                isCollapsed={false}
                warningCount={warningCount}
                unreadCount={unreadNotifCount}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Navbar */}
        <Navbar
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          onNavigateTo={(route) => onNavigate(route as NavRoute)}
          unreadNotifCount={unreadNotifCount}
        />

        {/* Dynamic Route Workspace View with Page Transitions */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-4">
            <Breadcrumbs currentRoute={currentRoute} onNavigate={onNavigate} />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentRoute}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;

