import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  MoreHorizontal,
  RotateCw,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  stickyHeader?: boolean;
}

export const TableBase: React.FC<TableProps> = ({
  children,
  className = '',
  stickyHeader = false,
  ...props
}) => (
  <div className={`w-full overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs custom-scrollbar ${stickyHeader ? 'max-h-[600px] overflow-y-auto' : ''}`}>
    <table className={`w-full text-left text-sm border-collapse ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = '',
  sticky = true,
  ...props
}) => (
  <thead
    className={`bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
      sticky ? 'sticky top-0 z-10' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 ${className}`} {...props}>
    {children}
  </tbody>
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  interactive?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = '',
  selected = false,
  interactive = false,
  ...props
}) => (
  <tr
    className={`transition-colors duration-150 ${
      selected
        ? 'bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/60'
        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
    } ${interactive ? 'cursor-pointer' : ''} ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className = '',
  sortable = false,
  sortDirection = null,
  onSort,
  ...props
}) => (
  <th
    scope="col"
    aria-sort={
      sortable
        ? sortDirection === 'asc'
          ? 'ascending'
          : sortDirection === 'desc'
          ? 'descending'
          : 'none'
        : undefined
    }
    className={`px-4 py-3.5 font-bold tracking-tight text-slate-700 dark:text-slate-200 align-middle ${
      sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500' : ''
    } ${className}`}
    onClick={sortable ? onSort : undefined}
    onKeyDown={
      sortable && onSort
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSort();
            }
          }
        : undefined
    }
    tabIndex={sortable ? 0 : undefined}
    {...props}
  >
    <div className="flex items-center gap-1.5">
      <span>{children}</span>
      {sortable && (
        <span className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          {sortDirection === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          ) : sortDirection === 'desc' ? (
            <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" aria-hidden="true" />
          )}
        </span>
      )}
    </div>
  </th>
);

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  dense?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  dense = false,
  ...props
}) => (
  <td
    className={`text-slate-700 dark:text-slate-300 align-middle ${
      dense ? 'px-3 py-2 text-xs' : 'px-4 py-3.5 text-xs font-medium'
    } ${className}`}
    {...props}
  >
    {children}
  </td>
);

export interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalResults: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  limitOptions?: number[];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  totalPages,
  totalResults,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 25, 50, 100],
}) => {
  const start = totalResults > 0 ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, totalResults);

  return (
    <nav aria-label="Table Pagination" className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-300 rounded-b-xl">
      {/* Left: Results Info & Page Size Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{start}</span> to{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{end}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{totalResults}</span> records
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="table-rows-per-page" className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Rows per page:</label>
            <select
              id="table-rows-per-page"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2 py-1 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="Go to first page"
          title="First Page"
          className="p-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronsLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
          title="Previous Page"
          className="p-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Page Counter Badge */}
        <div className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700/80 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs">
          Page {page} of {totalPages || 1}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Go to next page"
          title="Next Page"
          className="p-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Go to last page"
          title="Last Page"
          className="p-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronsRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

/* Enterprise Table Toolbar Component */
export interface TableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onExport?: () => void;
  children?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search table records...',
  onRefresh,
  isRefreshing = false,
  onExport,
  children,
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
    {/* Left: Search Input */}
    {onSearchChange && (
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-2xs"
        />
      </div>
    )}

    {/* Right: Custom Action Filters, Export, Refresh */}
    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
      {children}

      {onExport && (
        <button
          onClick={onExport}
          className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
          <span>Export</span>
        </button>
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-2xs"
          title="Refresh Data"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      )}
    </div>
  </div>
);

/* Table Skeleton Loading State */
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 5 }) => (
  <TableBody>
    {Array.from({ length: rows }).map((_, rIdx) => (
      <TableRow key={rIdx}>
        {Array.from({ length: columns }).map((_, cIdx) => (
          <TableCell key={cIdx}>
            <div
              className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"
              style={{ width: `${Math.floor(Math.random() * 40) + 50}%` }}
            />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
);

/* Table Empty State */
export interface TableEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  onReset?: () => void;
  resetText?: string;
  colSpan?: number;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  icon,
  title = 'No records found',
  description = 'There are no items matching your filter or search criteria.',
  onReset,
  resetText = 'Clear Filters',
  colSpan = 10,
}) => (
  <TableBody>
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-12">
        <div className="max-w-xs mx-auto space-y-3">
          {icon || <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />}
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          {onReset && (
            <button
              onClick={onReset}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              {resetText}
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
);

/* Table Row Action Dropdown Menu Button */
export interface TableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: { label: string; onClick: () => void; icon?: React.ReactNode }[];
}

export const TableRowActions: React.FC<TableRowActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  extraActions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
            {onView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onView();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                View Details
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onEdit();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Edit Record
              </button>
            )}
            {extraActions.map((act, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  act.onClick();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            ))}
            {onDelete && (
              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onDelete();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Delete Record
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const Table = Object.assign(TableBase, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  HeaderCell: TableHead,
  Cell: TableCell,
  Pagination: TablePagination,
  Toolbar: TableToolbar,
  Skeleton: TableSkeleton,
  EmptyState: TableEmptyState,
  Actions: TableRowActions,
});

export default Table;

