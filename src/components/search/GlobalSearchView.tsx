import React, { useState, useEffect } from 'react';
import { Search, FileText, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { ApiService } from '../../services/api';
import { ComplianceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export default function GlobalSearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await ApiService.globalSearch({ query: query.trim() });
        if (res.success && res.results) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6 text-slate-100 pb-12 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Global Search & Intelligence</h1>
            <p className="text-xs text-slate-400">
              Instant multi-attribute search across license numbers, permit titles, categories, issuing bodies, and notes.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type keyword, license number, authority name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-900 rounded-lg border border-slate-800">
            Searching records...
          </div>
        ) : query.trim() && results.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 rounded-lg border border-slate-800 space-y-2">
            <p className="font-bold text-white text-sm">No Matching Compliance Records Found</p>
            <p>Try searching by permit code, department, or issuing authority.</p>
          </div>
        ) : (
          results.map((rec) => (
            <div
              key={rec.id}
              className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center justify-between gap-4 transition shadow-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-400 font-bold">{rec.code}</span>
                  <StatusBadge status={rec.status} />
                </div>
                <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                <p className="text-xs text-slate-400">{rec.issuingAuthority || rec.category} • Expiry: {rec.expiryDate}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{rec.category}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
