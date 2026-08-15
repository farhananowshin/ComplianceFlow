/**
 * Standardized API Response Structures
 */

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiErrorDetail;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiErrorDetail {
  code?: string;
  details?: unknown;
  stack?: string;
}

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
