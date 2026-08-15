import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, FileText, UploadCloud, FileCheck2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ComplianceRecord, User } from '../../types';
import { ApiService } from '../../services/api';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface RenewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: ComplianceRecord | null;
  currentUser: User | null;
}

const renewalSchema = z.object({
  newIssueDate: z.string().min(1, 'Issue date is required'),
  newExpiryDate: z.string().min(1, 'Expiry date is required'),
  notes: z.string().optional(),
}).refine((data) => new Date(data.newExpiryDate) > new Date(data.newIssueDate), {
  message: "Expiry date must be after issue date",
  path: ["newExpiryDate"],
});

type RenewalFormValues = z.infer<typeof renewalSchema>;

export function RenewDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  record,
  currentUser
}: RenewDocumentModalProps) {
  const queryClient = useQueryClient();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const getNextExpiry = () => {
    if (!record) return '';
    const d = new Date(record.expiryDate);
    if (isNaN(d.getTime()) || d.getTime() < Date.now()) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return nextYear.toISOString().slice(0, 10);
    }
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RenewalFormValues>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      newIssueDate: new Date().toISOString().slice(0, 10),
      newExpiryDate: getNextExpiry(),
      notes: ''
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
    }
  };

  const renewalMutation = useMutation({
    mutationFn: async (data: RenewalFormValues) => {
      if (!record || !currentUser) throw new Error('Missing record or user');
      const formData = new FormData();
      formData.append('newIssueDate', data.newIssueDate);
      formData.append('newExpiryDate', data.newExpiryDate);
      if (data.notes) formData.append('notes', data.notes);
      if (uploadedFile) formData.append('file', uploadedFile);

      return ApiService.directRenewComplianceRecord(record.id, formData);
    },
    onSuccess: () => {
      toast.success(`Document "${record?.title || record?.documentName}" successfully renewed!`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      reset();
      setUploadedFile(null);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Renewal failed:', error);
      toast.error(error.message || 'Failed to renew document');
    }
  });

  const onSubmit = (data: RenewalFormValues) => {
    renewalMutation.mutate(data);
  };

  if (!isOpen || !record) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 shadow-2xl relative text-slate-900 dark:text-slate-100"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-lg text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Renew Document
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update document validity period and details
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-4 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {record.title || record.documentName}
                </p>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {record.code || record.licenseNumber}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>Authority: <strong className="text-slate-700 dark:text-slate-300 font-medium">{record.issuingAuthority || 'N/A'}</strong></span>
                <span>Current Expiry: <strong className="text-slate-700 dark:text-slate-300 font-medium">{record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Issue Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('newIssueDate')}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.newIssueDate && <p className="text-rose-500 text-[10px] mt-1">{errors.newIssueDate.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('newExpiryDate')}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.newExpiryDate && <p className="text-rose-500 text-[10px] mt-1">{errors.newExpiryDate.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Renewal Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                {...register('notes')}
                placeholder="e.g., Annual renewal completed with department authority."
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supporting Attachment <span className="text-slate-400 font-normal">(Optional PDF / Image)</span>
              </label>
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-800/30 text-center relative hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <UploadCloud className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">
                    {uploadedFile ? uploadedFile.name : 'Click or drop new certificate to attach'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={renewalMutation.isPending}
                leftIcon={<FileCheck2 className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Renew Document
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
