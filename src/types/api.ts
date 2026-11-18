/** Envelope every backend endpoint responds with (success and error). */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
}

/**
 * Error envelope (docs/error-response-format.md):
 *  - `data` is null for most errors,
 *  - for 400 validation errors it is a map of request field -> message.
 */
export type FieldErrors = Record<string, string>;
export type ApiErrorBody = ApiResponse<FieldErrors | null>;

export interface PageMeta {
  /** 0-based page index (Spring default). */
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
  /** 0-based page index. */
  page: number;
  size: number;
  /** Spring sort syntax, e.g. "expectStart,asc". Several values = several sort keys. */
  sort?: string | string[];
  /** Filter strings built with utils/filters.ts, e.g. "isDone:EQ:false". */
  filters?: string[];
}
