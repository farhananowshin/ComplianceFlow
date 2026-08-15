import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import {
  Building2,
  Edit2,
  Globe,
  MapPin,
  CheckCircle2,
  Users,
  Copy,
  Check,
  Briefcase,
  Layers,
  Save,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Company } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getRoleCategory } from '../../lib/permissions';
import toast from 'react-hot-toast';

export default function CompanyManagementView() {
  const { user, currentUser, tenantCompany } = useAuth();
  const activeUser = user || currentUser;
  const isAdmin = getRoleCategory(activeUser?.role) === 'admin';

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    code: '',
    industry: '',
    country: '',
    registrationNumber: '',
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDeptName, setNewDeptName] = useState('');

  const loadCompanyData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getCompanies();
      if (res.success && res.companies && res.companies.length > 0) {
        const currentComp = res.companies[0];
        setCompany(currentComp);
        setFormData({
          name: currentComp.name,
          code: currentComp.code,
          industry: currentComp.industry || 'Corporate & Manufacturing',
          country: currentComp.country || 'United States',
          registrationNumber: currentComp.registrationNumber || 'REG-849201',
        });
        
        // Fetch departments
        const deptsRes = await ApiService.getDepartments(currentComp.id);
        if (deptsRes.success) setDepartments(deptsRes.departments);
      } else if (tenantCompany) {
        setCompany(tenantCompany);
        setFormData({
          name: tenantCompany.name,
          code: tenantCompany.code,
          industry: tenantCompany.industry || 'Corporate',
          country: tenantCompany.country || 'United States',
          registrationNumber: tenantCompany.registrationNumber || 'REG-849201',
        });
        
        // Fetch departments
        const deptsRes = await ApiService.getDepartments(tenantCompany.id);
        if (deptsRes.success) setDepartments(deptsRes.departments);
      }
    } catch (err) {
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  }, [tenantCompany]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      await ApiService.updateCompany(company.id, formData);
      toast.success('Company details updated successfully!');
      setIsEditing(false);
      loadCompanyData();
    } catch (err: any) {
      toast.error('Failed to save company details.');
    }
  };

  const handleCopyCode = () => {
    if (company?.code) {
      navigator.clipboard.writeText(company.code);
      setCopiedCode(true);
      toast.success('Company code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim() || !company) return;
    try {
      const res = await ApiService.createDepartment({ name: newDeptName, companyId: company.id });
      if (res.success) {
        toast.success('Department added');
        setNewDeptName('');
        const deptsRes = await ApiService.getDepartments(company.id);
        if (deptsRes.success) setDepartments(deptsRes.departments);
      }
    } catch (err) {
      toast.error('Failed to add department');
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    try {
      await ApiService.deleteDepartment(deptId);
      toast.success('Department removed');
      if (company) {
        const deptsRes = await ApiService.getDepartments(company.id);
        if (deptsRes.success) setDepartments(deptsRes.departments);
      }
    } catch (err) {
      toast.error('Failed to remove department');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
      </div>
    );
  }

  const companyCode = company?.code || (activeUser as any)?.companyCode || 'COMP-FLOW';
  const companyName = company?.name || activeUser?.companyName || 'Corporate Workspace';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-lg text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Company Information</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your company profile, departments, and employee registration access
            </p>
          </div>
        </div>

        {isAdmin && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Company
          </Button>
        )}
      </div>

      {/* Employee Registration Code Banner */}
      <div className="p-5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Employee Registration Code
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Share this company code with your employees so they can join your company workspace during signup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 font-mono font-bold text-sm text-blue-700 dark:text-blue-300">
            {companyCode}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyCode}
            leftIcon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedCode ? 'Copied' : 'Copy Code'}
          </Button>
        </div>
      </div>

      {/* Company Profile Details */}
      {isEditing ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Edit Company Profile
          </h2>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Company Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manufacturing, Healthcare, Technology"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Registration / Tax ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. REG-849201"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-base">
                  {companyCode.substring(0, 4)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{companyName}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Reg: {formData.registrationNumber || 'REG-849201'}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 dark:divide-slate-800">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Industry Sector</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {formData.industry || 'Manufacturing & Corporate'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Location / Jurisdiction</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {formData.country || 'United States'}
                </span>
              </div>
            </div>
          </div>

          {/* Departments Quick Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" /> Company Departments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active operational units mapped to compliance records
            </p>

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="New Department..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="primary" size="sm" onClick={handleAddDepartment}>Add</Button>
            </div>

            <div className="space-y-2 text-xs">
              {departments.length === 0 ? (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-500 text-center">
                  No departments added yet.
                </div>
              ) : (
                departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                      {isAdmin && (
                        <button onClick={() => handleDeleteDepartment(dept.id)} className="text-slate-400 hover:text-rose-500 transition font-bold px-1">&times;</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
