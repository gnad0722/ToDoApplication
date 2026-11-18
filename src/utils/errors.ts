import axios from 'axios';
import type { ApiErrorBody, FieldErrors } from '@/types/api';

/**
 * Standard error type thrown by every service call.
 * Built from the backend error envelope `{ success: false, data, message }`
 * described in docs/error-response-format.md.
 */
export class ApiError extends Error {
  /** HTTP status; undefined when the server could not be reached. */
  readonly status?: number;
  /** Field -> message map for 400 validation errors, empty otherwise. */
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status?: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isNetworkError() {
    return this.status === undefined;
  }
  get isValidation() {
    return this.status === 400 && Object.keys(this.fieldErrors).length > 0;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isConflict() {
    return this.status === 409;
  }
  get isServerError() {
    return (this.status ?? 0) >= 500;
  }
}

export const NETWORK_ERROR_MESSAGE = 'Cannot reach the server. Check your connection or that the backend is running.';

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource conflicts with existing data.';
    default:
      return status >= 500 ? 'Something went wrong, please try again later.' : 'Request failed.';
  }
}

/** Keeps only string entries of `data`, i.e. the validation field map. */
function extractFieldErrors(data: unknown): FieldErrors {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter((e): e is [string, string] => typeof e[1] === 'string'),
  );
}

/** Builds an ApiError from an error envelope (or any other body shape). */
export function fromErrorBody(status: number, body: unknown): ApiError {
  const b = (body && typeof body === 'object' ? body : {}) as Partial<ApiErrorBody> & { error?: string };
  // Priority: message -> error (Spring default body) -> default text for the status.
  const message = b.message || b.error || defaultMessage(status);
  return new ApiError(message, status, extractFieldErrors(b.data));
}

/** Converts anything thrown (axios error, ApiError, unknown) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) return new ApiError(NETWORK_ERROR_MESSAGE);
    return fromErrorBody(error.response.status, error.response.data);
  }

  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError('Unexpected error.');
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status);
}
