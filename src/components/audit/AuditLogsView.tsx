import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { History, ShieldCheck, Search, Filter, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AuditLog } from '../../types';
import toast from 'react-hot-toast';

export default function AuditLogsView() {
  const { selectedCompanyScope } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      const res = await ApiService.getAuditLogs(scope);
      if (res.success && res.auditLogs) {
        setLogs(res.auditLogs);
      }
    } catch (err) {
      toast.error('Failed to load audit trail logs');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Immutable Audit Trail Logs</h1>
            <p className="text-xs text-slate-400">
              Complete tamper-evident log of all record modifications, renewal advancements, and administrative actions.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit details or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Logged Audit Events: <strong className="text-white">{logs.length}</strong>
        </span>
      </div>

      {/* Logs Timeline Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading audit logs...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Performed By</th>
                <th className="px-5 py-3">Details / Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.userName || 'System Auto'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {(() => {
                      let parsedDetails = null;
                      if (log.details && typeof log.details === 'string') {
                        try {
                          parsedDetails = JSON.parse(log.details);
                        } catch (e) {
                          // Not valid JSON
                        }
                      } else if (log.details && typeof log.details === 'object') {
                        parsedDetails = log.details;
                      }

                      if (parsedDetails) {
                        const actionUpper = log.action.toUpperCase();
                        if (actionUpper === 'LOGIN' || actionUpper === 'LOGOUT') {
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-mono">
                                IP: {parsedDetails.ip || log.ipAddress || 'Unknown'}
                              </span>
                              {parsedDetails.userAgent && (
                                <span className="text-[9px] text-slate-500 truncate max-w-[200px]" title={parsedDetails.userAgent}>
                                  {parsedDetails.userAgent}
                                </span>
                              )}
                            </div>
                          );
                        }
                        if (parsedDetails.documentName || parsedDetails.title) {
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-semibold text-slate-200">
                                {parsedDetails.documentName || parsedDetails.title}
                              </span>
                              {(parsedDetails.code || parsedDetails.notes) && (
                                <span className="text-[10px] text-slate-400">
                                  {parsedDetails.code && <strong className="font-mono text-blue-400 mr-2">{parsedDetails.code}</strong>}
                                  {parsedDetails.notes}
                                </span>
                              )}
                            </div>
                          );
                        }
                        // Generic JSON rendering as small chips
                        return (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(parsedDetails).map(([k, v]) => {
                              if (typeof v === 'object' || k === 'userAgent') return null;
                              return (
                                <span key={k} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
                                  <span className="text-slate-500 font-semibold">{k}:</span> {String(v)}
                                </span>
                              );
                            })}
                          </div>
                        );
                      }
                      
                      return <span className="text-slate-300">{log.details || 'No additional details logged.'}</span>;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
