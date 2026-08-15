import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { QrCode, Search, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Building2, Calendar } from 'lucide-react';
import { ApiService } from '../../services/api';
import { ComplianceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import toast from 'react-hot-toast';

export default function QRVerificationView() {
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<ComplianceRecord | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) {
      toast.error('Please enter a QR token or permit code.');
      return;
    }

    setLoading(true);
    setVerifiedRecord(null);

    try {
      const res = await ApiService.verifyQRCode(qrInput.trim());
      if (res.success && res.record) {
        setVerifiedRecord(res.record);
        toast.success('Permit authenticity verified!');
      } else {
        toast.error(res.message || 'Invalid or unrecognized QR token.');
      }
    } catch (err) {
      toast.error('Verification failed. Token not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12 max-w-3xl mx-auto">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl text-center space-y-3">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/20">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-white">Public QR License Verification</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Instantly verify corporate permits, regulatory license authenticity, and current compliance status.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="flex gap-2 max-w-md mx-auto pt-2">
          <input
            type="text"
            placeholder="Paste QR Token or Permit Code (e.g. LIC-2026-TRD-892)"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
          >
            Verify Token
          </Button>
        </form>
      </div>

      {/* Verified Record Result Display */}
      {verifiedRecord && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Official Verified Digital Permit</h3>
            </div>
            <StatusBadge status={verifiedRecord.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Permit Code</span>
              <p className="font-mono font-bold text-blue-400 text-sm">{verifiedRecord.code}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Title / Permit Name</span>
              <p className="font-bold text-white text-sm">{verifiedRecord.title}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Issuing Authority</span>
              <p className="text-slate-200">{verifiedRecord.issuingAuthority || verifiedRecord.category}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Validity Period</span>
              <p className="text-slate-200 font-bold">
                {verifiedRecord.issueDate} to {verifiedRecord.expiryDate}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Corporate Scope: {verifiedRecord.companyName || 'Apex Holdings Ltd.'}</span>
            <a
              href={`/verify/${verifiedRecord.qrToken || verifiedRecord.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>Open Public Portal Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
