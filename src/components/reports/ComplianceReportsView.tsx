import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { MotionView, MotionStaggerContainer, MotionStaggerItem, MotionStaggerTableRow } from '../common/MotionView';
import { Button } from '../ui/Button';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Search,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  AlertTriangle,
  Building2,
  CalendarDays
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../providers/ThemeProvider';
import { ComplianceRecord } from '../../types';
import { exportRecordsToPDF } from '../../utils/pdfExport';
import toast from 'react-hot-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';


export default function ComplianceReportsView() {
  const { selectedCompanyScope } = useAuth();
  const { isDark } = useTheme();
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Theme-aware chart colors
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f1f5f9' : '#0f172a',
    borderRadius: '12px',
    border: '1px solid',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // all, 30days, 90days, thisYear

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      
      const [resRecords, resDepts] = await Promise.all([
        ApiService.getComplianceRecords(scope).catch(() => ({ success: false, records: [] })),
        ApiService.getDepartments(scope).catch(() => ({ success: false, departments: [] }))
      ]);

      setRecords(Array.isArray(resRecords?.records) ? resRecords.records : []);
      setDepartments(Array.isArray(resDepts?.departments) ? resDepts.departments : []);
    } catch (err) {
      console.error('Report analytics error:', err);
      setError(true);
      setRecords([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope]);

  useEffect(() => {
    let isMounted = true;
    loadData();
    return () => { isMounted = false; };
  }, [loadData]);

  // Derived filtered records based on controls
  const filteredRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    
    return records.filter(record => {
      if (!record) return false;
      
      // 1. Search filter
      const matchesSearch = 
        (record.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (record.code?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      // 2. Department filter
      const matchesDept = selectedDept === 'all' || record.department === selectedDept;
      
      // 3. Date range filter
      let matchesDate = true;
      if (dateRange !== 'all' && record.expiryDate) {
        const expiry = new Date(record.expiryDate);
        if (!isNaN(expiry.getTime())) {
          const today = new Date();
          const diffTime = expiry.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (dateRange === '30days') matchesDate = diffDays >= 0 && diffDays <= 30;
          if (dateRange === '90days') matchesDate = diffDays >= 0 && diffDays <= 90;
          if (dateRange === 'thisYear') matchesDate = expiry.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesDept && matchesDate;
    });
  }, [records, searchQuery, selectedDept, dateRange]);

  // KPI Calculations
  const activeRecords = (filteredRecords || []).filter(r => r?.status === 'ACTIVE');
  const expiringRecords = (filteredRecords || []).filter(r => r?.status === 'EXPIRING_SOON');
  const expiredRecords = (filteredRecords || []).filter(r => r?.status === 'EXPIRED');
  
  const complianceRate = (filteredRecords && filteredRecords.length > 0)
    ? Math.round((activeRecords.length / filteredRecords.length) * 100) 
    : 0;
  
  const urgentExpiries = (filteredRecords || []).filter(r => {
    if (!r?.expiryDate) return false;
    const expiry = new Date(r.expiryDate);
    if (isNaN(expiry.getTime())) return false;
    const diffTime = expiry.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  const activeDeptCount = new Set((filteredRecords || []).map(r => r?.department).filter(Boolean)).size;

  // Chart 1: Donut Status Distribution
  const statusData = [
    { name: 'Active', value: activeRecords.length, color: '#10b981' },
    { name: 'Expiring Soon', value: expiringRecords.length, color: '#f59e0b' },
    { name: 'Expired', value: expiredRecords.length, color: '#f43f5e' },
  ].filter(d => (d?.value || 0) > 0);

  // Chart 2: Expiry Forecast (Group by Month for next 12 months)
  const forecastData = useMemo(() => {
    const data: { [key: string]: number } = {};
    const today = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize next 6 months to 0
    for(let i=0; i<6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      data[key] = 0;
    }
    
    (filteredRecords || []).forEach(r => {
      if (r?.expiryDate && r?.status !== 'EXPIRED') {
        const expiryDate = new Date(r.expiryDate);
        if (!isNaN(expiryDate.getTime())) {
          const key = `${monthNames[expiryDate.getMonth()]} ${expiryDate.getFullYear()}`;
          if (data[key] !== undefined) {
            data[key] += 1;
          }
        }
      }
    });
    
    return Object.keys(data).map(key => ({
      name: key,
      Expiries: data[key]
    }));
  }, [filteredRecords]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Generating Enterprise Analytics...</p>
      </div>
    );
  }

  return (
    <MotionView className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-lg text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Enterprise Analytics & Reports</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive compliance visualizations and dual-format PDF/CSV report exports
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionStaggerItem className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Records</h3>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{filteredRecords.length}</p>
        </MotionStaggerItem>

        <MotionStaggerItem className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Compliance Rate</h3>
            <PieChartIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{complianceRate}%</p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1.5 ml-2">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${complianceRate}%` }}></div>
            </div>
          </div>
        </MotionStaggerItem>

        <MotionStaggerItem className="bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Urgent Expiries</h3>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{urgentExpiries}</p>
        </MotionStaggerItem>

        <MotionStaggerItem className="bg-white dark:bg-slate-900 border-l-4 border-l-indigo-500 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Departments</h3>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{activeDeptCount}</p>
        </MotionStaggerItem>
      </MotionStaggerContainer>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Status Distribution</h3>
          <div className="flex-1 w-full min-h-0">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: chartTextColor }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No data available</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">6-Month Expiry Forecast</h3>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: gridColor }} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: chartTextColor }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={{ stroke: gridColor }} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: chartTextColor }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="Expiries" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records to refine reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative min-w-[150px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Departments</option>
              {(departments || []).map(d => (
                <option key={d?.id || Math.random()} value={d?.name || ''}>{d?.name || 'Unknown'}</option>
              ))}
            </select>
          </div>
          <div className="relative min-w-[150px]">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Time Expiry</option>
              <option value="30days">Next 30 Days</option>
              <option value="90days">Next 90 Days</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Report 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                General
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance Summary</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full breakdown of all matching compliance records across corporate entities.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
                try {
                  await ApiService.exportCsvReport('summary', scope);
                  toast.success('Downloaded Summary CSV');
                } catch (err) {
                  toast.error('Failed to download CSV');
                }
              }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                exportRecordsToPDF(filteredRecords, 'Compliance Summary Report', 'compliance-summary')
              }}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              PDF
            </Button>
          </div>
        </div>

        {/* Report 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                Critical
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expired Licenses Audit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              List of all currently expired or non-compliant licenses requiring renewal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
                try {
                  await ApiService.exportCsvReport('expired', scope);
                  toast.success('Downloaded Expired CSV');
                } catch (err) {
                  toast.error('Failed to download CSV');
                }
              }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                exportRecordsToPDF(expiredRecords, 'Expired Licenses Audit Report', 'expired-licenses')
              }}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs border-transparent"
            >
              PDF
            </Button>
          </div>
        </div>

        {/* Report 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                Audit
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Renewal History Logs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical record of past renewal cycles, dates, and completion timestamps.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
                try {
                  await ApiService.exportCsvReport('renewals', scope);
                  toast.success('Downloaded Renewals CSV');
                } catch (err) {
                  toast.error('Failed to download CSV');
                }
              }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                exportRecordsToPDF(filteredRecords, 'Filtered Renewal History Log', 'renewal-history')
              }}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
            >
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Live Data Preview Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Data Preview</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Showing {filteredRecords.length} records matching current filter criteria
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              exportRecordsToPDF(filteredRecords, 'Custom Report Export', 'custom-report')
            }}
            leftIcon={<FileText className="w-3.5 h-3.5 text-blue-600" />}
          >
            Export Current View
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Status</th>
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
              className="divide-y divide-slate-100 dark:divide-slate-800/60"
            >
              {(filteredRecords || []).length === 0 ? (
                <motion.tr variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                    No records found matching criteria.
                  </td>
                </motion.tr>
              ) : (
                (filteredRecords || []).slice(0, 10).map((r) => (
                  <MotionStaggerTableRow key={r?.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{r?.title || 'Unnamed Record'}</td>
                    <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-400">{r?.code || 'N/A'}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r?.department || '-'}</td>
                    <td className="px-5 py-3 text-right">
                      {r?.status === 'ACTIVE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          ACTIVE
                        </span>
                      )}
                      {r.status === 'EXPIRING_SOON' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          EXPIRING SOON
                        </span>
                      )}
                      {r.status === 'EXPIRED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          EXPIRED
                        </span>
                      )}
                    </td>
                  </MotionStaggerTableRow>
                ))
              )}
            </motion.tbody>
          </table>
          {filteredRecords.length > 10 && (
            <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
              Showing first 10 of {filteredRecords.length} records. Export to view all.
            </div>
          )}
        </div>
      </div>
    </MotionView>
  );
}
