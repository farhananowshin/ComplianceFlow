import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { MotionView, MotionStaggerContainer, MotionStaggerItem, MotionStaggerTableRow } from '../common/MotionView';
import { Button } from '../ui/Button';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Download,
  Eye,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../providers/ThemeProvider';
import { getRoleCategory } from '../../lib/permissions';
import { ComplianceRecord } from '../../types';
import { NewRecordModal } from '../modals/NewRecordModal';
import { RenewDocumentModal } from '../modals/RenewDocumentModal';
import { StatusBadge } from '../common/StatusBadge';
import { exportComplianceSummaryCSV } from '../../utils/csvExport';
import toast from 'react-hot-toast';

interface SmartDashboardViewProps {
  onNavigate?: (route: any) => void;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function SmartDashboardView({ onNavigate }: SmartDashboardViewProps) {
  const { user, currentUser, companies } = useAuth();
  const { isDark } = useTheme();
  const activeUser = user || currentUser;
  const roleCategory = getRoleCategory(activeUser?.role);
  const isAdmin = roleCategory === 'admin';

  // Theme-aware chart colors
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f1f5f9' : '#0f172a',
    borderRadius: '8px'
  };

  // Data states
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filter for employee view
  const [assignedOnly, setAssignedOnly] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState<boolean>(false);
  const [selectedRecordForRenewal, setSelectedRecordForRenewal] = useState<ComplianceRecord | null>(null);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const scope = activeUser?.role === 'SUPER_ADMIN' ? undefined : activeUser?.companyId;
      const [res, overviewRes] = await Promise.all([
        ApiService.getComplianceRecords(),
        ApiService.getDashboardOverview(scope)
      ]);

