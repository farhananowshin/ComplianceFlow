import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { MotionView } from '../common/MotionView';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Filter,
  RefreshCw,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ComplianceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RenewDocumentModal } from '../modals/RenewDocumentModal';
import toast from 'react-hot-toast';

export default function ComplianceCalendarView() {
  const { user, selectedCompanyScope } = useAuth();
  const queryClient = useQueryClient();

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayRecords, setSelectedDayRecords] = useState<{ dateStr: string; items: ComplianceRecord[] } | null>(null);
  const [renewingRecord, setRenewingRecord] = useState<ComplianceRecord | null>(null);

  // Use React Query for fetching
  const { data: fetchRes, isLoading: loading } = useQuery({
    queryKey: ['documents', selectedCompanyScope],
    queryFn: async () => {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      return await ApiService.getComplianceRecords(scope);
    },
    staleTime: 5 * 60 * 1000 // 5 mins
  });

  const records = fetchRes?.records || [];

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map expiry dates to records
  const recordsByDateMap = useMemo(() => {
    const map: Record<string, ComplianceRecord[]> = {};
    records.forEach((rec) => {
      if (rec.expiryDate) {
        const dateObj = new Date(rec.expiryDate);
        if (!isNaN(dateObj.getTime())) {
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const d = String(dateObj.getDate()).padStart(2, '0');
          const dateKey = `${y}-${m}-${d}`;
          if (!map[dateKey]) map[dateKey] = [];
          map[dateKey].push(rec);
        }
      }
    });
    return map;
  }, [records]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <MotionView className="space-y-6 text-slate-900 dark:text-slate-100 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">Compliance & Expiry Calendar</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Visual monthly schedule of permit expiration dates, regulatory deadlines, and scheduled renewals.
            </p>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToday}
          >
            Today
          </Button>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before 1st day */}
          {[...Array(startDayOfWeek)].map((_, idx) => (
            <div key={`empty-${idx}`} className="h-28 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-200 dark:border-slate-800/40 opacity-30" />
          ))}

          {/* Actual Month Days */}
          {[...Array(daysInMonth)].map((_, idx) => {
            const dayNum = idx + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateKey = `${year}-${monthStr}-${dayStr}`;

            const dayRecords = recordsByDateMap[dateKey] || [];
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <div
                key={dayNum}
                onClick={() => {
                  if (dayRecords.length > 0) {
                    setSelectedDayRecords({ dateStr: dateKey, items: dayRecords });
                  }
                }}
                className={`h-28 p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer relative overflow-hidden ${
                  isToday
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-500/60 ring-1 ring-blue-500/40'
                    : dayRecords.length > 0
                    ? 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-blue-600 text-white font-extrabold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayRecords.length > 0 && (() => {
                    const hasCritical = dayRecords.some(r => (r.riskLevel || '').toLowerCase() === 'critical' || (r.riskLevel || '').toLowerCase() === 'high');
                    const badgeClasses = hasCritical 
                      ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-500/30'
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30';
                    return (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${badgeClasses}`}>
                        {dayRecords.length} due
                      </span>
                    );
                  })()}
                </div>

                {/* Event Indicators */}
                <div className="space-y-1 overflow-y-auto custom-scrollbar max-h-16">
                  {dayRecords.slice(0, 2).map((rec) => {
                    const riskLower = (rec.riskLevel || '').toLowerCase();
                    const isCritical = riskLower === 'critical' || riskLower === 'high';
                    const isMedium = riskLower === 'medium';

                    let colorClasses = 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200 border border-sky-200 dark:border-sky-900 hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors';
                    
                    if (isCritical) {
                      colorClasses = 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-900 hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors';
                    } else if (isMedium) {
                      colorClasses = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors';
                    }

                    return (
                      <div
                        key={rec.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${colorClasses}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                        <span className="truncate">{rec.title || (rec as any).documentName}</span>
                      </div>
                    );
                  })}
                  {dayRecords.length > 2 && (
                    <div className="text-[9px] text-slate-400 font-bold px-1">
                      +{dayRecords.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Items Drawer / Modal */}
      {selectedDayRecords && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Permits Expiring on {selectedDayRecords.dateStr}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedDayRecords.items.length} records scheduled for expiration on this date.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDayRecords(null)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedDayRecords.items.map((rec) => {
                const expMs = rec.expiryDate ? new Date(rec.expiryDate).getTime() : 0;
                const isExpired = expMs ? expMs < Date.now() : false;
                const daysLeft = expMs ? Math.ceil((expMs - Date.now()) / 86400000) : 0;
                
                return (
                  <div
                    key={rec.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{rec.code || (rec as any).licenseNumber}</span>
                        <StatusBadge status={rec.status} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.title || (rec as any).documentName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{rec.issuingAuthority || rec.category}</p>
                      
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Expiry: <strong className="text-slate-900 dark:text-slate-200">{rec.expiryDate}</strong></span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Remaining: <strong className={isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                            {isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setRenewingRecord(rec);
                          setSelectedDayRecords(null);
                        }}
                        leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
                        className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap text-[10px] px-2.5 h-8"
                      >
                        Renew Document
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Direct Renewal Modal */}
      <RenewDocumentModal
        isOpen={!!renewingRecord}
        onClose={() => setRenewingRecord(null)}
        onSuccess={() => {
          setRenewingRecord(null);
          // TanStack query invalidation will handle the refresh inside the modal
        }}
        record={renewingRecord}
        currentUser={user}
      />
    </MotionView>
  );
}
