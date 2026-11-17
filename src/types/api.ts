/** Envelope every backend endpoint responds with. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  meta: PageMeta;
}

/** Query options sent to paginated endpoints (Spring Pageable + filters). */
export interface PageQuery {
  page: number;
  size: number;
  /** Spring sort syntax, e.g. "createdAt,desc". */
  sort?: string;
  /** Raw filter strings, see utils/filters.ts. */
  filters?: string[];
}