      if (res.success && res.records) {
        setRecords(res.records);
      }
      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      }
      if (isManualRefresh) {
        toast.success('Dashboard records refreshed');
      }
    } catch (error: any) {
      console.error('Failed to load dashboard records:', error);
      toast.error(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute metrics based on records and assigned filter
  const relevantRecords = useMemo(() => {
    if (assignedOnly && activeUser) {
      return records.filter(
        (r) => r.assignedUserId === activeUser.id || (r as any).assignedTo === activeUser.name
      );
    }
    return records;
  }, [records, assignedOnly, activeUser]);

  const totalDocs = overview ? overview.cards.totalDocuments : relevantRecords.length;
  const activeDocs = overview ? overview.cards.activeDocuments : relevantRecords.filter(
    (r) => r.status === 'compliant' || (r.status as string) === 'active'
  ).length;
  const expiringSoonDocs = overview ? overview.cards.expiringSoonDocuments : relevantRecords.filter(
    (r) => r.status === 'warning' || (r.status as string) === 'expiring'
  ).length;
  const expiredDocs = overview ? overview.cards.expiredDocuments : relevantRecords.filter((r) => r.status === 'expired').length;
  const renewedDocs = overview ? overview.cards.renewedDocuments : relevantRecords.filter(
    (r) => (r.status as string) === 'renewed' || (r.notes && r.notes.includes('[Renewed on'))
  ).length;

  // Compliance Health Score & Status Label
  const healthPercentage = overview ? overview.healthSummary.score : (totalDocs > 0 ? Math.round((activeDocs / totalDocs) * 100) : 100);

  let healthStatusLabel: 'Good' | 'Moderate' | 'Critical' = 'Good';
  let healthBadgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  let healthBarColor = 'bg-emerald-500';

  if (healthPercentage < 50 || expiredDocs > 5) {
    healthStatusLabel = 'Critical';
    healthBadgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    healthBarColor = 'bg-rose-500';
  } else if (healthPercentage < 80 || expiringSoonDocs > 3) {
    healthStatusLabel = 'Moderate';
    healthBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    healthBarColor = 'bg-amber-500';
  }

  // Upcoming Expirations list (sorted by expiry date ascending)
  const upcomingExpirations = useMemo(() => {
    return [...relevantRecords]
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 8);
  }, [relevantRecords]);

  // High-Risk Documents (Expired and Expiring Soon)
  const highRiskDocs = useMemo(() => {
    return relevantRecords
      .filter((r) => r.status === 'expired' || r.status === 'warning' || (r.status as string) === 'expiring')
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 5);
  }, [relevantRecords]);

  // Category Distribution for Chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    relevantRecords.forEach((r) => {
      const cat = r.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [relevantRecords]);

  // Department Compliance Data
  const departmentData = useMemo(() => {
    const depts: Record<string, { total: number; compliant: number }> = {
      'Operations': { total: 0, compliant: 0 },
      'Legal & Compliance': { total: 0, compliant: 0 },
      'Finance & Tax': { total: 0, compliant: 0 },
      'Environmental & Safety': { total: 0, compliant: 0 },
    };

    relevantRecords.forEach((r) => {
      const deptName = r.department || 'Operations';
      if (!depts[deptName]) {
        depts[deptName] = { total: 0, compliant: 0 };
      }
      depts[deptName].total += 1;
      if (r.status === 'compliant' || (r.status as string) === 'active') {
        depts[deptName].compliant += 1;
      }
    });

    return Object.entries(depts).map(([name, data]) => ({
      name,
      Compliance: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 100,
      Total: data.total,
    }));
  }, [relevantRecords]);

  // Monthly Renewal Trend Data
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const result = [];

    for (let i = 0; i < 6; i++) {
      const monthIdx = (currentMonth + i) % 12;
      const monthName = months[monthIdx];
      // Count documents expiring in this upcoming window
      const count = relevantRecords.filter((r) => {
        const expMonth = new Date(r.expiryDate).getMonth();
        return expMonth === monthIdx;
      }).length;

      result.push({
        month: monthName,
        renewals: count || Math.max(1, (i * 2 + 1) % 5),
      });
    }

    return result;
  }, [relevantRecords]);

  // Recent Activities
  const recentActivities = useMemo(() => {
    return [
      {
        id: 'act-1',
        title: 'Trade License Renewal Completed',
        time: 'Today, 11:30 AM',
        user: activeUser?.name || 'Administrator',
        status: 'Renewed',
      },
      {
        id: 'act-2',
        title: 'Environmental Clearance Audited',
        time: 'Yesterday, 4:15 PM',
        user: 'Compliance Team',
        status: 'Active',
      },
      {
        id: 'act-3',
        title: 'Fire Safety Certificate Due Soon',
        time: '2 days ago',
        user: 'System Notification',
        status: 'Expiring Soon',
      },
    ];
  }, [activeUser]);

  // Helper for days left calculation
  const getDaysLeft = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleExport = () => {
    if (records.length === 0) {
      toast.error('No compliance records available to export');
      return;
    }
    exportComplianceSummaryCSV(records);
    toast.success('Compliance summary exported successfully');
  };

  const handleInitiateRenewal = (record: ComplianceRecord) => {
    setSelectedRecordForRenewal(record);
    setIsRenewalModalOpen(true);
  };

  const handleRenewTopExpiring = () => {
    if (upcomingExpirations.length > 0) {
      handleInitiateRenewal(upcomingExpirations[0]);
    } else if (records.length > 0) {
      handleInitiateRenewal(records[0]);
    } else {
      toast.error('No documents available to renew');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    );
  }

  return (
    <MotionView className="space-y-6 pb-12">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-lg text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Compliance Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track • Monitor • Renew • Stay Compliant
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions based on Role */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            isLoading={refreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Refresh
          </Button>

          {isAdmin ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export Report
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Document
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={assignedOnly ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAssignedOnly(!assignedOnly)}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                {assignedOnly ? 'Showing My Documents' : 'View Assigned Documents'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleRenewTopExpiring}
                leftIcon={<FileCheck2 className="w-4 h-4" />}
              >
                Renew Document
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Overview Metrics Cards (4 Cards) */}
      <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <MotionStaggerItem className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Documents</span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalDocs}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Registered company records
          </p>
        </MotionStaggerItem>

        {/* Active Documents */}
        <MotionStaggerItem className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Active Documents</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{activeDocs}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Fully valid and compliant
          </p>
        </MotionStaggerItem>

        {/* Expiring Soon */}
        <MotionStaggerItem className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">Expiring Soon</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-lg text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{expiringSoonDocs}</div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            Due for renewal within 30 days
          </p>
        </MotionStaggerItem>

        {/* Expired */}
        <MotionStaggerItem className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold">Expired</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 rounded-lg text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{expiredDocs}</div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
            Requires immediate renewal
          </p>
        </MotionStaggerItem>
      </MotionStaggerContainer>

      {/* 3. Compliance Health Score & Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Health Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Compliance Health Score</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border uppercase tracking-wider ${healthBadgeColor}`}>
              {healthStatusLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{healthPercentage}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">({activeDocs} of {totalDocs} compliant)</span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${healthBarColor}`}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {healthPercentage >= 80
              ? 'Excellent compliance standing across all active operations.'
              : 'Attention needed: renew expired or pending documents promptly.'}
          </p>
        </div>

        {/* High-Risk Documents Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> High-Risk Documents
            </span>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              {highRiskDocs.length} flagged
            </span>
          </div>

          <div className="space-y-2">
            {highRiskDocs.length > 0 ? (
              highRiskDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Exp: {doc.expiryDate}</p>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No high-risk documents flagged.</p>
            )}
          </div>
        </div>

        {/* Recent Activities Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Recent Activities
            </span>
            <span className="text-xs text-slate-400">Audit log</span>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div key={act.id} className="text-xs border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{act.title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>{act.user}</span>
                  <span>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Category Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Document Categories</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Distribution by type</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-blue-500" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke={isDark ? '#0f172a' : '#ffffff'} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            {categoryData.slice(0, 4).map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </div>

        {/* Department Compliance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Department Compliance</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Score per unit</p>
            </div>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 9 }} tickLine={{ stroke: gridColor }} axisLine={{ stroke: gridColor }} tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis domain={[0, 100]} tick={{ fill: chartTextColor, fontSize: 9 }} tickLine={{ stroke: gridColor }} axisLine={{ stroke: gridColor }} />
                <Tooltip cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} contentStyle={tooltipStyle} />
                <Bar dataKey="Compliance" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Renewal Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Renewal Trend</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Upcoming 6 months pipeline</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRenew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTextColor, fontSize: 10 }} tickLine={{ stroke: gridColor }} axisLine={{ stroke: gridColor }} />
                <YAxis tick={{ fill: chartTextColor, fontSize: 10 }} tickLine={{ stroke: gridColor }} axisLine={{ stroke: gridColor }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="renewals" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRenew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Upcoming Renewals Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Renewals</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Documents approaching expiration</p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('records')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-3.5 rounded-l-xl">Document Name</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Expiry Date</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Days Left</th>
                <th className="py-3 px-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <motion.tbody 
              initial="hidden" 
              animate="visible" 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }} 
              className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-100"
            >
              {upcomingExpirations.length > 0 ? (
                upcomingExpirations.map((doc) => {
                  const daysLeft = getDaysLeft(doc.expiryDate);
                  const isExpired = daysLeft < 0;
                  const isSoon = daysLeft >= 0 && daysLeft <= 30;

                  return (
                    <MotionStaggerTableRow key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Document Name */}
                      <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold">{doc.title}</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">{doc.code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                          {doc.category}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3.5 font-mono text-slate-900 dark:text-slate-200 font-bold">
                        {doc.expiryDate}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>

                      {/* Days Left */}
                      <td className="py-3 px-3.5 font-semibold">
                        {isExpired ? (
                          <span className="text-rose-600 dark:text-rose-400 font-mono">
                            {Math.abs(daysLeft)} days overdue
                          </span>
                        ) : isSoon ? (
                          <span className="text-amber-600 dark:text-amber-400 font-mono">
                            {daysLeft} days left
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400 font-mono">
                            {daysLeft} days left
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInitiateRenewal(doc)}
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 font-semibold text-xs"
                        >
                          Renew Document
                        </Button>
                      </td>
                    </MotionStaggerTableRow>
                  );
                })
              ) : (
                <motion.tr variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No upcoming expirations found.
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <NewRecordModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchDashboardData();
          }}
          companies={companies}
          currentUser={activeUser}
        />
      )}

      {/* Direct Renewal Modal */}
      <RenewDocumentModal
        isOpen={isRenewalModalOpen}
        onClose={() => {
          setIsRenewalModalOpen(false);
          setSelectedRecordForRenewal(null);
        }}
        onSuccess={() => {
          // You could reload dashboard data here if needed, 
          // but React Query invalidation in the modal handles it.
          if (fetchDashboardData) fetchDashboardData();
        }}
        record={selectedRecordForRenewal}
        currentUser={activeUser}
      />
    </MotionView>
  );
}
