import React, { useState, useEffect } from 'react';
import { Search, FileText, Building2, User, RefreshCw, X } from 'lucide-react';
import Modal from '../ui/Modal';
import apiClient from '../../lib/api-client';

export interface SearchTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (route: string) => void;
}

export const SearchTriggerModal: React.FC<SearchTriggerModalProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
        if (res && res.data && res.data.results) {
          setResults(res.data.results);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="-m-5">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records, companies, renewals, users... (Ctrl+K)"
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[350px] overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Searching ComplianceFlow database...</div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onClose();
                  if (item.entityType === 'compliance') onNavigateTo('records');
                  else if (item.entityType === 'company') onNavigateTo('companies');
                  else if (item.entityType === 'renewal') onNavigateTo('renewals');
                  else if (item.entityType === 'user') onNavigateTo('users');
                  else onNavigateTo('dashboard');
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors"
              >
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 shrink-0">
                  {item.entityType === 'compliance' ? (
                    <FileText className="w-4 h-4" />
                  ) : item.entityType === 'company' ? (
                    <Building2 className="w-4 h-4" />
                  ) : item.entityType === 'renewal' ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))
          ) : query ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No search results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Type keywords above to search across all tenant records.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SearchTriggerModal;
