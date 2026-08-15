import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { MotionView, MotionStaggerContainer, MotionStaggerItem } from '../common/MotionView';
import { Button } from '../ui/Button';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck2
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ComplianceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RenewDocumentModal } from '../modals/RenewDocumentModal';
import toast from 'react-hot-toast';

export default function RenewalWorkflowView() {
  const { user, selectedCompanyScope } = useAuth();
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  
  // Modal state
  const [selectedRecordForRenewal, setSelectedRecordForRenewal] = useState<ComplianceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRenewalRecords = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      const res = await ApiService.getComplianceRecords(scope);
      if (res.success && res.records) {
        setRecords(res.records);
      }
    } catch (err: any) {
      toast.error('Failed to load renewal records');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope]);

  useEffect(() => {
    loadRenewalRecords();
  }, [loadRenewalRecords]);

  const safeRecords = records || [];

  // 4 Standard Document Statuses
  const renewalStages = [
    { id: 'all', label: 'All Records', count: safeRecords.length },
    {
      id: 'active',
      label: 'Active',
      count: safeRecords.filter((r) => r.status === 'compliant' || (r.status as string) === 'active').length,
    },
    {
      id: 'expiring',
      label: 'Expiring Soon',
      count: safeRecords.filter((r) => r.status === 'warning' || (r.status as string) === 'expiring').length,
    },
    {
      id: 'expired',
      label: 'Expired',
      count: safeRecords.filter((r) => r.status === 'expired').length,
    },
    {
      id: 'renewed',
      label: 'Renewed',
      count: safeRecords.filter((r) => (r.status as string) === 'renewed' || (r.notes && r.notes.includes('[Renewed on'))).length,
    }
  ];

  const filteredRecords = safeRecords.filter((r) => {
    const title = (r.title || (r as any).documentName || '').toLowerCase();
    const code = (r.code || (r as any).licenseNumber || '').toLowerCase();
    const category = (r.category || '').toLowerCase();
    const search = (searchQuery || '').toLowerCase();

    const matchesSearch = title.includes(search) || code.includes(search) || category.includes(search);

    if (!matchesSearch) return false;

    if (selectedStage === 'active') {
      return r.status === 'compliant' || (r.status as string) === 'active';
    }
    if (selectedStage === 'expiring') {
      return r.status === 'warning' || (r.status as string) === 'expiring';
    }
    if (selectedStage === 'expired') {
      return r.status === 'expired';
    }
    if (selectedStage === 'renewed') {
      return (r.status as string) === 'renewed' || (r.notes && r.notes.includes('[Renewed on'));
    }

    return true;
  });

  const handleStartRenewal = (rec: ComplianceRecord) => {
    setSelectedRecordForRenewal(rec);
    setIsModalOpen(true);
  };

  return (
    <MotionView className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-lg text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Document Renewals</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage document expirations and update validity periods
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadRenewalRecords}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Refresh
        </Button>
      </div>

      {/* Pipeline Status Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {renewalStages.map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStage(st.id)}
            className={`p-3.5 rounded-lg border transition text-left cursor-pointer ${
              selectedStage === st.id
                ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{st.label}</div>
            <div className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>{st.count}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, title, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredRecords.length}</strong> of {safeRecords.length} records
        </span>
      </div>

      {/* Renewal Cards Pipeline */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800/40 rounded-lg border border-slate-300 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center space-y-3 shadow-xs">
          <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No compliance records matched the selected status filter.
          </p>
        </div>
      ) : (
        <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((rec) => {
            const expMs = rec.expiryDate ? new Date(rec.expiryDate).getTime() : 0;
            const isExpired = expMs ? expMs < Date.now() : false;
            const daysLeft = expMs ? Math.ceil((expMs - Date.now()) / 86400000) : 0;

            return (
              <MotionStaggerItem
                key={rec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{rec.code || (rec as any).licenseNumber}</span>
                    <StatusBadge status={rec.status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{rec.title || (rec as any).documentName}</h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{rec.issuingAuthority || rec.category || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Expiry:{' '}
                        <strong className={isExpired ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {rec.expiryDate || 'N/A'}
                        </strong>{' '}
                        {rec.expiryDate && (
                          <span className="text-[10px] text-slate-400">
                            ({isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d remaining`})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartRenewal(rec)}
                    leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Renew Document
                  </Button>
                </div>
              </MotionStaggerItem>
            );
          })}
        </MotionStaggerContainer>
      )}

      {/* Direct Renewal Modal */}
      <RenewDocumentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecordForRenewal(null);
        }}
        onSuccess={() => {
          loadRenewalRecords();
        }}
        record={selectedRecordForRenewal}
        currentUser={user}
      />
    </MotionView>
  );
}
