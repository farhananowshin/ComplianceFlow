import React, { useState, useEffect } from 'react';
import { ComplianceRecord, ComplianceCategory, RiskLevel, Company, User } from '../../types';
import { Modal } from '../common/Modal';
import { ApiService } from '../../services/api';
import { Button } from '../ui/Button';
import { UploadCloud, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRecord?: ComplianceRecord | null;
  companies: Company[];
  currentUser: User | null;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingRecord,
  companies,
  currentUser
}) => {
  const categories: ComplianceCategory[] = [
    'Corporate & Legal',
    'Tax & Financial',
    'Environmental & Safety',
    'Data Privacy & ISO',
    'HR & Labor',
    'Trade & Export',
    'Healthcare & FDA',
    'Operational License'
  ];

  const [formData, setFormData] = useState({
    documentName: '',
    licenseNumber: '',
    companyId: companies[0]?.id || 'comp_01',
    category: 'Corporate & Legal' as ComplianceCategory,
    issuingAuthority: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    renewalFrequency: 'ANNUAL',
    priority: 'medium' as RiskLevel,
    notes: '',
    autoRenewalEnabled: false,
    departmentId: typeof currentUser?.departmentId === 'string' ? currentUser.departmentId : (currentUser?.departmentId?.id || '60c72b2f9b1d8b001c8e4a2a'),
    responsiblePersonId: currentUser?.id || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        documentName: editingRecord.title || '',
        licenseNumber: editingRecord.code || '',
        companyId: editingRecord.companyId,
        category: editingRecord.category,
        issuingAuthority: editingRecord.issuingAuthority,
        issueDate: editingRecord.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        expiryDate: editingRecord.expiryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        renewalFrequency: 'ANNUAL',
        priority: editingRecord.riskLevel || 'medium',
        notes: editingRecord.notes || '',
        autoRenewalEnabled: editingRecord.autoRenewal || false,
        departmentId: typeof currentUser?.departmentId === 'string' ? currentUser.departmentId : (currentUser?.departmentId?.id || '60c72b2f9b1d8b001c8e4a2a'),
        responsiblePersonId: editingRecord.assignedUserId || currentUser?.id || '',
      });
      if (editingRecord.documentUrl) {
        setUploadedFileName(editingRecord.documentUrl.split('/').pop() || 'attached_document.pdf');
      } else {
        setUploadedFileName('');
        setSelectedFile(null);
      }
    } else {
      setFormData({
        documentName: '',
        licenseNumber: 'COMP-' + Math.floor(100000 + Math.random() * 900000),
        companyId: companies[0]?.id || 'comp_01',
        category: 'Corporate & Legal',
        issuingAuthority: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        renewalFrequency: 'ANNUAL',
        priority: 'medium',
        notes: '',
        autoRenewalEnabled: false,
        departmentId: typeof currentUser?.departmentId === 'string' ? currentUser.departmentId : (currentUser?.departmentId?.id || '60c72b2f9b1d8b001c8e4a2a'),
        responsiblePersonId: currentUser?.id || '',
      });
      setUploadedFileName('');
      setSelectedFile(null);
    }
  }, [editingRecord, isOpen, companies, currentUser]);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadedFileName(file.name);
    toast.success(`Attached ${file.name} (Will upload on save)`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('documentName', formData.documentName);
      payload.append('licenseNumber', formData.licenseNumber);
      payload.append('companyId', formData.companyId);
      payload.append('departmentId', formData.departmentId);
      payload.append('category', formData.category);
      payload.append('issuingAuthority', formData.issuingAuthority);
      payload.append('issueDate', formData.issueDate);
      payload.append('expiryDate', formData.expiryDate);
      payload.append('renewalFrequency', formData.renewalFrequency.toUpperCase());
      payload.append('priority', formData.priority.toUpperCase());
      
      if (formData.responsiblePersonId) {
        payload.append('responsiblePersonId', formData.responsiblePersonId);
      }
      if (formData.notes) {
        payload.append('notes', formData.notes);
      }
      payload.append('autoRenewalEnabled', String(formData.autoRenewalEnabled));

      if (selectedFile) {
        payload.append('file', selectedFile);
      }

      if (editingRecord) {
        await ApiService.updateComplianceRecord(editingRecord.id, payload);
        toast.success('Compliance record updated');
      } else {
        await ApiService.createComplianceRecord(payload);
        toast.success('New compliance record created');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? 'Edit Compliance Record' : 'Create Compliance Record'}
      subtitle="Register permit details, expiration dates, and renewal requirements."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title / License Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Trade License Renewal 2026"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Record Code / Reference *
            </label>
            <input
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tenant Company *
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ComplianceCategory })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issuing Authority *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dhaka City Corp / NBR"
              value={formData.issuingAuthority}
              onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expiration Date *
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Risk Level *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as RiskLevel })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Renewal Frequency
            </label>
            <select
              value={formData.renewalFrequency}
              onChange={(e) => setFormData({ ...formData, renewalFrequency: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="ANNUAL">Annual</option>
              <option value="BIANNUAL">Bi-Annual</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Notes & Filing Requirements
          </label>
          <textarea
            rows={2}
            placeholder="Key filing requirements, required documents, or contacts..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Cloudinary Dropzone Proxy */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Document File Attachment (Cloudinary Proxy)
          </label>
          
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-4 text-center bg-slate-50 dark:bg-slate-800/50 transition cursor-pointer relative"
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploadedFileName ? (
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{uploadedFileName || 'Document Attached'}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setUploadedFileName('');
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1">
                <UploadCloud className="w-6 h-6 text-slate-400" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drag & drop document here or <span className="text-blue-500 underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-400">Supports PDF, PNG, JPG, DOCX up to 25MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {editingRecord ? 'Update Record' : 'Save Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
